<?php
/**
 * AI single-image REST endpoint with 512px downscale, SSRF denylist, rate limit.
 *
 * @package Matcha_AI_Smart_Gallery\AI
 */


namespace Matcha_AI_Smart_Gallery\AI;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


use Matcha_AI_Smart_Gallery\Plugin;
use Matcha_AI_Smart_Gallery\Media\Attachment_Metadata;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Handles POST /matcha-gallery/v1/ai/analyze
 */
final class AI_REST {

	/**
	 * Register routes.
	 */
	public static function register(): void {
		add_action( 'rest_api_init', array( static::class, 'register_routes' ) );
	}

	/**
	 * Register REST routes.
	 */
	public static function register_routes(): void {
		register_rest_route(
			'matcha-gallery/v1',
			'/ai/analyze',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( static::class, 'handle_analyze' ),
				'permission_callback' => array( static::class, 'can_analyze' ),
				'args'                => array(
					'attachment_id' => array(
						'type'              => 'integer',
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
					'overwrite'     => array(
						'type'     => 'boolean',
						'required' => false,
						'default'  => false,
					),
				),
			)
		);

		register_rest_route(
			'matcha-gallery/v1',
			'/attachments-meta',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( static::class, 'handle_attachments_meta' ),
				'permission_callback' => array( static::class, 'can_analyze' ),
				'args'                => array(
					'ids' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			'matcha-gallery/v1',
			'/attachments-meta/update',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( static::class, 'handle_update_attachments_meta' ),
				'permission_callback' => static function () {
					return current_user_can( 'upload_files' );
				},
			)
		);
	}

	/**
	 * Capability + rate limit check.
	 *
	 * @return bool|WP_Error
	 */
	public static function can_analyze() {
		if ( ! current_user_can( 'upload_files' ) ) {
			return new WP_Error( 'forbidden', __( 'You do not have permission to analyze images.', 'matcha-gallery' ), array( 'status' => 403 ) );
		}

		// Rate limit: 60 per minute per user (supports smooth batch processing).
		$user_id   = get_current_user_id();
		$transient = 'matcha_ai_limit_' . $user_id;
		$count     = (int) get_transient( $transient );
		if ( $count >= 60 ) {
			return new WP_Error( 'rate_limited', __( 'Rate limit reached (max 60/min). Please wait a moment.', 'matcha-gallery' ), array( 'status' => 429 ) );
		}
		// Increment (or set 60s window)
		if ( false === get_transient( $transient ) ) {
			set_transient( $transient, 1, 60 );
		} else {
			set_transient( $transient, $count + 1, 60 );
		}

		return true;
	}

	/**
	 * Handle analyze request.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function handle_analyze( WP_REST_Request $request ) {
		$attachment_id = (int) $request->get_param( 'attachment_id' );
		$overwrite     = (bool) $request->get_param( 'overwrite' );

		if ( ! wp_attachment_is_image( $attachment_id ) ) {
			return new WP_Error( 'invalid_image', __( 'Attachment is not an image.', 'matcha-gallery' ), array( 'status' => 400 ) );
		}

		if ( empty( Plugin::get_setting( 'api_key', '' ) ) ) {
			return new WP_Error( 'no_api_key', __( 'No API key configured. Go to Matcha AI → AI Settings.', 'matcha-gallery' ), array( 'status' => 400 ) );
		}

		// SSRF guard on endpoint URL before any remote call.
		$endpoint = Plugin::get_setting( 'api_endpoint', 'https://api.openai.com/v1/chat/completions' );
		$ssrf     = self::validate_endpoint_url( $endpoint );
		if ( is_wp_error( $ssrf ) ) {
			return $ssrf;
		}

		// Generate metadata via pipeline with 512px resize.
		try {
			$generator = new Metadata_Generator();
			// Inject resized source (overrides internal get_image_source via filter)
			add_filter( 'matcha_gallery_ai_image_source_override', array( static::class, 'filter_image_source' ), 10, 2 );
			// Temporarily store attachment id for filter context
			$GLOBALS['matcha_ai_filter_ctx'] = $attachment_id;

			$metadata = $generator->generate( $attachment_id );

			remove_filter( 'matcha_gallery_ai_image_source_override', array( static::class, 'filter_image_source' ), 10 );
			unset( $GLOBALS['matcha_ai_filter_ctx'] );

			// Respect overwrite flag
			$overwrite_setting = $overwrite || Plugin::get_setting( 'overwrite_existing', false );
			Attachment_Metadata::save_metadata(
				$attachment_id,
				$metadata,
				array( 'overwrite' => $overwrite_setting )
			);

			return new WP_REST_Response(
				array(
					'success'  => true,
					'metadata' => $metadata,
				),
				200
			);
		} catch ( \RuntimeException $e ) {
			$msg = $e->getMessage();
			// Map 429 to 429 with retryable flag
			$status = str_contains( $msg, '429' ) || str_contains( strtolower( $msg ), 'rate' ) ? 429 : 500;
			return new WP_Error(
				'ai_error',
				$msg,
				array(
					'status'    => $status,
					'retryable' => 429 === $status,
				)
			);
		}
	}

	/**
	 * Filter to provide 512px downscaled base64 source.
	 *
	 * @param string|null $source Current source (null to generate).
	 * @param int         $attachment_id Attachment ID from context.
	 * @return string Base64 data URI.
	 */
	public static function filter_image_source( $source, int $attachment_id ): string {
		// Prefer 512px resize to keep payload ~70KB vs 5MB.
		$sized = self::get_resized_base64( $attachment_id, 512 );
		if ( null !== $sized ) {
			return $sized;
		}
		// Fallback: let generator do its default
		return $source ?? '';
	}

	/**
	 * Get 512px longest-side base64 data URI.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @param int $max_size Max dimension.
	 * @return string|null Data URI or null on failure.
	 */
	public static function get_resized_base64( int $attachment_id, int $max_size = 512 ): ?string {
		$file = get_attached_file( $attachment_id );
		if ( ! $file || ! file_exists( $file ) ) {
			return null;
		}

		// Try WP image editor resize (preserves aspect).
		$editor = wp_get_image_editor( $file );
		if ( ! is_wp_error( $editor ) ) {
			$size = $editor->get_size();
			if ( $size ) {
				$w = $size['width'];
				$h = $size['height'];
				if ( $w > $max_size || $h > $max_size ) {
					$editor->resize( $max_size, $max_size, false );
					$tmp = $editor->save( null, 'image/jpeg' );
					if ( ! is_wp_error( $tmp ) && ! empty( $tmp['path'] ) && file_exists( $tmp['path'] ) ) {
						// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
						$data = file_get_contents( $tmp['path'] );
						wp_delete_file( $tmp['path'] );
						if ( false !== $data ) {
							return 'data:image/jpeg;base64,' . base64_encode( $data ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
						}
					}
				}
			}
		}

		// Fallback: try intermediate size `medium`/`medium_large` file if editor failed
		foreach ( array( 'medium_large', 'medium' ) as $size_name ) {
			$src = wp_get_attachment_image_src( $attachment_id, $size_name );
			if ( $src ) {
				$upload_dir = wp_get_upload_dir();
				$relative   = str_replace( $upload_dir['baseurl'], '', $src[0] );
				$candidate  = $upload_dir['basedir'] . $relative;
				if ( file_exists( $candidate ) ) {
					// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
					$data = file_get_contents( $candidate );
					if ( false !== $data ) {
						$mime = wp_get_image_mime( $candidate ) ?: 'image/jpeg';
						return 'data:' . $mime . ';base64,' . base64_encode( $data ); // phpcs:ignore
					}
				}
			}
		}

		return null;
	}

	/**
	 * Batch fetch attachment keywords + AI status (for Studio).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function handle_attachments_meta( WP_REST_Request $request ): WP_REST_Response {
		$ids_raw = $request->get_param( 'ids' ) ?? '';
		$ids     = array_slice( array_filter( array_map( 'intval', explode( ',', (string) $ids_raw ) ) ), 0, 150 );
		$data    = array();
		if ( ! empty( $ids ) ) {
			update_postmeta_cache( $ids );
			update_object_term_cache( $ids, 'attachment' );
			foreach ( $ids as $id ) {
				$meta = Attachment_Metadata::get_metadata( $id );
				$data[ (string) $id ] = array(
					'keywords'     => $meta['keywords'],
					'ai_generated' => $meta['ai_generated'],
					'alt'          => $meta['alt_text'],
					'title'        => $meta['title'],
					'caption'      => $meta['caption'],
					'colors'       => $meta['colors'] ?? array(),
					'focal_point'  => $meta['focal_point'] ?? array( 'x' => 50, 'y' => 50 ),
				);
			}
		}
		return new WP_REST_Response( $data, 200 );
	}

	/**
	 * Handle bulk update of attachment metadata.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function handle_update_attachments_meta( WP_REST_Request $request ): WP_REST_Response {
		$updates = (array) $request->get_param( 'updates' );
		if ( empty( $updates ) ) {
			return new WP_REST_Response( array( 'success' => true ), 200 );
		}

		foreach ( $updates as $id => $meta ) {
			$att_id = (int) $id;
			if ( $att_id <= 0 || ! wp_attachment_is_image( $att_id ) ) {
				continue;
			}
			$data = array(
				'alt_text' => sanitize_text_field( $meta['alt'] ?? '' ),
				'title'    => sanitize_text_field( $meta['title'] ?? '' ),
				'caption'  => sanitize_textarea_field( $meta['caption'] ?? '' ),
				'keywords' => isset( $meta['keywords'] ) && is_array( $meta['keywords'] ) ? array_values( array_filter( array_map( 'sanitize_text_field', $meta['keywords'] ) ) ) : array(),
			);
			Attachment_Metadata::save_metadata( $att_id, $data, array( 'overwrite' => true ) );
		}

		return new WP_REST_Response( array( 'success' => true ), 200 );
	}

	/**
	 * Validate endpoint URL for SSRF.
	 *
	 * @param string $url URL.
	 * @return true|WP_Error
	 */
	public static function validate_endpoint_url( string $url ) {
		if ( empty( $url ) || ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
			return new WP_Error( 'invalid_endpoint', __( 'Invalid API endpoint URL.', 'matcha-gallery' ), array( 'status' => 400 ) );
		}
		$parts = wp_parse_url( $url );
		$host  = $parts['host'] ?? '';
		if ( empty( $host ) ) {
			return new WP_Error( 'invalid_endpoint', __( 'Invalid API endpoint URL.', 'matcha-gallery' ), array( 'status' => 400 ) );
		}

		// Block private ranges via DNS lookup if host is not known public API.
		// Allow-list known hosts without DNS check.
		$allow_hosts = array( 'api.openai.com', 'api.anthropic.com', 'generativelanguage.googleapis.com', 'openrouter.ai' );
		if ( in_array( strtolower( $host ), $allow_hosts, true ) ) {
			return true;
		}

		// For custom hosts, resolve and check IP.
		$ip = gethostbyname( $host );
		if ( $ip !== $host ) {
			if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) === false ) {
				return new WP_Error( 'ssrf_blocked', __( 'API endpoint resolves to a private IP — blocked for security.', 'matcha-gallery' ), array( 'status' => 400 ) );
			}
		}

		// Also block literal private IPs.
		if ( filter_var( $host, FILTER_VALIDATE_IP ) && filter_var( $host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) === false ) {
			return new WP_Error( 'ssrf_blocked', __( 'Private IP endpoints are not allowed.', 'matcha-gallery' ), array( 'status' => 400 ) );
		}

		return true;
	}
}
