<?php
/**
 * Hidden CPT matcha_gallery - source of truth for Studio.
 *
 * @package Matcha_AI_Smart_Gallery\Gallery
 */


namespace Matcha_AI_Smart_Gallery\Gallery;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


/**
 * Registers the hidden matcha_gallery post type and its config meta.
 */
final class Gallery_CPT {

	/**
	 * Post type slug.
	 */
	public const POST_TYPE = 'matcha_gallery';

	/**
	 * Meta key for JSON config blob.
	 */
	public const META_CONFIG = '_matcha_gallery_config';

	/**
	 * Register hooks.
	 */
	public static function register(): void {
		add_action( 'init', array( static::class, 'register_post_type' ), 5 );
		add_action( 'init', array( static::class, 'register_meta' ), 5 );
	}

	/**
	 * Register hidden CPT.
	 */
	public static function register_post_type(): void {
		$labels = array(
			'name'          => _x( 'Matcha Galleries', 'post type general name', 'matcha-gallery' ),
			'singular_name' => _x( 'Matcha Gallery', 'post type singular name', 'matcha-gallery' ),
			'add_new'       => _x( 'Add New Gallery', 'post type add new', 'matcha-gallery' ),
			'add_new_item'  => __( 'Add New Gallery', 'matcha-gallery' ),
			'edit_item'     => __( 'Edit Gallery', 'matcha-gallery' ),
			'view_item'     => __( 'View Gallery', 'matcha-gallery' ),
			'search_items'  => __( 'Search Galleries', 'matcha-gallery' ),
			'not_found'     => __( 'No galleries found.', 'matcha-gallery' ),
		);

		register_post_type(
			self::POST_TYPE,
			array(
				'labels'              => $labels,
				'public'              => false,
				'show_ui'             => false, // Studio renders its own UI
				'show_in_menu'        => false,
				'show_in_rest'        => true,
				'rest_base'           => 'matcha-galleries',
				'supports'            => array( 'title' ),
				'capability_type'     => 'page', // maps to edit_pages / edit_others_pages - allows editors
				'map_meta_cap'        => true,
				'rewrite'             => false,
				'query_var'           => false,
				'can_export'          => true,
				'delete_with_user'    => false,
				'show_in_nav_menus'   => false,
				'exclude_from_search' => true,
				'publicly_queryable'  => false,
			)
		);
	}

	/**
	 * Register post meta for JSON config.
	 */
	public static function register_meta(): void {
		register_post_meta(
			self::POST_TYPE,
			self::META_CONFIG,
			array(
				'type'              => 'string',
				'description'       => 'Matcha gallery config JSON',
				'single'            => true,
				'show_in_rest'      => false, // handled via custom REST controller
				'sanitize_callback' => array( static::class, 'sanitize_config' ),
				'auth_callback'     => static function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);

		// Index helper meta for reverse lookup (which galleries use attachment X)
		register_post_meta(
			self::POST_TYPE,
			'_matcha_gallery_image_ids',
			array(
				'type'              => 'string',
				'single'            => true,
				'show_in_rest'      => false,
				'sanitize_callback' => 'sanitize_text_field',
				'auth_callback'     => static function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}

	/**
	 * Sanitize JSON config (store as JSON string).
	 *
	 * @param string $value Raw value.
	 * @return string
	 */
	public static function sanitize_config( $value ): string {
		if ( is_array( $value ) ) {
			$value = wp_json_encode( $value );
		}
		if ( ! is_string( $value ) ) {
			return '{}';
		}
		$decoded = json_decode( $value, true );
		if ( ! is_array( $decoded ) ) {
			return '{}';
		}
		return wp_json_encode( self::sanitize_config_array( $decoded ) );
	}

	/**
	 * Sanitize config array with allowlist.
	 *
	 * @param array<string,mixed> $cfg Raw config.
	/**
	 * Check if Matcha Gallery Pro add-on is active.
	 *
	 * @return bool
	 */
	public static function is_pro_active(): bool {
		return (bool) apply_filters( 'matcha_gallery_is_pro', false );
	}

	/**
	 * Sanitize raw config array into valid schema with extensible filters.
	 *
	 * @param array<string,mixed> $cfg Raw input config.
	 * @return array<string,mixed>
	 */
	public static function sanitize_config_array( array $cfg ): array {
		$out = array();

		$out['sourceType'] = in_array( $cfg['sourceType'] ?? 'selected', array( 'selected', 'dynamic' ), true ) ? $cfg['sourceType'] : 'selected';

		$ids = array_filter( array_map( 'intval', (array) ( $cfg['imageIds'] ?? array() ) ) );
		// Hard cap 150 per decision
		$out['imageIds'] = array_slice( $ids, 0, 150 );

		$tags = array_filter( array_map( 'sanitize_title', (array) ( $cfg['aiTags'] ?? array() ) ) );
		$out['aiTags'] = array_slice( $tags, 0, 30 );

		$allowed_layouts = apply_filters( 'matcha_gallery_allowed_layouts', array( 'grid', 'masonry', 'justified', 'mosaic', 'pinwheel', 'bento' ) );
		$out['layout']   = in_array( $cfg['layout'] ?? 'grid', (array) $allowed_layouts, true ) ? $cfg['layout'] : 'grid';

		$out['columns']       = max( 1, min( 6, (int) ( $cfg['columns'] ?? 3 ) ) );
		$out['columnsTablet'] = max( 1, min( 4, (int) ( $cfg['columnsTablet'] ?? 2 ) ) );
		$out['columnsMobile'] = max( 1, min( 2, (int) ( $cfg['columnsMobile'] ?? 1 ) ) );
		$out['gutterSize']    = max( 0, min( 48, (int) ( $cfg['gutterSize'] ?? 16 ) ) );
		$out['rowHeight']     = max( 120, min( 600, (int) ( $cfg['rowHeight'] ?? 240 ) ) );

		$out['filtersEnabled']     = ! empty( $cfg['filtersEnabled'] );
		$allowed_filter_styles     = apply_filters( 'matcha_gallery_allowed_filter_styles', array( 'pills', 'underline' ) );
		$out['filterStyle']        = in_array( $cfg['filterStyle'] ?? 'pills', (array) $allowed_filter_styles, true ) ? $cfg['filterStyle'] : 'pills';
		$out['filterAlign']        = in_array( $cfg['filterAlign'] ?? 'left', array( 'left', 'center', 'right', 'between' ), true ) ? $cfg['filterAlign'] : 'left';
		$out['showFilterCount']    = ! isset( $cfg['showFilterCount'] ) || ! empty( $cfg['showFilterCount'] );
		$out['allFilterLabel']     = sanitize_text_field( $cfg['allFilterLabel'] ?? 'All' );
		$out['accentColor']        = sanitize_hex_color( $cfg['accentColor'] ?? '#22c55e' ) ?: '#22c55e';
		$out['searchEnabled']      = ! isset( $cfg['searchEnabled'] ) || ! empty( $cfg['searchEnabled'] );
		$out['maxFilterTags']      = max( 0, min( 30, (int) ( $cfg['maxFilterTags'] ?? 8 ) ) );
		$out['visibleFilterTags']  = array_values( array_filter( array_map( 'sanitize_title', (array) ( $cfg['visibleFilterTags'] ?? array() ) ) ) );
		$out['showAllFilter']      = ! isset( $cfg['showAllFilter'] ) || ! empty( $cfg['showAllFilter'] );
		$out['showTitle']          = ! empty( $cfg['showTitle'] );
		$out['showCaption']        = ! empty( $cfg['showCaption'] );
		$out['lightboxEnabled']    = ! isset( $cfg['lightboxEnabled'] ) || ! empty( $cfg['lightboxEnabled'] );
		$out['borderRadius']       = max( 0, min( 32, (int) ( $cfg['borderRadius'] ?? 10 ) ) );
		$out['mattingSize']        = max( 0, min( 32, (int) ( $cfg['mattingSize'] ?? 0 ) ) );
		$out['cardTheme']          = in_array( $cfg['cardTheme'] ?? 'clean', array( 'clean', 'glass', 'glow', 'dark' ), true ) ? $cfg['cardTheme'] : 'clean';
		$out['canvasBackdrop']     = in_array( $cfg['canvasBackdrop'] ?? 'transparent', array( 'transparent', 'white', 'cream', 'sage', 'charcoal', 'dark-slate' ), true ) ? $cfg['canvasBackdrop'] : 'transparent';
		$out['hoverEffect']        = sanitize_key( $cfg['hoverEffect'] ?? 'zoom' );

		$allowed_frames     = apply_filters( 'matcha_gallery_allowed_frames', array( 'none', 'white-mat', 'black-metal', 'natural-oak', 'gold-brass', 'glass-float' ) );
		$out['frameStyle']  = in_array( $cfg['frameStyle'] ?? 'none', (array) $allowed_frames, true ) ? $cfg['frameStyle'] : 'none';
		$out['shadowElevation'] = in_array( $cfg['shadowElevation'] ?? 'soft', array( 'none', 'soft', 'medium', 'gallery-spotlight', 'deep-lift' ), true ) ? $cfg['shadowElevation'] : 'soft';

		$allowed_pagination   = apply_filters( 'matcha_gallery_allowed_pagination', array( 'none', 'load-more', 'infinite', 'pages' ) );
		$out['paginationType'] = in_array( $cfg['paginationType'] ?? 'none', (array) $allowed_pagination, true ) ? $cfg['paginationType'] : 'none';
		$out['itemsPerPage']   = max( 4, min( 60, (int) ( $cfg['itemsPerPage'] ?? 12 ) ) );
		$allowed_load_styles  = apply_filters( 'matcha_gallery_allowed_loadmore_styles', array( 'pill', 'outline', 'minimal' ) );
		$out['loadMoreStyle'] = in_array( $cfg['loadMoreStyle'] ?? 'pill', (array) $allowed_load_styles, true ) ? $cfg['loadMoreStyle'] : 'pill';
		$out['loadMoreLabel'] = sanitize_text_field( $cfg['loadMoreLabel'] ?? 'Load More Photos' );

		// Features fully functional in core
		$out['colorFilterEnabled'] = ! empty( $cfg['colorFilterEnabled'] );
		$out['proofingEnabled']    = ! empty( $cfg['proofingEnabled'] );
		$out['shoppableEnabled']   = ! empty( $cfg['shoppableEnabled'] );
		$out['sectionsEnabled']    = ! empty( $cfg['sectionsEnabled'] );

		// Sanitize multi-section chapters
		$out['sections'] = array();
		if ( ! empty( $cfg['sections'] ) && is_array( $cfg['sections'] ) ) {
			foreach ( $cfg['sections'] as $sec ) {
				if ( is_array( $sec ) ) {
					$out['sections'][] = array(
						'id'       => sanitize_title( $sec['id'] ?? uniqid( 'sec_' ) ),
						'title'    => sanitize_text_field( $sec['title'] ?? 'Section' ),
						'imageIds' => array_values( array_filter( array_map( 'intval', (array) ( $sec['imageIds'] ?? array() ) ) ) ),
					);
				}
			}
		}

		// Sanitize image geometric spans
		$out['imageSpans'] = array();
		if ( ! empty( $cfg['imageSpans'] ) && is_array( $cfg['imageSpans'] ) ) {
			foreach ( $cfg['imageSpans'] as $img_id => $span ) {
				if ( is_array( $span ) ) {
					$out['imageSpans'][ (int) $img_id ] = array(
						'spanW' => max( 1, min( 4, (int) ( $span['spanW'] ?? 1 ) ) ),
						'spanH' => max( 1, min( 4, (int) ( $span['spanH'] ?? 1 ) ) ),
					);
				}
			}
		}

		// Sanitize shoppable image links
		$out['imageLinks'] = array();
		if ( ! empty( $cfg['imageLinks'] ) && is_array( $cfg['imageLinks'] ) ) {
			foreach ( $cfg['imageLinks'] as $img_id => $link ) {
				if ( is_array( $link ) ) {
					$out['imageLinks'][ (int) $img_id ] = array(
						'url'    => esc_url_raw( $link['url'] ?? '' ),
						'target' => in_array( $link['target'] ?? '_self', array( '_self', '_blank' ), true ) ? $link['target'] : '_self',
						'label'  => sanitize_text_field( $link['label'] ?? '' ),
						'price'  => sanitize_text_field( $link['price'] ?? '' ),
					);
				}
			}
		}

		// Sanitize focal points and zoom cropping
		$out['focalPoints'] = array();
		if ( ! empty( $cfg['focalPoints'] ) && is_array( $cfg['focalPoints'] ) ) {
			foreach ( $cfg['focalPoints'] as $img_id => $focal ) {
				if ( is_array( $focal ) ) {
					$out['focalPoints'][ (int) $img_id ] = array(
						'x'    => max( 0.0, min( 100.0, (float) ( $focal['x'] ?? 50.0 ) ) ),
						'y'    => max( 0.0, min( 100.0, (float) ( $focal['y'] ?? 50.0 ) ) ),
						'zoom' => max( 1.0, min( 3.0, (float) ( $focal['zoom'] ?? 1.0 ) ) ),
					);
				}
			}
		}

		return apply_filters( 'matcha_gallery_sanitize_config', $out, $cfg );
	}

	/**
	 * Get config for a gallery post.
	 *
	 * @param int $post_id Gallery post ID.
	 * @return array<string,mixed>
	 */
	public static function get_config( int $post_id ): array {
		$raw = get_post_meta( $post_id, self::META_CONFIG, true );
		if ( empty( $raw ) ) {
			return self::default_config();
		}
		$decoded = json_decode( $raw, true );
		if ( ! is_array( $decoded ) ) {
			return self::default_config();
		}
		return wp_parse_args( $decoded, self::default_config() );
	}

	/**
	 * Default config.
	 *
	 * @return array<string,mixed>
	 */
	public static function default_config(): array {
		return array(
			'sourceType'         => 'selected',
			'imageIds'           => array(),
			'sections'           => array(),
			'sectionsEnabled'    => false,
			'aiTags'             => array(),
			'layout'             => 'grid',
			'imageSpans'         => array(),
			'imageLinks'         => array(),
			'focalPoints'        => array(),
			'columns'            => 3,
			'columnsTablet'      => 2,
			'columnsMobile'      => 1,
			'gutterSize'         => 16,
			'rowHeight'          => 240,
			'filtersEnabled'     => true,
			'filterStyle'        => 'pills',
			'filterAlign'        => 'left',
			'showFilterCount'    => true,
			'allFilterLabel'     => 'All',
			'accentColor'        => '#22c55e',
			'paginationType'     => 'none',
			'itemsPerPage'       => 12,
			'loadMoreStyle'      => 'pill',
			'loadMoreLabel'      => 'Load More Photos',
			'colorFilterEnabled' => true,
			'proofingEnabled'    => false,
			'shoppableEnabled'   => true,
			'searchEnabled'      => true,
			'maxFilterTags'      => 8,
			'showAllFilter'      => true,
			'showTitle'          => true,
			'showCaption'        => false,
			'lightboxEnabled'    => true,
			'borderRadius'       => 10,
			'mattingSize'        => 0,
			'frameStyle'         => 'none',
			'shadowElevation'    => 'soft',
			'canvasBackdrop'     => 'transparent',
			'cardTheme'          => 'clean',
			'hoverEffect'        => 'zoom',
		);
	}

	/**
	 * Save config for a gallery post.
	 *
	 * @param int   $post_id Gallery ID.
	 * @param array<string,mixed> $config Config array.
	 */
	public static function save_config( int $post_id, array $config ): void {
		$sanitized = self::sanitize_config_array( $config );
		update_post_meta( $post_id, self::META_CONFIG, wp_json_encode( $sanitized ) );
		// Update index meta for reverse lookups
		$ids_csv = implode( ',', $sanitized['imageIds'] );
		update_post_meta( $post_id, '_matcha_gallery_image_ids', $ids_csv );
	}
}
