<?php
/**
 * Media Library integration for AI metadata generation.
 *
 * Hooks into upload, bulk actions, and attachment edit screens.
 *
 * @package Matcha_AI_Smart_Gallery\Admin
 */


namespace Matcha_AI_Smart_Gallery\Admin;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


use Matcha_AI_Smart_Gallery\Plugin;
use Matcha_AI_Smart_Gallery\AI\Metadata_Generator;
use Matcha_AI_Smart_Gallery\Media\Attachment_Metadata;

/**
 * Registers media library hooks for AI metadata generation.
 */
class Media_Actions {

	/**
	 * AJAX action name.
	 */
	private const AJAX_ACTION = 'matcha_generate_ai_metadata';

	/**
	 * Nonce action name.
	 */
	private const NONCE_ACTION = 'matcha_ai_generate';

	/**
	 * Register all hooks.
	 */
	public static function register(): void {
		// Auto-generate on upload.
		add_action( 'add_attachment', array( static::class, 'on_attachment_upload' ) );

		// Bulk actions.
		add_filter( 'bulk_actions-upload', array( static::class, 'add_bulk_action' ) );
		add_filter( 'handle_bulk_actions-upload', array( static::class, 'handle_bulk_action' ), 10, 3 );
		add_action( 'admin_notices', array( static::class, 'bulk_action_notice' ) );

		// Per-image AI button on attachment edit.
		add_filter( 'attachment_fields_to_edit', array( static::class, 'add_ai_button_field' ), 10, 2 );

		// AJAX handler.
		add_action( 'wp_ajax_' . self::AJAX_ACTION, array( static::class, 'ajax_generate' ) );

		// Custom column on upload.php list table.
		add_filter( 'manage_media_columns', array( static::class, 'add_media_columns' ) );
		add_action( 'manage_media_custom_column', array( static::class, 'render_media_columns' ), 10, 2 );

		// Enqueue admin script on media pages.
		add_action( 'admin_enqueue_scripts', array( static::class, 'enqueue_admin_scripts' ) );
	}

	/**
	 * Enqueue admin scripts on media-related pages.
	 *
	 * @param string $hook_suffix Current admin page hook suffix.
	 */
	public static function enqueue_admin_scripts( string $hook_suffix ): void {
		$media_pages = array( 'upload.php', 'post.php', 'post-new.php', 'media-upload-popup' );

		if ( ! in_array( $hook_suffix, $media_pages, true ) && 'attachment' !== get_post_type() ) {
			return;
		}

		wp_enqueue_style(
			'matcha-admin',
			MATCHA_GALLERY_URL . 'assets/css/admin.css',
			array(),
			MATCHA_GALLERY_VERSION
		);

		// Inline script for the per-image AI generate button.
		wp_add_inline_script(
			'jquery',
			self::get_inline_script()
		);
	}

	/**
	 * Auto-generate metadata on image upload.
	 *
	 * @param int $attachment_id New attachment post ID.
	 */
	public static function on_attachment_upload( int $attachment_id ): void {
		// Only process if auto-generate is enabled.
		if ( ! Plugin::get_setting( 'auto_generate', false ) ) {
			return;
		}

		// Only process images.
		if ( ! wp_attachment_is_image( $attachment_id ) ) {
			return;
		}

		// Only process if API key is configured.
		if ( empty( Plugin::get_setting( 'api_key', '' ) ) ) {
			return;
		}

		// Only process if metadata is missing.
		if ( ! Attachment_Metadata::needs_metadata( $attachment_id ) ) {
			return;
		}

		try {
			$generator = new Metadata_Generator();
			$metadata  = $generator->generate( $attachment_id );

			Attachment_Metadata::save_metadata(
				$attachment_id,
				$metadata,
				array( 'overwrite' => Plugin::get_setting( 'overwrite_existing', false ) )
			);
		} catch ( \RuntimeException $e ) {
			// Log but don't block the upload.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( 'Matcha AI Smart Gallery: Auto-generate failed for attachment ' . $attachment_id . ' — ' . $e->getMessage() );
		}
	}

	/**
	 * Add "Generate AI Metadata" to the bulk actions dropdown.
	 *
	 * @param array<string, string> $actions Existing bulk actions.
	 * @return array<string, string>
	 */
	public static function add_bulk_action( array $actions ): array {
		$actions['matcha_generate_ai'] = __( 'Generate AI Metadata', 'matcha-gallery' );
		return $actions;
	}

	/**
	 * Handle the bulk action.
	 *
	 * @param string    $redirect_url Redirect URL.
	 * @param string    $action       The bulk action being performed.
	 * @param list<int> $post_ids     Selected post IDs.
	 * @return string Modified redirect URL.
	 */
	public static function handle_bulk_action( string $redirect_url, string $action, array $post_ids ): string {
		if ( 'matcha_generate_ai' !== $action ) {
			return $redirect_url;
		}

		if ( ! current_user_can( 'upload_files' ) ) {
			return $redirect_url;
		}

		if ( empty( Plugin::get_setting( 'api_key', '' ) ) ) {
			return add_query_arg( 'matcha_bulk_error', 'no_api_key', $redirect_url );
		}

		$generator = new Metadata_Generator();
		$processed = 0;
		$errors    = 0;

		foreach ( $post_ids as $post_id ) {
			$post_id = (int) $post_id;

			if ( ! wp_attachment_is_image( $post_id ) || ! current_user_can( 'edit_post', $post_id ) ) {
				continue;
			}

			try {
				$metadata = $generator->generate( $post_id );

				Attachment_Metadata::save_metadata(
					$post_id,
					$metadata,
					array( 'overwrite' => Plugin::get_setting( 'overwrite_existing', false ) )
				);

				++$processed;
			} catch ( \RuntimeException $e ) {
				++$errors;
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( 'Matcha AI Bulk: Failed for attachment ' . $post_id . ' — ' . $e->getMessage() );
			}
		}

		$redirect_url = add_query_arg( 'matcha_bulk_processed', $processed, $redirect_url );

		if ( $errors > 0 ) {
			$redirect_url = add_query_arg( 'matcha_bulk_errors', $errors, $redirect_url );
		}

		return $redirect_url;
	}

	/**
	 * Show admin notice after bulk action.
	 */
	public static function bulk_action_notice(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Display-only; no state change.
		if ( isset( $_GET['matcha_bulk_error'] ) && 'no_api_key' === $_GET['matcha_bulk_error'] ) {
			printf(
				'<div class="notice notice-error is-dismissible"><p>%s</p></div>',
				esc_html__( 'Matcha AI: No API key configured. Please set your API key in Settings → Matcha AI Gallery.', 'matcha-gallery' )
			);
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! isset( $_GET['matcha_bulk_processed'] ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$processed = (int) $_GET['matcha_bulk_processed'];
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$errors = isset( $_GET['matcha_bulk_errors'] ) ? (int) $_GET['matcha_bulk_errors'] : 0;

		$message = sprintf(
			/* translators: %d: Number of images processed. */
			_n(
				'Matcha AI: Generated metadata for %d image.',
				'Matcha AI: Generated metadata for %d images.',
				$processed,
				'matcha-gallery'
			),
			$processed
		);

		if ( $errors > 0 ) {
			$message .= ' ' . sprintf(
				/* translators: %d: Number of errors. */
				_n(
					'%d image failed (check error log).',
					'%d images failed (check error log).',
					$errors,
					'matcha-gallery'
				),
				$errors
			);
		}

		printf(
			'<div class="notice notice-%s is-dismissible"><p>%s</p></div>',
			$errors > 0 ? 'warning' : 'success',
			esc_html( $message )
		);
	}

	/**
	 * Add custom columns to Media list table.
	 *
	 * @param array<string, string> $columns Existing columns.
	 * @return array<string, string>
	 */
	public static function add_media_columns( array $columns ): array {
		$columns['matcha_ai_keywords'] = __( '🍵 AI Keywords', 'matcha-gallery' );
		return $columns;
	}

	/**
	 * Render custom column on Media list table.
	 *
	 * @param string $column_name Column name.
	 * @param int    $post_id     Attachment ID.
	 */
	public static function render_media_columns( string $column_name, int $post_id ): void {
		if ( 'matcha_ai_keywords' !== $column_name || ! wp_attachment_is_image( $post_id ) ) {
			return;
		}

		$metadata = Attachment_Metadata::get_metadata( $post_id );

		if ( ! empty( $metadata['keywords'] ) ) {
			echo '<div style="display:flex; flex-wrap:wrap; gap:4px;">';
			foreach ( array_slice( $metadata['keywords'], 0, 5 ) as $kw ) {
				printf(
					'<span style="background:#e8f5e9; color:#2e7d32; font-size:11px; font-weight:600; padding:2px 8px; border-radius:12px; border:1px solid #c8e6c9;">%s</span>',
					esc_html( $kw )
				);
			}
			if ( count( $metadata['keywords'] ) > 5 ) {
				printf( '<span style="color:#666; font-size:11px;">+%d more</span>', count( $metadata['keywords'] ) - 5 );
			}
			echo '</div>';
		} else {
			$nonce = wp_create_nonce( self::NONCE_ACTION );
			printf(
				'<button type="button" class="button button-small matcha-ai-generate-btn" data-attachment-id="%d" data-nonce="%s" style="color:#2e7d32; border-color:#81c784; background:#f1f8e9;">🍵 %s</button><div class="matcha-ai-status" style="display:none; font-size:11px; margin-top:4px;"></div>',
				(int) $post_id,
				esc_attr( $nonce ),
				esc_html__( 'Analyze AI', 'matcha-gallery' )
			);
		}
	}

	/**
	 * Add the AI generate button to the attachment edit form.
	 *
	 * @param array<string, array<string, mixed>> $fields Existing form fields.
	 * @param \WP_Post                            $post   Attachment post object.
	 * @return array<string, array<string, mixed>>
	 */
	public static function add_ai_button_field( array $fields, \WP_Post $post ): array {
		if ( ! wp_attachment_is_image( $post->ID ) ) {
			return $fields;
		}

		$nonce        = wp_create_nonce( self::NONCE_ACTION );
		$is_generated = Attachment_Metadata::is_ai_generated( $post->ID );
		$button_text  = $is_generated
			? __( 'Regenerate with AI', 'matcha-gallery' )
			: __( 'Generate with AI', 'matcha-gallery' );

		$html = sprintf(
			'<div class="matcha-ai-generate-wrap">'
			. '<button type="button" class="button matcha-ai-generate-btn" data-attachment-id="%d" data-nonce="%s">🍵 %s</button>'
			. '<div class="matcha-ai-status" style="display:none;"></div>'
			. '</div>',
			esc_attr( $post->ID ),
			esc_attr( $nonce ),
			esc_html( $button_text )
		);

		$fields['matcha_ai_generate'] = array(
			'label' => __( 'Matcha AI', 'matcha-gallery' ),
			'input' => 'html',
			'html'  => $html,
		);

		return $fields;
	}

	/**
	 * AJAX handler for single-image AI generation.
	 */
	public static function ajax_generate(): void {
		// Verify nonce.
		if ( ! check_ajax_referer( self::NONCE_ACTION, 'nonce', false ) ) {
			wp_send_json_error(
				array( 'message' => __( 'Security check failed.', 'matcha-gallery' ) ),
				403
			);
		}

		// Check capabilities.
		if ( ! current_user_can( 'upload_files' ) ) {
			wp_send_json_error(
				array( 'message' => __( 'You do not have permission to do this.', 'matcha-gallery' ) ),
				403
			);
		}

		$attachment_id = isset( $_POST['attachment_id'] ) ? (int) $_POST['attachment_id'] : 0;

		if ( $attachment_id <= 0 ) {
			wp_send_json_error(
				array( 'message' => __( 'Invalid attachment ID.', 'matcha-gallery' ) ),
				400
			);
		}

		if ( ! current_user_can( 'edit_post', $attachment_id ) ) {
			wp_send_json_error(
				array( 'message' => __( 'You do not have permission to edit this attachment.', 'matcha-gallery' ) ),
				403
			);
		}

		if ( empty( Plugin::get_setting( 'api_key', '' ) ) ) {
			wp_send_json_error(
				array( 'message' => __( 'No API key configured. Go to Settings → Matcha AI Gallery.', 'matcha-gallery' ) ),
				400
			);
		}

		try {
			$generator = new Metadata_Generator();
			$metadata  = $generator->generate( $attachment_id );

			Attachment_Metadata::save_metadata(
				$attachment_id,
				$metadata,
				array( 'overwrite' => Plugin::get_setting( 'overwrite_existing', false ) )
			);

			wp_send_json_success(
				array(
					'message'  => __( 'AI metadata generated successfully!', 'matcha-gallery' ),
					'metadata' => $metadata,
				)
			);
		} catch ( \RuntimeException $e ) {
			wp_send_json_error(
				array( 'message' => $e->getMessage() ),
				500
			);
		}
	}

	/**
	 * Get the inline JS for the per-image AI generate button.
	 *
	 * @return string
	 */
	private static function get_inline_script(): string {
		return <<<'JS'
(function($) {
	$(document).on('click', '.matcha-ai-generate-btn', function(e) {
		e.preventDefault();
		var $btn = $(this);
		var $status = $btn.siblings('.matcha-ai-status');
		var attachmentId = $btn.data('attachment-id');
		var nonce = $btn.data('nonce');

		$btn.prop('disabled', true);
		$status.show()
			.removeClass('success error')
			.html('<span class="matcha-ai-spinner"></span> Generating metadata with AI…');

		$.post(ajaxurl, {
			action: 'matcha_generate_ai_metadata',
			attachment_id: attachmentId,
			nonce: nonce
		})
		.done(function(response) {
			if (response.success) {
				$status.addClass('success').html('✓ ' + response.data.message);
				// Update visible fields if on attachment edit page.
				if (response.data.metadata) {
					var m = response.data.metadata;
					$('#attachment-details-two-column-alt-text, input[name="_wp_attachment_image_alt"]').val(m.alt_text || '');
					$('input[name="post_title"]').val(m.title || '');
					$('textarea[name="post_excerpt"], textarea[name="excerpt"]').val(m.caption || '');
				}
			} else {
				$status.addClass('error').html('✗ ' + (response.data.message || 'Unknown error'));
			}
		})
		.fail(function(xhr) {
			var msg = 'Request failed';
			try { msg = JSON.parse(xhr.responseText).data.message; } catch(e) {}
			$status.addClass('error').html('✗ ' + msg);
		})
		.always(function() {
			$btn.prop('disabled', false);
		});
	});
})(jQuery);
JS;
	}
}
