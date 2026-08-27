<?php
/**
 * AI Metadata Generator.
 *
 * Orchestrates loading an image, calling the AI client, and returning structured metadata.
 *
 * @package Matcha_AI_Smart_Gallery\AI
 */


namespace Matcha_AI_Smart_Gallery\AI;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


use Matcha_AI_Smart_Gallery\Plugin;

/**
 * Generates AI metadata for a WordPress attachment.
 */
class Metadata_Generator {

	/**
	 * AI client instance.
	 *
	 * @var Client_Interface
	 */
	private Client_Interface $client;

	/**
	 * Constructor.
	 *
	 * @param Client_Interface|null $client Optional AI client. Defaults to OpenAI_Client.
	 */
	public function __construct( ?Client_Interface $client = null ) {
		$client = apply_filters( 'matcha_gallery_ai_client', $client );

		if ( null === $client ) {
			$key      = Plugin::get_setting( 'api_key', '' );
			$model    = Plugin::get_setting( 'api_model', '' );
			$endpoint = Plugin::get_setting( 'api_endpoint', '' );

			if ( str_starts_with( $key, 'AIza' ) || str_contains( $endpoint, 'googleapis.com' ) || str_contains( strtolower( $model ), 'gemini' ) ) {
				$this->client = new Gemini_Client( $key, $model );
			} else {
				$this->client = new OpenAI_Client( $key, $model, $endpoint );
			}
		} else {
			$this->client = $client;
		}
	}

	/**
	 * Generate metadata for an attachment.
	 *
	 * @param int $attachment_id WordPress attachment post ID.
	 * @return array{alt_text: string, title: string, caption: string, keywords: list<string>}
	 * @throws \RuntimeException If the attachment is not an image or AI call fails.
	 */
	public function generate( int $attachment_id ): array {
		if ( ! wp_attachment_is_image( $attachment_id ) ) {
			throw new \RuntimeException(
				sprintf(
					/* translators: %d: Attachment ID. */
					esc_html__( 'Matcha AI: Attachment %d is not an image.', 'matcha-gallery' ),
					absint( $attachment_id )
				)
			);
		}

		// Allow REST handler to inject 512px resized source (saves payload ~90%).
		$override = apply_filters( 'matcha_gallery_ai_image_source_override', null, $attachment_id );
		if ( is_string( $override ) && '' !== $override ) {
			$image_source = $override;
		} else {
			$image_source = $this->get_image_source( $attachment_id );
		}
		$options      = $this->build_options();

		/**
		 * Filters the options passed to the AI client before analysis.
		 *
		 * @param array<string, mixed> $options       Analysis options.
		 * @param int                  $attachment_id Attachment ID.
		 */
		$options = apply_filters( 'matcha_gallery_ai_options', $options, $attachment_id );

		$metadata = $this->client->analyze_image( $image_source, $options );

		/**
		 * Filters the AI-generated metadata before it's returned.
		 *
		 * @param array{alt_text: string, title: string, caption: string, keywords: list<string>} $metadata      Generated metadata.
		 * @param int                                                                              $attachment_id Attachment ID.
		 */
		return apply_filters( 'matcha_gallery_ai_metadata', $metadata, $attachment_id );
	}

	/**
	 * Get the image source (base64-encoded data) for the AI client.
	 *
	 * Prefers the 'large' size to save API tokens; falls back to 'medium', then 'full'.
	 *
	 * @param int $attachment_id Attachment post ID.
	 * @return string Base64-encoded image data.
	 * @throws \RuntimeException If the image file cannot be read.
	 */
	private function get_image_source( int $attachment_id ): string {
		// Try intermediate sizes first to reduce token cost.
		$preferred_sizes = array( 'large', 'medium_large', 'medium', 'full' );
		$file_path       = '';

		foreach ( $preferred_sizes as $size ) {
			if ( 'full' === $size ) {
				$file_path = get_attached_file( $attachment_id );
				break;
			}

			$src = wp_get_attachment_image_src( $attachment_id, $size );
			if ( $src ) {
				// Convert URL to file path.
				$upload_dir = wp_get_upload_dir();
				$relative   = str_replace( $upload_dir['baseurl'], '', $src[0] );
				$candidate  = $upload_dir['basedir'] . $relative;

				if ( file_exists( $candidate ) ) {
					$file_path = $candidate;
					break;
				}
			}
		}

		if ( empty( $file_path ) || ! file_exists( $file_path ) ) {
			throw new \RuntimeException(
				sprintf(
					/* translators: %d: Attachment ID. */
					esc_html__( 'Matcha AI: Could not locate image file for attachment %d.', 'matcha-gallery' ),
					absint( $attachment_id )
				)
			);
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$image_data = file_get_contents( $file_path );

		if ( false === $image_data ) {
			throw new \RuntimeException(
				sprintf(
					/* translators: %s: File path. */
					esc_html__( 'Matcha AI: Could not read image file: %s', 'matcha-gallery' ),
					esc_html( $file_path )
				)
			);
		}

		$mime_type = wp_get_image_mime( $file_path ) ?: 'image/jpeg';

		return 'data:' . $mime_type . ';base64,' . base64_encode( $image_data ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
	}

	/**
	 * Build analysis options from plugin settings.
	 *
	 * @return array<string, mixed>
	 */
	private function build_options(): array {
		$fields = array();

		if ( Plugin::get_setting( 'generate_alt', true ) ) {
			$fields[] = 'alt_text';
		}
		if ( Plugin::get_setting( 'generate_title', true ) ) {
			$fields[] = 'title';
		}
		if ( Plugin::get_setting( 'generate_caption', true ) ) {
			$fields[] = 'caption';
		}
		if ( Plugin::get_setting( 'generate_tags', true ) ) {
			$fields[] = 'keywords';
		}

		return array(
			'locale' => Plugin::get_setting( 'locale', 'en' ),
			'fields' => $fields,
		);
	}
}
