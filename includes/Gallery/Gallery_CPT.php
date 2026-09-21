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
				'capability_type'     => 'post',
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

		$is_pro = self::is_pro_active();

		$out['sourceType'] = in_array( $cfg['sourceType'] ?? 'selected', array( 'selected', 'dynamic' ), true ) ? $cfg['sourceType'] : 'selected';

		$ids = array_filter( array_map( 'intval', (array) ( $cfg['imageIds'] ?? array() ) ) );
		// Hard cap 150 per decision
		$out['imageIds'] = array_slice( $ids, 0, 150 );

		$tags = array_filter( array_map( 'sanitize_title', (array) ( $cfg['aiTags'] ?? array() ) ) );
		$out['aiTags'] = array_slice( $tags, 0, 30 );

		$default_layouts = $is_pro ? array( 'grid', 'masonry', 'justified', 'mosaic', 'pinwheel', 'bento' ) : array( 'grid', 'masonry', 'justified', 'mosaic' );
		$allowed_layouts = apply_filters( 'matcha_gallery_allowed_layouts', $default_layouts );
		$out['layout']   = in_array( $cfg['layout'] ?? 'grid', (array) $allowed_layouts, true ) ? $cfg['layout'] : 'grid';

		$out['columns']       = max( 1, min( 6, (int) ( $cfg['columns'] ?? 3 ) ) );
		$out['columnsTablet'] = max( 1, min( 4, (int) ( $cfg['columnsTablet'] ?? 2 ) ) );
		$out['columnsMobile'] = max( 1, min( 2, (int) ( $cfg['columnsMobile'] ?? 1 ) ) );
		$out['gutterSize']    = max( 0, min( 48, (int) ( $cfg['gutterSize'] ?? 16 ) ) );
		$out['rowHeight']     = max( 120, min( 600, (int) ( $cfg['rowHeight'] ?? 240 ) ) );

		$out['filtersEnabled']     = ! empty( $cfg['filtersEnabled'] );
		$out['filterLogic']        = in_array( $cfg['filterLogic'] ?? 'or', array( 'or', 'and' ), true ) ? $cfg['filterLogic'] : 'or';
		$out['orderedFilterTags']  = array_values( array_filter( array_map( 'sanitize_title', (array) ( $cfg['orderedFilterTags'] ?? array() ) ) ) );
		$allowed_filter_styles     = apply_filters( 'matcha_gallery_allowed_filter_styles', array( 'pills', 'underline' ) );
		$out['filterStyle']        = in_array( $cfg['filterStyle'] ?? 'pills', (array) $allowed_filter_styles, true ) ? $cfg['filterStyle'] : 'pills';
		$default_toolbar_skins     = $is_pro ? array( 'capsule', 'underline', 'obsidian', 'glass' ) : array( 'capsule', 'underline' );
		$allowed_toolbar_skins     = apply_filters( 'matcha_gallery_allowed_toolbar_skins', $default_toolbar_skins );
		$out['toolbarSkin']        = in_array( $cfg['toolbarSkin'] ?? 'capsule', (array) $allowed_toolbar_skins, true ) ? $cfg['toolbarSkin'] : ( in_array( $cfg['filterStyle'] ?? '', array( 'underline', 'obsidian', 'glass' ), true ) ? $cfg['filterStyle'] : 'capsule' );
		$out['filterAlign']        = in_array( $cfg['filterAlign'] ?? 'left', array( 'left', 'center', 'right', 'between' ), true ) ? $cfg['filterAlign'] : 'left';
		$out['showFilterCount']    = ! isset( $cfg['showFilterCount'] ) || ! empty( $cfg['showFilterCount'] );
		$out['allFilterLabel']     = sanitize_text_field( $cfg['allFilterLabel'] ?? 'All' );
		$out['accentColor']        = sanitize_hex_color( $cfg['accentColor'] ?? '#607d66' ) ?: '#607d66';
		$out['searchEnabled']      = ! isset( $cfg['searchEnabled'] ) || ! empty( $cfg['searchEnabled'] );
		$out['maxFilterTags']      = max( 0, min( 30, (int) ( $cfg['maxFilterTags'] ?? 8 ) ) );
		$out['visibleFilterTags']  = array_values( array_filter( array_map( 'sanitize_title', (array) ( $cfg['visibleFilterTags'] ?? array() ) ) ) );
		$out['showAllFilter']      = ! isset( $cfg['showAllFilter'] ) || ! empty( $cfg['showAllFilter'] );
		$out['showTitle']          = ! empty( $cfg['showTitle'] );
		$out['showCaption']        = ! empty( $cfg['showCaption'] );
		$out['lightboxEnabled']    = ! isset( $cfg['lightboxEnabled'] ) || ! empty( $cfg['lightboxEnabled'] );
		$out['borderRadius']       = max( 0, min( 32, (int) ( $cfg['borderRadius'] ?? 10 ) ) );
		$out['mattingSize']        = max( 0, min( 32, (int) ( $cfg['mattingSize'] ?? 0 ) ) );

		$default_card_themes       = $is_pro ? array( 'clean', 'dark', 'glass', 'glow' ) : array( 'clean', 'dark' );
		$allowed_card_themes       = apply_filters( 'matcha_gallery_allowed_card_themes', $default_card_themes );
		$out['cardTheme']          = in_array( $cfg['cardTheme'] ?? 'clean', (array) $allowed_card_themes, true ) ? $cfg['cardTheme'] : 'clean';
		$out['canvasBackdrop']     = in_array( $cfg['canvasBackdrop'] ?? 'transparent', array( 'transparent', 'white', 'cream', 'sage', 'charcoal', 'dark-slate' ), true ) ? $cfg['canvasBackdrop'] : 'transparent';
		$allowed_style_presets     = apply_filters( 'matcha_gallery_allowed_style_presets', array( 'custom', 'exhibition-frame', 'architectural-curtain', 'cinematic-pullback', 'minimalist-drawer' ) );
		$out['stylePreset']        = in_array( $cfg['stylePreset'] ?? 'custom', (array) $allowed_style_presets, true ) ? $cfg['stylePreset'] : 'custom';
		$out['contentPlacement']   = 'overlay';
		$out['cardBackground']     = sanitize_hex_color( $cfg['cardBackground'] ?? '' ) ?: '';
		$allowed_hover_effects = apply_filters( 'matcha_gallery_allowed_hover_effects', array( 'none', 'zoom', 'pullback', 'frame', 'curtain', 'drawer', 'grayscale', 'lift', 'glow' ) );
		$out['hoverEffect']    = in_array( $cfg['hoverEffect'] ?? 'zoom', (array) $allowed_hover_effects, true ) ? $cfg['hoverEffect'] : 'zoom';
		$out['hoverFrameColor'] = sanitize_hex_color( $cfg['hoverFrameColor'] ?? '' ) ?: '';
		$out['hoverMobileTap']  = in_array( $cfg['hoverMobileTap'] ?? 'lightbox', array( 'lightbox', 'reveal' ), true ) ? $cfg['hoverMobileTap'] : 'lightbox';

		$default_frames     = $is_pro ? array( 'none', 'white-mat', 'black-metal', 'natural-oak', 'gold-brass', 'glass-float' ) : array( 'none', 'white-mat' );
		$allowed_frames     = apply_filters( 'matcha_gallery_allowed_frames', $default_frames );
		$out['frameStyle']  = in_array( $cfg['frameStyle'] ?? 'none', (array) $allowed_frames, true ) ? $cfg['frameStyle'] : 'none';
		$out['shadowElevation'] = in_array( $cfg['shadowElevation'] ?? 'soft', array( 'none', 'soft', 'medium', 'gallery-spotlight', 'deep-lift' ), true ) ? $cfg['shadowElevation'] : 'soft';

		$default_pagination   = $is_pro ? array( 'none', 'load-more', 'infinite', 'pages' ) : array( 'none', 'load-more' );
		$allowed_pagination   = apply_filters( 'matcha_gallery_allowed_pagination', $default_pagination );
		$out['paginationType'] = in_array( $cfg['paginationType'] ?? 'none', (array) $allowed_pagination, true ) ? $cfg['paginationType'] : 'none';
		$out['itemsPerPage']   = max( 4, min( 60, (int) ( $cfg['itemsPerPage'] ?? 12 ) ) );
		$allowed_load_styles  = apply_filters( 'matcha_gallery_allowed_loadmore_styles', array( 'pill', 'outline', 'minimal', 'glass', 'dark' ) );
		$out['loadMoreStyle'] = in_array( $cfg['loadMoreStyle'] ?? 'pill', (array) $allowed_load_styles, true ) ? $cfg['loadMoreStyle'] : 'pill';
		$out['loadMoreLabel'] = sanitize_text_field( $cfg['loadMoreLabel'] ?? 'Load More Photos' );

		// Preloader & Frames
		$out['preloaderEnabled']     = ! isset( $cfg['preloaderEnabled'] ) || ! empty( $cfg['preloaderEnabled'] );
		$out['instantFramesEnabled'] = ! isset( $cfg['instantFramesEnabled'] ) || ! empty( $cfg['instantFramesEnabled'] );

		// Pro-only features: only sanitized and stored when Pro is active

		// Sorting & Randomization: Free gets manual, name-asc, name-desc; Pro gets newest, oldest, random & randomizeOrder
		$allowed_sort = $is_pro ? array( 'manual', 'name-asc', 'name-desc', 'newest', 'oldest', 'random' ) : array( 'manual', 'name-asc', 'name-desc' );
		$out['sortBy'] = in_array( $cfg['sortBy'] ?? 'manual', $allowed_sort, true ) ? $cfg['sortBy'] : 'manual';
		$out['randomizeOrder']      = $is_pro && ! empty( $cfg['randomizeOrder'] );
		$out['frontendSortEnabled'] = $is_pro && ! empty( $cfg['frontendSortEnabled'] );

		// Gate Pro preloader styles
		$allowed_preloaders = $is_pro ? array( 'spinner', 'pulse', 'bar', 'logo', 'skeleton' ) : array( 'spinner' );
		$out['preloaderStyle'] = in_array( $cfg['preloaderStyle'] ?? 'spinner', $allowed_preloaders, true ) ? $cfg['preloaderStyle'] : 'spinner';

		$out['colorFilterEnabled'] = $is_pro && ! empty( $cfg['colorFilterEnabled'] );
		$out['proofingEnabled']    = $is_pro && ! empty( $cfg['proofingEnabled'] );
		$out['shoppableEnabled']   = $is_pro && ! empty( $cfg['shoppableEnabled'] );
		$out['sectionsEnabled']    = $is_pro && ! empty( $cfg['sectionsEnabled'] );
		$out['filterMultiSelect']  = $is_pro && ! empty( $cfg['filterMultiSelect'] );

		// Sanitize multi-section chapters (Pro)
		$out['sections'] = array();
		if ( $is_pro && ! empty( $cfg['sections'] ) && is_array( $cfg['sections'] ) ) {
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

		// Sanitize image geometric spans (Pro)
		$out['imageSpans'] = array();
		if ( $is_pro && ! empty( $cfg['imageSpans'] ) && is_array( $cfg['imageSpans'] ) ) {
			$allowed_spans = array( '1x1', '2x1', '1x2', '2x2' );
			foreach ( $cfg['imageSpans'] as $img_id => $span ) {
				$clean_id = absint( $img_id );
				if ( ! $clean_id ) {
					continue;
				}
				if ( is_string( $span ) && in_array( $span, $allowed_spans, true ) ) {
					$out['imageSpans'][ (string) $clean_id ] = $span;
				} elseif ( is_array( $span ) ) {
					$w = max( 1, min( 2, (int) ( $span['spanW'] ?? 1 ) ) );
					$h = max( 1, min( 2, (int) ( $span['spanH'] ?? 1 ) ) );
					$str_span = "{$w}x{$h}";
					if ( in_array( $str_span, $allowed_spans, true ) ) {
						$out['imageSpans'][ (string) $clean_id ] = $str_span;
					}
				}
			}
		}

		// Sanitize image links (Free: external URL & target; Pro: price, label, productId)
		$out['imageLinks'] = array();
		if ( ! empty( $cfg['imageLinks'] ) && is_array( $cfg['imageLinks'] ) ) {
			foreach ( $cfg['imageLinks'] as $img_id => $link ) {
				if ( is_array( $link ) ) {
					$clean_url = esc_url_raw( $link['url'] ?? '' );
					if ( ! empty( $clean_url ) ) {
						$out['imageLinks'][ (int) $img_id ] = array(
							'url'         => $clean_url,
							'target'      => in_array( $link['target'] ?? '_self', array( '_self', '_blank' ), true ) ? $link['target'] : '_self',
							'clickAction' => in_array( $link['clickAction'] ?? 'lightbox', array( 'lightbox', 'direct' ), true ) ? $link['clickAction'] : 'lightbox',
							'label'       => sanitize_text_field( $link['label'] ?? '' ),
							'price'       => $is_pro ? sanitize_text_field( $link['price'] ?? '' ) : '',
							'productId'   => $is_pro && ! empty( $link['productId'] ) ? absint( $link['productId'] ) : 0,
						);
					}
				}
			}
		}

		// Sanitize image videos (YouTube, Vimeo, MP4 URLs)
		$out['imageVideos'] = array();
		if ( ! empty( $cfg['imageVideos'] ) && is_array( $cfg['imageVideos'] ) ) {
			foreach ( $cfg['imageVideos'] as $img_id => $video_url ) {
				$clean_url = esc_url_raw( is_string( $video_url ) ? $video_url : '' );
				if ( ! empty( $clean_url ) ) {
					$out['imageVideos'][ (int) $img_id ] = $clean_url;
				}
			}
		}

		// Sanitize focal points (x/y in core, zoom scale in Pro)
		$out['focalPoints'] = array();
		if ( ! empty( $cfg['focalPoints'] ) && is_array( $cfg['focalPoints'] ) ) {
			foreach ( $cfg['focalPoints'] as $img_id => $focal ) {
				if ( is_array( $focal ) ) {
					$out['focalPoints'][ (int) $img_id ] = array(
						'x'    => max( 0.0, min( 100.0, (float) ( $focal['x'] ?? 50.0 ) ) ),
						'y'    => max( 0.0, min( 100.0, (float) ( $focal['y'] ?? 50.0 ) ) ),
						'zoom' => $is_pro ? max( 1.0, min( 3.0, (float) ( $focal['zoom'] ?? 1.0 ) ) ) : 1.0,
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
			'filterMultiSelect'  => false,
			'filterLogic'        => 'or',
			'orderedFilterTags'  => array(),
			'filterStyle'        => 'pills',
			'filterAlign'        => 'left',
			'showFilterCount'    => true,
			'allFilterLabel'     => 'All',
			'accentColor'        => '#607d66',
			'paginationType'     => 'none',
			'itemsPerPage'       => 12,
			'loadMoreStyle'      => 'pill',
			'loadMoreLabel'      => 'Load More Photos',
			'colorFilterEnabled' => false,
			'proofingEnabled'    => false,
			'shoppableEnabled'   => false,
			'searchEnabled'      => true,
			'maxFilterTags'      => 8,
			'showAllFilter'      => true,
			'showTitle'          => true,
			'showCaption'        => false,
			'lightboxEnabled'    => true,
			'preloaderEnabled'   => true,
			'preloaderStyle'     => 'spinner',
			'instantFramesEnabled'=> true,
			'sortBy'              => 'manual',
			'randomizeOrder'      => false,
			'frontendSortEnabled' => false,
			'borderRadius'       => 10,
			'mattingSize'        => 0,
			'frameStyle'         => 'none',
			'shadowElevation'    => 'soft',
			'canvasBackdrop'     => 'transparent',
			'cardTheme'          => 'clean',
			'stylePreset'        => 'custom',
			'contentPlacement'   => 'overlay',
			'cardBackground'     => '',
			'hoverEffect'        => 'zoom',
			'hoverFrameColor'    => '',
			'hoverMobileTap'     => 'lightbox',
			'imageVideos'        => array(),
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
