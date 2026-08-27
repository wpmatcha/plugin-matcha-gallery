<?php
/**
 * Attachment metadata reader/writer.
 *
 * Handles reading and saving alt text, title, caption, and AI keywords
 * on WordPress attachment posts.
 *
 * @package Matcha_AI_Smart_Gallery\Media
 */


namespace Matcha_AI_Smart_Gallery\Media;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


/**
 * Read/write AI-generated metadata on attachment posts.
 */
class Attachment_Metadata {

	/**
	 * Post meta key used to flag that AI has processed this attachment.
	 */
	public const AI_GENERATED_META_KEY = '_matcha_ai_generated';

	/**
	 * Taxonomy name for AI keywords.
	 */
	public const TAXONOMY = 'matcha_ai_keywords';

	/**
	 * Get all relevant metadata for an attachment.
	 *
	 * @param int $attachment_id Attachment post ID.
	 * @return array{
	 *   alt_text: string,
	 *   title: string,
	 *   caption: string,
	 *   keywords: list<string>,
	 *   ai_generated: bool,
	 * }
	 */
	public static function get_metadata( int $attachment_id ): array {
		$post = get_post( $attachment_id );

		if ( ! $post || 'attachment' !== $post->post_type ) {
			return array(
				'alt_text'     => '',
				'title'        => '',
				'caption'      => '',
				'keywords'     => array(),
				'ai_generated' => false,
			);
		}

		$terms    = wp_get_object_terms( $attachment_id, self::TAXONOMY, array( 'fields' => 'names' ) );
		$keywords = is_wp_error( $terms ) ? array() : $terms;
		$colors   = (array) get_post_meta( $attachment_id, '_matcha_colors', true );
		$focal    = get_post_meta( $attachment_id, '_matcha_focal_point', true );
		if ( ! is_array( $focal ) ) {
			$focal = array( 'x' => 50, 'y' => 50 );
		}

		return array(
			'alt_text'     => (string) get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ),
			'title'        => $post->post_title,
			'caption'      => $post->post_excerpt,
			'keywords'     => $keywords,
			'colors'       => array_values( array_filter( array_map( 'sanitize_hex_color', $colors ) ) ),
			'focal_point'  => $focal,
			'ai_generated' => (bool) get_post_meta( $attachment_id, self::AI_GENERATED_META_KEY, true ),
		);
	}

	/**
	 * Save AI-generated metadata to an attachment.
	 *
	 * @param int                  $attachment_id Attachment post ID.
	 * @param array{
	 *   alt_text?: string,
	 *   title?: string,
	 *   caption?: string,
	 *   keywords?: list<string>,
	 *   colors?: list<string>,
	 *   focal_point?: array{x: int, y: int},
	 * }                          $data         Metadata to save.
	 * @param array<string, bool> $options      Save options:
	 *   - 'overwrite' (bool) Whether to overwrite existing values. Default false.
	 */
	public static function save_metadata( int $attachment_id, array $data, array $options = array() ): void {
		$overwrite = $options['overwrite'] ?? false;
		$post      = get_post( $attachment_id );

		if ( ! $post || 'attachment' !== $post->post_type ) {
			return;
		}

		$post_updates = array();

		// Alt text (post meta).
		if ( isset( $data['alt_text'] ) && '' !== $data['alt_text'] ) {
			$current_alt = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );

			if ( $overwrite || empty( $current_alt ) ) {
				update_post_meta(
					$attachment_id,
					'_wp_attachment_image_alt',
					sanitize_text_field( $data['alt_text'] )
				);
			}
		}

		// Title (post_title).
		if ( isset( $data['title'] ) && '' !== $data['title'] ) {
			$has_auto_title = preg_match( '/^[A-Za-z0-9_-]+$/', $post->post_title );

			if ( $overwrite || empty( $post->post_title ) || $has_auto_title ) {
				$post_updates['post_title'] = sanitize_text_field( $data['title'] );
			}
		}

		// Caption (post_excerpt).
		if ( isset( $data['caption'] ) && '' !== $data['caption'] ) {
			if ( $overwrite || empty( $post->post_excerpt ) ) {
				$post_updates['post_excerpt'] = sanitize_textarea_field( $data['caption'] );
			}
		}

		// Update the attachment post if needed.
		if ( ! empty( $post_updates ) ) {
			$post_updates['ID'] = $attachment_id;
			wp_update_post( $post_updates );
		}

		// Keywords (taxonomy terms).
		if ( isset( $data['keywords'] ) && is_array( $data['keywords'] ) ) {
			$sanitized_keywords = array_filter( array_map( 'sanitize_text_field', $data['keywords'] ) );
			$term_ids           = array();

			foreach ( $sanitized_keywords as $keyword ) {
				$term = term_exists( $keyword, self::TAXONOMY );

				if ( ! $term ) {
					$term = wp_insert_term( $keyword, self::TAXONOMY );
				}

				if ( ! is_wp_error( $term ) ) {
					$term_ids[] = (int) ( is_array( $term ) ? $term['term_id'] : $term );
				}
			}

			// Replace terms completely (clearing if empty)
			wp_set_object_terms( $attachment_id, $term_ids, self::TAXONOMY, false );
		}

		// Colors
		if ( isset( $data['colors'] ) && is_array( $data['colors'] ) ) {
			$sanitized_colors = array_filter( array_map( 'sanitize_hex_color', $data['colors'] ) );
			if ( ! empty( $sanitized_colors ) ) {
				update_post_meta( $attachment_id, '_matcha_colors', array_values( $sanitized_colors ) );
			}
		}

		// Focal point
		if ( isset( $data['focal_point'] ) && is_array( $data['focal_point'] ) ) {
			$fx = max( 0, min( 100, (int) ( $data['focal_point']['x'] ?? 50 ) ) );
			$fy = max( 0, min( 100, (int) ( $data['focal_point']['y'] ?? 50 ) ) );
			update_post_meta( $attachment_id, '_matcha_focal_point', array( 'x' => $fx, 'y' => $fy ) );
		}

		// Mark as AI-processed.
		update_post_meta( $attachment_id, self::AI_GENERATED_META_KEY, time() );
	}

	/**
	 * Check whether an attachment has AI-generated metadata.
	 *
	 * @param int $attachment_id Attachment post ID.
	 * @return bool
	 */
	public static function is_ai_generated( int $attachment_id ): bool {
		return (bool) get_post_meta( $attachment_id, self::AI_GENERATED_META_KEY, true );
	}

	/**
	 * Check if an attachment is missing metadata that AI could fill.
	 *
	 * @param int $attachment_id Attachment post ID.
	 * @return bool True if alt text or keywords are missing.
	 */
	public static function needs_metadata( int $attachment_id ): bool {
		$alt = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );

		if ( empty( $alt ) ) {
			return true;
		}

		$terms = wp_get_object_terms( $attachment_id, self::TAXONOMY, array( 'fields' => 'ids' ) );

		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return true;
		}

		return false;
	}
}
