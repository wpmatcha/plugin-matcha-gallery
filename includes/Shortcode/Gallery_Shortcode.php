<?php
/**
 * Smart Gallery Shortcode Engine.
 *
 * Provides [matcha_gallery] shortcode support for Elementor, Divi, Classic Editor,
 * and page builder widgets.
 *
 * @package Matcha_AI_Smart_Gallery\Shortcode
 */


namespace Matcha_AI_Smart_Gallery\Shortcode;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


use Matcha_AI_Smart_Gallery\Blocks\Smart_Gallery_Block;

/**
 * Registers and handles the [matcha_gallery] shortcode.
 */
class Gallery_Shortcode {

	/**
	 * Shortcode tag.
	 */
	public const SHORTCODE_TAG = 'matcha_gallery';

	/**
	 * Register shortcode on init.
	 */
	public static function register(): void {
		add_shortcode( self::SHORTCODE_TAG, array( static::class, 'render_shortcode' ) );
	}

	/**
	 * Render shortcode output.
	 *
	 * Supported attributes:
	 *   - ids: Comma-separated list of attachment IDs (e.g. ids="12,15,19").
	 *   - tag / tags: Comma-separated list of AI keyword slugs (e.g. tag="nature,landscape").
	 *   - layout: 'grid' or 'masonry' (default: 'grid').
	 *   - columns: Desktop columns (default: 3).
	 *   - columns_tablet: Tablet columns (default: 2).
	 *   - columns_mobile: Mobile columns (default: 1).
	 *   - gutter: Spacing in px (default: 16).
	 *   - filters: 'true'/'false' to show filter bar (default: true).
	 *   - show_all: 'true'/'false' to show "All" filter button (default: true).
	 *   - title: 'true'/'false' to show title on hover (default: true).
	 *   - caption: 'true'/'false' to show caption (default: false).
	 *   - lightbox: 'true'/'false' to enable lightbox (default: true).
	 *   - limit: Maximum images to show (default: -1 for all).
	 *   - orderby: 'date', 'title', 'rand', etc.
	 *   - order: 'ASC' or 'DESC'.
	 *
	 * @param array<string, mixed>|string $atts Shortcode attributes.
	 * @return string Rendered HTML.
	 */
	public static function render_shortcode( mixed $atts ): string {
		$raw_atts = is_array( $atts ) ? $atts : array();

		// CPT id shortcode: [matcha_gallery id="123"] loads stored config
		if ( ! empty( $raw_atts['id'] ) ) {
			$gid  = (int) $raw_atts['id'];
			$post = get_post( $gid );
			if ( $post && \Matcha_AI_Smart_Gallery\Gallery\Gallery_CPT::POST_TYPE === $post->post_type ) {
				$cfg = \Matcha_AI_Smart_Gallery\Gallery\Gallery_CPT::get_config( $gid );
				if ( ! empty( $raw_atts['layout'] ) ) {
					$cfg['layout'] = sanitize_key( $raw_atts['layout'] );
				}
				$cfg['galleryId'] = $gid;
				return Smart_Gallery_Block::render( $cfg );
			}
		}

		// Parse IDs if provided.
		$image_ids = array();
		if ( ! empty( $raw_atts['ids'] ) ) {
			$image_ids = array_filter( array_map( 'intval', explode( ',', (string) $raw_atts['ids'] ) ) );
		} elseif ( ! empty( $raw_atts['include'] ) ) {
			$image_ids = array_filter( array_map( 'intval', explode( ',', (string) $raw_atts['include'] ) ) );
		}

		// Parse AI Tags if provided.
		$ai_tags = array();
		$raw_tags = $raw_atts['tag'] ?? $raw_atts['tags'] ?? $raw_atts['keyword'] ?? $raw_atts['keywords'] ?? '';
		if ( ! empty( $raw_tags ) ) {
			$ai_tags = array_filter( array_map( 'sanitize_title', explode( ',', (string) $raw_tags ) ) );
		}

		// Determine source type: dynamic by AI tag takes precedence if tags are passed, else selected IDs.
		$source_type = ! empty( $ai_tags ) ? 'dynamic' : 'selected';

		// Normalize boolean values.
		$to_bool = static function ( mixed $val, bool $default = true ): bool {
			if ( null === $val || '' === $val ) {
				return $default;
			}
			return in_array( strtolower( (string) $val ), array( '1', 'true', 'yes', 'on' ), true );
		};

		$attributes = array(
			'sourceType'      => $source_type,
			'imageIds'        => $image_ids,
			'aiTags'          => $ai_tags,
			'layout'          => in_array( $raw_atts['layout'] ?? 'grid', array( 'grid', 'masonry', 'justified', 'mosaic', 'pinwheel', 'bento' ), true ) ? $raw_atts['layout'] : 'grid',
			'columns'         => max( 1, min( 6, (int) ( $raw_atts['columns'] ?? 3 ) ) ),
			'columnsTablet'   => max( 1, min( 4, (int) ( $raw_atts['columns_tablet'] ?? 2 ) ) ),
			'columnsMobile'   => max( 1, min( 2, (int) ( $raw_atts['columns_mobile'] ?? 1 ) ) ),
			'gutterSize'      => max( 0, min( 48, (int) ( $raw_atts['gutter'] ?? 16 ) ) ),
			'filtersEnabled'  => $to_bool( $raw_atts['filters'] ?? null, true ),
			'showAllFilter'   => $to_bool( $raw_atts['show_all'] ?? null, true ),
			'showTitle'       => $to_bool( $raw_atts['title'] ?? null, true ),
			'showCaption'     => $to_bool( $raw_atts['caption'] ?? null, false ),
			'lightboxEnabled' => $to_bool( $raw_atts['lightbox'] ?? null, true ),
		);

		return Smart_Gallery_Block::render( $attributes );
	}
}
