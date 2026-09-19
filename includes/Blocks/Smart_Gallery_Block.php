<?php
/**
 * Smart Gallery block registration and render callback.
 *
 * @package Matcha_AI_Smart_Gallery\Blocks
 */


namespace Matcha_AI_Smart_Gallery\Blocks;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


use Matcha_AI_Smart_Gallery\Query\Gallery_Query;
use Matcha_AI_Smart_Gallery\Taxonomy\AI_Keywords_Taxonomy;

/**
 * Registers the matcha-ai/smart-gallery block and renders it on the frontend.
 */
class Smart_Gallery_Block {

	/**
	 * Register the block.
	 */
	public static function register(): void {
		add_action( 'init', array( static::class, 'register_block' ) );
		add_action( 'rest_api_init', array( static::class, 'register_rest_routes' ) );
	}

	/**
	 * Register the block type from block.json.
	 */
	public static function register_block(): void {
		$asset_file = MATCHA_GALLERY_PATH . 'build/smart-gallery/index.asset.php';
		$asset      = file_exists( $asset_file )
			? require $asset_file
			: array(
				'dependencies' => array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-data', 'wp-i18n', 'wp-api-fetch' ),
				'version'      => MATCHA_GALLERY_VERSION,
			);

		wp_register_script(
			'matcha-gallery-block-editor',
			MATCHA_GALLERY_URL . 'build/smart-gallery/index.js',
			$asset['dependencies'] ?? array(),
			$asset['version'] ?? MATCHA_GALLERY_VERSION,
			true
		);

		if ( file_exists( MATCHA_GALLERY_PATH . 'build/smart-gallery/index.css' ) ) {
			wp_register_style(
				'matcha-gallery-block-editor',
				MATCHA_GALLERY_URL . 'build/smart-gallery/index.css',
				array(),
				$asset['version'] ?? MATCHA_GALLERY_VERSION
			);
		}

		$block_dir = file_exists( MATCHA_GALLERY_PATH . 'build/smart-gallery/block.json' )
			? MATCHA_GALLERY_PATH . 'build/smart-gallery'
			: MATCHA_GALLERY_PATH . 'blocks/smart-gallery';

		register_block_type(
			$block_dir,
			array(
				'editor_script'   => 'matcha-gallery-block-editor',
				'editor_style'    => 'matcha-gallery-block-editor',
				'render_callback' => array( static::class, 'render' ),
			)
		);
	}

	/**
	 * Register REST API routes for the block editor.
	 */
	public static function register_rest_routes(): void {
		register_rest_route(
			'matcha-gallery/v1',
			'/ai-keywords',
			array(
				'methods'             => 'GET',
				'callback'            => array( static::class, 'rest_get_keywords' ),
				'permission_callback' => static function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}

	/**
	 * REST endpoint: get all AI keywords for the block editor dropdown.
	 *
	 * @return \WP_REST_Response
	 */
	public static function rest_get_keywords(): \WP_REST_Response {
		$terms = AI_Keywords_Taxonomy::get_all_terms();

		$data = array_map(
			static fn( \WP_Term $term ) => array(
				'id'    => $term->term_id,
				'slug'  => $term->slug,
				'name'  => $term->name,
				'count' => $term->count,
			),
			$terms
		);

		return new \WP_REST_Response( $data, 200 );
	}

	/**
	 * Render the gallery block on the frontend.
	 *
	 * @param array<string, mixed> $attributes Block attributes.
	 * @return string Rendered HTML.
	 */
	public static function render( array $attributes ): string {
		// If galleryId present, load from CPT (source of truth), with graceful fallback.
		if ( ! empty( $attributes['galleryId'] ) ) {
			$gallery_id = (int) $attributes['galleryId'];
			$post = get_post( $gallery_id );
			if ( $post && \Matcha_AI_Smart_Gallery\Gallery\Gallery_CPT::POST_TYPE === $post->post_type ) {
				$cfg = \Matcha_AI_Smart_Gallery\Gallery\Gallery_CPT::get_config( $gallery_id );
				// Merge CPT config over block attrs (CPT wins)
				$attributes = array_merge( $attributes, array(
					'sourceType'      => $cfg['sourceType'] ?? $attributes['sourceType'] ?? 'selected',
					'imageIds'        => $cfg['imageIds'] ?? $attributes['imageIds'] ?? array(),
					'aiTags'          => $cfg['aiTags'] ?? $attributes['aiTags'] ?? array(),
					'layout'          => $cfg['layout'] ?? $attributes['layout'] ?? 'grid',
					'columns'         => $cfg['columns'] ?? $attributes['columns'] ?? 3,
					'columnsTablet'   => $cfg['columnsTablet'] ?? $attributes['columnsTablet'] ?? 2,
					'columnsMobile'   => $cfg['columnsMobile'] ?? $attributes['columnsMobile'] ?? 1,
					'gutterSize'      => $cfg['gutterSize'] ?? $attributes['gutterSize'] ?? 16,
					'rowHeight'       => $cfg['rowHeight'] ?? $attributes['rowHeight'] ?? 240,
					'imageSpans'      => $cfg['imageSpans'] ?? $attributes['imageSpans'] ?? array(),
					'filtersEnabled'     => $cfg['filtersEnabled'] ?? $attributes['filtersEnabled'] ?? true,
					'filterMultiSelect'  => $cfg['filterMultiSelect'] ?? $attributes['filterMultiSelect'] ?? false,
					'filterLogic'        => $cfg['filterLogic'] ?? $attributes['filterLogic'] ?? 'or',
					'orderedFilterTags'  => $cfg['orderedFilterTags'] ?? $attributes['orderedFilterTags'] ?? array(),
					'filterStyle'        => $cfg['filterStyle'] ?? $attributes['filterStyle'] ?? 'pills',
					'filterAlign'        => $cfg['filterAlign'] ?? $attributes['filterAlign'] ?? 'left',
					'showFilterCount'    => $cfg['showFilterCount'] ?? $attributes['showFilterCount'] ?? true,
					'allFilterLabel'     => $cfg['allFilterLabel'] ?? $attributes['allFilterLabel'] ?? 'All',
					'accentColor'        => $cfg['accentColor'] ?? $attributes['accentColor'] ?? '#607d66',
					'colorFilterEnabled' => $cfg['colorFilterEnabled'] ?? $attributes['colorFilterEnabled'] ?? true,
					'proofingEnabled'    => $cfg['proofingEnabled'] ?? $attributes['proofingEnabled'] ?? false,
					'shoppableEnabled'   => $cfg['shoppableEnabled'] ?? $attributes['shoppableEnabled'] ?? true,
					'imageLinks'         => $cfg['imageLinks'] ?? $attributes['imageLinks'] ?? array(),
					'focalPoints'        => $cfg['focalPoints'] ?? $attributes['focalPoints'] ?? array(),
					'searchEnabled'      => $cfg['searchEnabled'] ?? $attributes['searchEnabled'] ?? true,
					'maxFilterTags'      => $cfg['maxFilterTags'] ?? $attributes['maxFilterTags'] ?? 8,
					'showAllFilter'      => $cfg['showAllFilter'] ?? $attributes['showAllFilter'] ?? true,
					'showTitle'          => $cfg['showTitle'] ?? $attributes['showTitle'] ?? true,
					'showCaption'        => $cfg['showCaption'] ?? $attributes['showCaption'] ?? false,
					'lightboxEnabled'    => $cfg['lightboxEnabled'] ?? $attributes['lightboxEnabled'] ?? true,
					'preloaderEnabled'   => $cfg['preloaderEnabled'] ?? $attributes['preloaderEnabled'] ?? true,
					'preloaderStyle'     => $cfg['preloaderStyle'] ?? $attributes['preloaderStyle'] ?? 'spinner',
					'instantFramesEnabled'=> $cfg['instantFramesEnabled'] ?? $attributes['instantFramesEnabled'] ?? true,
					'borderRadius'       => $cfg['borderRadius'] ?? $attributes['borderRadius'] ?? 10,
					'mattingSize'        => $cfg['mattingSize'] ?? $attributes['mattingSize'] ?? 0,
					'frameStyle'         => $cfg['frameStyle'] ?? $attributes['frameStyle'] ?? 'none',
					'shadowElevation'    => $cfg['shadowElevation'] ?? $attributes['shadowElevation'] ?? 'soft',
					'canvasBackdrop'     => $cfg['canvasBackdrop'] ?? $attributes['canvasBackdrop'] ?? 'transparent',
					'cardTheme'          => $cfg['cardTheme'] ?? $attributes['cardTheme'] ?? 'clean',
					'hoverEffect'        => $cfg['hoverEffect'] ?? $attributes['hoverEffect'] ?? 'zoom',
					'paginationType'     => $cfg['paginationType'] ?? $attributes['paginationType'] ?? 'none',
					'itemsPerPage'       => $cfg['itemsPerPage'] ?? $attributes['itemsPerPage'] ?? 12,
					'loadMoreStyle'      => $cfg['loadMoreStyle'] ?? $attributes['loadMoreStyle'] ?? 'pill',
					'loadMoreLabel'      => $cfg['loadMoreLabel'] ?? $attributes['loadMoreLabel'] ?? 'Load More Photos',
					'visibleFilterTags'  => $cfg['visibleFilterTags'] ?? $attributes['visibleFilterTags'] ?? array(),
					'sortBy'             => $cfg['sortBy'] ?? $attributes['sortBy'] ?? 'manual',
					'randomizeOrder'     => $cfg['randomizeOrder'] ?? $attributes['randomizeOrder'] ?? false,
					'frontendSortEnabled'=> $cfg['frontendSortEnabled'] ?? $attributes['frontendSortEnabled'] ?? false,
				) );
			}
		}

		// Merge with defaults.
		$attrs = wp_parse_args(
			$attributes,
			array(
				'sourceType'         => 'selected',
				'imageIds'           => array(),
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
				'colorFilterEnabled' => true,
				'proofingEnabled'    => false,
				'shoppableEnabled'   => true,
				'searchEnabled'      => true,
				'maxFilterTags'      => 8,
				'visibleFilterTags'  => array(),
				'showAllFilter'      => true,
				'showTitle'          => true,
				'showCaption'        => false,
				'lightboxEnabled'    => true,
				'preloaderEnabled'   => true,
				'preloaderStyle'     => 'spinner',
				'instantFramesEnabled'=> true,
				'borderRadius'       => 10,
				'mattingSize'        => 0,
				'frameStyle'         => 'none',
				'shadowElevation'    => 'soft',
				'canvasBackdrop'     => 'transparent',
				'cardTheme'          => 'clean',
				'hoverEffect'        => 'zoom',
				'paginationType'     => 'none',
				'itemsPerPage'       => 12,
				'loadMoreStyle'      => 'pill',
				'loadMoreLabel'      => 'Load More Photos',
				'sortBy'             => 'manual',
				'randomizeOrder'     => false,
				'frontendSortEnabled'=> false,
			)
		);

		// Fallback Pro features to free equivalents if Pro add-on is not active.
		$is_pro = \Matcha_AI_Smart_Gallery\Gallery\Gallery_CPT::is_pro_active();
		if ( ! $is_pro ) {
			if ( in_array( $attrs['layout'], array( 'pinwheel', 'bento' ), true ) ) {
				$attrs['layout'] = 'grid';
			}
			if ( in_array( $attrs['cardTheme'], array( 'glass', 'glow' ), true ) ) {
				$attrs['cardTheme'] = 'clean';
			}
			if ( in_array( $attrs['frameStyle'], array( 'black-metal', 'natural-oak', 'gold-brass', 'glass-float' ), true ) ) {
				$attrs['frameStyle'] = 'none';
			}
			if ( in_array( $attrs['paginationType'], array( 'infinite', 'pages' ), true ) ) {
				$attrs['paginationType'] = 'load-more';
			}
			if ( in_array( $attrs['preloaderStyle'], array( 'pulse', 'bar', 'logo', 'skeleton' ), true ) ) {
				$attrs['preloaderStyle'] = 'spinner';
			}
			$attrs['colorFilterEnabled'] = false;
			$attrs['proofingEnabled']    = false;
			$attrs['shoppableEnabled']   = false;
			$attrs['imageSpans']         = array();
			$attrs['sectionsEnabled']    = false;
			$attrs['sections']           = array();
			$attrs['randomizeOrder']     = false;
			$attrs['frontendSortEnabled']= false;
			$attrs['filterMultiSelect']  = false;
			if ( ! in_array( $attrs['sortBy'], array( 'manual', 'name-asc', 'name-desc' ), true ) ) {
				$attrs['sortBy'] = 'manual';
			}
		}

		// Query items.
		$query = new Gallery_Query(
			array(
				'source_type' => $attrs['sourceType'],
				'image_ids'   => $attrs['imageIds'],
				'ai_tags'     => $attrs['aiTags'],
			)
		);

		$items = $query->get_items();

		if ( empty( $items ) ) {
			return '';
		}

		// Apply server-rendered initial sort if not manual
		if ( ! empty( $attrs['sortBy'] ) && 'manual' !== $attrs['sortBy'] ) {
			if ( 'name-asc' === $attrs['sortBy'] ) {
				usort( $items, static fn( $a, $b ) => strcasecmp( (string) ( $a['title'] ?? '' ), (string) ( $b['title'] ?? '' ) ) );
			} elseif ( 'name-desc' === $attrs['sortBy'] ) {
				usort( $items, static fn( $a, $b ) => strcasecmp( (string) ( $b['title'] ?? '' ), (string) ( $a['title'] ?? '' ) ) );
			} elseif ( $is_pro && 'newest' === $attrs['sortBy'] ) {
				usort( $items, static fn( $a, $b ) => ( $b['id'] ?? 0 ) <=> ( $a['id'] ?? 0 ) );
			} elseif ( $is_pro && 'oldest' === $attrs['sortBy'] ) {
				usort( $items, static fn( $a, $b ) => ( $a['id'] ?? 0 ) <=> ( $b['id'] ?? 0 ) );
			}
		}

		// Enqueue frontend assets.
		self::enqueue_frontend_assets();

		// Collect tag counts & all unique colors
		$tag_counts    = array();
		$unique_colors = array();
		$ai_count      = 0;
		foreach ( $items as $item ) {
			if ( ! empty( $item['ai_generated'] ) ) {
				++$ai_count;
			}
			foreach ( $item['keywords'] as $keyword ) {
				$slug = sanitize_title( $keyword );
				if ( '' === $slug ) {
					continue;
				}
				$tag_counts[ $slug ] = ( $tag_counts[ $slug ] ?? 0 ) + 1;
			}
			if ( ! empty( $item['colors'] ) && is_array( $item['colors'] ) ) {
				foreach ( $item['colors'] as $hex ) {
					if ( preg_match( '/^#[a-fA-F0-9]{6}$/', $hex ) ) {
						$unique_colors[ strtolower( $hex ) ] = true;
					}
				}
			}
		}

		// Sort tags by frequency (or respect explicit user selection)
		if ( ! empty( $attrs['visibleFilterTags'] ) && is_array( $attrs['visibleFilterTags'] ) ) {
			$valid_user_tags = array_intersect( $attrs['visibleFilterTags'], array_keys( $tag_counts ) );
			$visible_tags    = ! empty( $valid_user_tags ) ? array_values( $valid_user_tags ) : array();
		} else {
			arsort( $tag_counts );
			$max_tags     = max( 0, (int) $attrs['maxFilterTags'] );
			$visible_tags = $max_tags > 0 ? array_slice( array_keys( $tag_counts ), 0, $max_tags ) : array_keys( $tag_counts );
			sort( $visible_tags );
		}
		$total_items   = count( $items );
		$sorted_colors = array_keys( $unique_colors );

		// Build HTML.
		$gallery_post_id = ! empty( $attributes['galleryId'] ) ? (int) $attributes['galleryId'] : ( ! empty( $gallery_id ) ? $gallery_id : wp_rand( 1000, 9999 ) );
		$unique_id       = 'matcha-gallery-' . $gallery_post_id;

		$wrapper_classes = array(
			'matcha-gallery',
			'matcha-gallery--' . sanitize_html_class( $attrs['layout'] ),
			'matcha-gallery--theme-' . sanitize_html_class( $attrs['cardTheme'] ),
			'matcha-gallery--frame-' . sanitize_html_class( $attrs['frameStyle'] ?? 'none' ),
			'matcha-gallery--shadow-' . sanitize_html_class( $attrs['shadowElevation'] ?? 'soft' ),
			'matcha-gallery--hover-' . sanitize_html_class( $attrs['hoverEffect'] ?? 'zoom' ),
		);

		if ( ! empty( $attrs['canvasBackdrop'] ) && 'transparent' !== $attrs['canvasBackdrop'] ) {
			$wrapper_classes[] = 'matcha-gallery--backdrop-' . sanitize_html_class( $attrs['canvasBackdrop'] );
		}

		if ( $attrs['lightboxEnabled'] ) {
			$wrapper_classes[] = 'matcha-gallery--lightbox';
		}
		if ( $attrs['proofingEnabled'] ) {
			$wrapper_classes[] = 'matcha-gallery--proofing';
		}

		$css_vars = sprintf(
			'--matcha-columns: %d; --matcha-columns-tablet: %d; --matcha-columns-mobile: %d; --matcha-gutter: %dpx; --matcha-radius: %dpx; --matcha-row-height: %dpx; --matcha-matting: %dpx; --matcha-accent: %s;',
			(int) $attrs['columns'],
			(int) $attrs['columnsTablet'],
			(int) $attrs['columnsMobile'],
			(int) $attrs['gutterSize'],
			(int) $attrs['borderRadius'],
			(int) $attrs['rowHeight'],
			(int) $attrs['mattingSize'],
			esc_attr( $attrs['accentColor'] ?? '#607d66' )
		);

		$image_spans  = (array) ( $attrs['imageSpans'] ?? array() );
		$image_links  = (array) ( $attrs['imageLinks'] ?? array() );
		$focal_points = (array) ( $attrs['focalPoints'] ?? array() );
		$sections     = (array) ( $attrs['sections'] ?? array() );
		$has_sections = ! empty( $attrs['sectionsEnabled'] ) && count( $sections ) > 1;

		$img_sections = array();
		if ( $has_sections ) {
			foreach ( $sections as $sec ) {
				$s_id = $sec['id'] ?? '';
				foreach ( (array) ( $sec['imageIds'] ?? array() ) as $s_img_id ) {
					if ( ! isset( $img_sections[ (string) $s_img_id ] ) ) {
						$img_sections[ (string) $s_img_id ] = array();
					}
					$img_sections[ (string) $s_img_id ][] = $s_id;
				}
			}
		}

		ob_start();
		?>
		<div
			id="<?php echo esc_attr( $unique_id ); ?>"
			class="<?php echo esc_attr( implode( ' ', $wrapper_classes ) ); ?>"
			data-layout="<?php echo esc_attr( $attrs['layout'] ); ?>"
			data-lightbox="<?php echo $attrs['lightboxEnabled'] ? 'true' : 'false'; ?>"
			data-pagination="<?php echo esc_attr( $attrs['paginationType'] ?? 'none' ); ?>"
			data-per-page="<?php echo (int) ( $attrs['itemsPerPage'] ?? 12 ); ?>"
			data-sort-by="<?php echo esc_attr( $attrs['sortBy'] ?? 'manual' ); ?>"
			data-randomize="<?php echo ( $is_pro && ! empty( $attrs['randomizeOrder'] ) ) ? 'true' : 'false'; ?>"
			data-frontend-sort="<?php echo ( $is_pro && ! empty( $attrs['frontendSortEnabled'] ) ) ? 'true' : 'false'; ?>"
			style="<?php echo esc_attr( $css_vars ); ?>"
		>
			<?php if ( $has_sections ) : ?>
				<div class="matcha-gallery__section-tabs" role="tablist" aria-label="<?php esc_attr_e( 'Gallery Chapters', 'matcha-gallery' ); ?>">
					<button type="button" class="matcha-section-tab matcha-section-tab--active" data-section="*" role="tab" aria-selected="true">
						<?php esc_html_e( 'All Chapters', 'matcha-gallery' ); ?> <span class="matcha-section-tab__count"><?php echo (int) $total_items; ?></span>
					</button>
					<?php foreach ( $sections as $sec ) : ?>
						<?php $sec_count = count( (array) ( $sec['imageIds'] ?? array() ) ); ?>
						<button type="button" class="matcha-section-tab" data-section="<?php echo esc_attr( $sec['id'] ); ?>" role="tab" aria-selected="false">
							<?php echo esc_html( $sec['title'] ); ?> <span class="matcha-section-tab__count"><?php echo (int) $sec_count; ?></span>
						</button>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>

			<?php if ( $attrs['searchEnabled'] || ( $attrs['filtersEnabled'] && ! empty( $visible_tags ) ) || ( $attrs['colorFilterEnabled'] && ! empty( $sorted_colors ) ) || ( $is_pro && ! empty( $attrs['frontendSortEnabled'] ) ) ) : ?>
				<div class="matcha-gallery__toolbar">
					<?php if ( $attrs['searchEnabled'] ) : ?>
						<div class="matcha-gallery__search-wrap">
							<span class="matcha-search-icon" aria-hidden="true">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
							</span>
							<input
								type="search"
								class="matcha-gallery__search-input"
								placeholder="<?php esc_attr_e( 'Search gallery...', 'matcha-gallery' ); ?>"
								aria-label="<?php esc_attr_e( 'Search images', 'matcha-gallery' ); ?>"
							/>
						</div>
					<?php endif; ?>

					<?php if ( $is_pro && ! empty( $attrs['frontendSortEnabled'] ) ) : ?>
						<div class="matcha-gallery__sort-wrap">
							<select class="matcha-gallery__sort-select" aria-label="<?php esc_attr_e( 'Sort images', 'matcha-gallery' ); ?>">
								<option value="default"><?php esc_html_e( 'Default Order', 'matcha-gallery' ); ?></option>
								<option value="name-asc"><?php esc_html_e( 'Title (A → Z)', 'matcha-gallery' ); ?></option>
								<option value="name-desc"><?php esc_html_e( 'Title (Z → A)', 'matcha-gallery' ); ?></option>
								<option value="newest"><?php esc_html_e( 'Date Added (Newest)', 'matcha-gallery' ); ?></option>
								<option value="oldest"><?php esc_html_e( 'Date Added (Oldest)', 'matcha-gallery' ); ?></option>
								<option value="random"><?php esc_html_e( 'Random Shuffle', 'matcha-gallery' ); ?></option>
							</select>
						</div>
					<?php endif; ?>

					<?php if ( $attrs['colorFilterEnabled'] && ! empty( $sorted_colors ) ) : ?>
						<div class="matcha-gallery__color-swatches" role="group" aria-label="<?php esc_attr_e( 'Filter by color', 'matcha-gallery' ); ?>">
							<span class="matcha-color-label" title="<?php esc_attr_e( 'Palette', 'matcha-gallery' ); ?>">
								<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
							</span>
							<?php foreach ( array_slice( $sorted_colors, 0, 8 ) as $hex ) : ?>
								<button
									type="button"
									class="matcha-color-dot"
									data-color="<?php echo esc_attr( $hex ); ?>"
									style="background-color: <?php echo esc_attr( $hex ); ?>;"
									title="<?php
									/* translators: %s: Hex color code */
									echo esc_attr( sprintf( __( 'Filter color %s', 'matcha-gallery' ), $hex ) );
									?>"
									aria-label="<?php echo esc_attr( $hex ); ?>"
								></button>
							<?php endforeach; ?>
						</div>
					<?php endif; ?>

					<?php if ( $attrs['filtersEnabled'] && ! empty( $visible_tags ) ) : 
						// Sort tags by custom drag-and-drop order if available
						$ordered_tags = ! empty( $attrs['orderedFilterTags'] ) ? $attrs['orderedFilterTags'] : array();
						$sorted_visible_tags = array();
						
						// First, push tags that exist in the ordered list (in their defined order)
						foreach ( $ordered_tags as $o_tag ) {
							if ( in_array( $o_tag, $visible_tags, true ) ) {
								$sorted_visible_tags[] = $o_tag;
							}
						}
						// Then, append any remaining tags that weren't in the ordered list
						foreach ( $visible_tags as $v_tag ) {
							if ( ! in_array( $v_tag, $sorted_visible_tags, true ) ) {
								$sorted_visible_tags[] = $v_tag;
							}
						}
					?>
						<div class="matcha-gallery__filters matcha-gallery__filters--style-<?php echo esc_attr( $attrs['filterStyle'] ?? 'pills' ); ?> matcha-gallery__filters--align-<?php echo esc_attr( $attrs['filterAlign'] ?? 'left' ); ?> <?php echo empty( $attrs['showFilterCount'] ) ? 'matcha-gallery__filters--hide-count' : ''; ?>" data-filter-logic="<?php echo esc_attr( $attrs['filterLogic'] ?? 'or' ); ?>" data-filter-multiselect="<?php echo $attrs['filterMultiSelect'] ? 'true' : 'false'; ?>" role="toolbar" aria-label="<?php esc_attr_e( 'Gallery filters', 'matcha-gallery' ); ?>">
							<?php if ( $attrs['showAllFilter'] ) : ?>
								<button
									class="matcha-filter matcha-filter--active matcha-filter--all"
									data-filter="*"
									type="button"
									aria-pressed="true"
								>
									<?php echo esc_html( ! empty( $attrs['allFilterLabel'] ) ? $attrs['allFilterLabel'] : __( 'All', 'matcha-gallery' ) ); ?>
									<?php if ( ! empty( $attrs['showFilterCount'] ) ) : ?>
										<span class="matcha-filter__count"><?php echo (int) $total_items; ?></span>
									<?php endif; ?>
								</button>
							<?php endif; ?>

							<?php foreach ( $sorted_visible_tags as $tag ) : ?>
								<button
									class="matcha-filter"
									data-filter="<?php echo esc_attr( $tag ); ?>"
									type="button"
									aria-pressed="false"
								>
									<?php echo esc_html( ucfirst( str_replace( '-', ' ', $tag ) ) ); ?>
									<?php if ( ! empty( $attrs['showFilterCount'] ) ) : ?>
										<span class="matcha-filter__count"><?php echo (int) $tag_counts[ $tag ]; ?></span>
									<?php endif; ?>
								</button>
							<?php endforeach; ?>
						</div>
					<?php endif; ?>
				</div>
			<?php endif; ?>
			
			<?php if ( $attrs['preloaderEnabled'] ) : ?>
				<div class="matcha-gallery-preloader matcha-preloader--style-<?php echo esc_attr( $attrs['preloaderStyle'] ); ?>">
					<?php if ( 'spinner' === $attrs['preloaderStyle'] ) : ?>
						<div class="matcha-preloader-spinner"></div>
					<?php endif; ?>
				</div>
			<?php endif; ?>

			<div class="matcha-gallery__grid <?php echo $attrs['instantFramesEnabled'] ? 'matcha-gallery__grid--instant-frames' : ''; ?>">
				<?php
				$item_idx = 0;
				$mosaic_rhythm = array( '2x2', '1x1', '1x1', '2x1', '1x1', '1x2', '1x1', '2x1' );
				foreach ( $items as $item ) :
					$item_tags   = array_map( 'sanitize_title', $item['keywords'] );
					$tag_string  = implode( ' ', $item_tags );
					$att_id      = (string) $item['id'];
					$sec_string  = implode( ' ', $img_sections[ $att_id ] ?? array() );
					$span        = ( $is_pro && ! empty( $image_spans[ $att_id ] ) && is_string( $image_spans[ $att_id ] ) )
						? $image_spans[ $att_id ]
						: ( 'mosaic' === $attrs['layout'] ? $mosaic_rhythm[ $item_idx % count( $mosaic_rhythm ) ] : ( is_string( $image_spans[ $att_id ] ?? null ) ? $image_spans[ $att_id ] : '1x1' ) );
					$span_class  = in_array( $attrs['layout'], array( 'mosaic', 'pinwheel' ), true ) ? ' matcha-gallery__item--span-' . sanitize_html_class( $span ) : '';
					$item_colors = implode( ',', (array) ( $item['colors'] ?? array() ) );
					$fp          = $focal_points[ $att_id ] ?? ( $item['focal_point'] ?? array( 'x' => 50, 'y' => 50 ) );
					$zoom        = $is_pro ? (float) ( $fp['zoom'] ?? 1.0 ) : 1.0;
					$img_style   = sprintf(
						'object-position: %d%% %d%%; transform: scale(%.2f); transform-origin: %d%% %d%%;',
						(int) $fp['x'],
						(int) $fp['y'],
						$zoom,
						(int) $fp['x'],
						(int) $fp['y']
					);
					$link        = $image_links[ $att_id ] ?? null;

					$item_extra_style = '';
					
					// Calculate Aspect Ratio for Zero-CLS Frame Reservation
					$w = max( 1, (int) ( $item['width'] ?? 800 ) );
					$h = max( 1, (int) ( $item['height'] ?? 600 ) );
					$aspect_ratio = round( $w / $h, 4 );
					
					if ( $attrs['instantFramesEnabled'] ) {
						if ( 'grid' === $attrs['layout'] ) {
							$item_extra_style .= '--matcha-aspect: 1;';
						} elseif ( 'masonry' === $attrs['layout'] ) {
							$item_extra_style .= sprintf( '--matcha-aspect: %s;', $aspect_ratio );
						}
					}
					
					if ( 'justified' === $attrs['layout'] ) {
						$item_extra_style .= sprintf(
							' flex: %.3f 1 calc(var(--matcha-row-height) * %.3f); max-width: calc(var(--matcha-row-height) * %.3f * 2);',
							$aspect_ratio,
							$aspect_ratio,
							$aspect_ratio
						);
					}
					
					$style_attr = ! empty( $item_extra_style ) ? 'style="' . esc_attr( trim( $item_extra_style ) ) . '"' : '';
					?>
					<div
						class="matcha-gallery__item<?php echo ! empty( $item['ai_generated'] ) ? ' matcha-gallery__item--ai' : ''; ?><?php echo esc_attr( $span_class ); ?>"
						data-id="<?php echo esc_attr( $att_id ); ?>"
						data-sections="<?php echo esc_attr( $sec_string ); ?>"
						data-tags="<?php echo esc_attr( $tag_string ); ?>"
						data-colors="<?php echo esc_attr( $item_colors ); ?>"
						data-full-src="<?php echo esc_url( $item['full_url'] ); ?>"
						data-title="<?php echo esc_attr( $item['title'] ); ?>"
						data-caption="<?php echo esc_attr( $item['caption'] ); ?>"
						data-date="<?php echo esc_attr( get_post_time( 'U', true, $att_id ) ); ?>"
						<?php echo $style_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					>
						<div class="matcha-gallery__item-inner">
							<img
								src="<?php echo esc_url( $item['url'] ); ?>"
								alt="<?php echo esc_attr( $item['alt'] ); ?>"
								loading="lazy"
								decoding="async"
								width="<?php echo esc_attr( $item['width'] ); ?>"
								height="<?php echo esc_attr( $item['height'] ); ?>"
								style="<?php echo esc_attr( $img_style ); ?>"
							/>
							<div class="matcha-gallery__overlay">
								<span class="matcha-gallery__zoom-icon" aria-hidden="true">
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
										<path d="M11 8v6M8 11h6"/>
									</svg>
								</span>
							</div>

							<?php if ( $attrs['proofingEnabled'] ) : ?>
								<button type="button" class="matcha-gallery__proof-btn" data-id="<?php echo esc_attr( $att_id ); ?>" title="<?php esc_attr_e( 'Add to favorites', 'matcha-gallery' ); ?>" aria-label="<?php esc_attr_e( 'Add to favorites', 'matcha-gallery' ); ?>">
									<span class="matcha-heart-icon" aria-hidden="true">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
									</span>
								</button>
							<?php endif; ?>

							<?php if ( $attrs['shoppableEnabled'] && ! empty( $link['url'] ) ) : ?>
								<div class="matcha-gallery__shop-bar">
									<a
										href="<?php echo esc_url( $link['url'] ); ?>"
										target="<?php echo esc_attr( $link['target'] ?? '_self' ); ?>"
										class="matcha-gallery__shop-btn"
										onclick="event.stopPropagation();"
									>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
										<span><?php echo esc_html( $link['label'] ?: __( 'Shop Now', 'matcha-gallery' ) ); ?></span>
										<?php if ( ! empty( $link['price'] ) ) : ?>
											<span class="matcha-gallery__shop-price"><?php echo esc_html( $link['price'] ); ?></span>
										<?php endif; ?>
									</a>
								</div>
							<?php endif; ?>

							<?php if ( $attrs['showTitle'] || $attrs['showCaption'] ) : ?>
								<div class="matcha-gallery__info">
									<?php if ( $attrs['showTitle'] && ! empty( $item['title'] ) ) : ?>
										<h4 class="matcha-gallery__title"><?php echo esc_html( $item['title'] ); ?></h4>
									<?php endif; ?>
									<?php if ( $attrs['showCaption'] && ! empty( $item['caption'] ) ) : ?>
										<p class="matcha-gallery__caption"><?php echo esc_html( $item['caption'] ); ?></p>
									<?php endif; ?>
								</div>
							<?php endif; ?>
						</div>
					</div>
				<?php $item_idx++; endforeach; ?>
			</div>

			<?php if ( ! empty( $attrs['paginationType'] ) && 'none' !== $attrs['paginationType'] ) : ?>
				<?php if ( in_array( $attrs['paginationType'], array( 'load-more', 'infinite' ), true ) ) : ?>
					<div class="matcha-gallery__load-more-wrap">
						<button type="button" class="matcha-gallery__load-more-btn matcha-gallery__load-more-btn--<?php echo esc_attr( $attrs['loadMoreStyle'] ?? 'pill' ); ?>" data-pagination-type="<?php echo esc_attr( $attrs['paginationType'] ); ?>">
							<span class="matcha-load-text"><?php echo esc_html( ! empty( $attrs['loadMoreLabel'] ) ? $attrs['loadMoreLabel'] : __( 'Load More Photos', 'matcha-gallery' ) ); ?></span>
							<span class="matcha-load-spinner" style="display:none;">⏳</span>
						</button>
					</div>
				<?php elseif ( 'pages' === $attrs['paginationType'] ) : ?>
					<div class="matcha-gallery__pagination" role="navigation" aria-label="<?php esc_attr_e( 'Gallery Pages', 'matcha-gallery' ); ?>"></div>
				<?php endif; ?>
			<?php endif; ?>

			<?php if ( $attrs['proofingEnabled'] ) : ?>
				<div class="matcha-gallery__favorites-tray">
					<div class="matcha-gallery__favorites-info">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg><strong class="matcha-fav-count">0</strong> <?php esc_html_e( 'Favorites Selected', 'matcha-gallery' ); ?>
					</div>
					<button type="button" class="matcha-gallery__export-btn button button-small">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><?php esc_html_e( 'Copy ID List', 'matcha-gallery' ); ?>
					</button>
				</div>
			<?php endif; ?>
		</div>
		<?php

		return ob_get_clean();
	}

	/**
	 * Enqueue frontend CSS and JS when the block or widget is rendered.
	 */
	public static function enqueue_frontend_assets(): void {
		$css_file = MATCHA_GALLERY_PATH . 'assets/css/frontend-gallery.css';
		$js_file  = MATCHA_GALLERY_PATH . 'assets/js/frontend-gallery.js';
		$css_ver  = file_exists( $css_file ) ? (string) filemtime( $css_file ) : MATCHA_GALLERY_VERSION;
		$js_ver   = file_exists( $js_file ) ? (string) filemtime( $js_file ) : MATCHA_GALLERY_VERSION;

		wp_enqueue_style(
			'matcha-gallery-frontend',
			MATCHA_GALLERY_URL . 'assets/css/frontend-gallery.css',
			array(),
			$css_ver
		);

		wp_enqueue_script(
			'matcha-gallery-frontend',
			MATCHA_GALLERY_URL . 'assets/js/frontend-gallery.js',
			array(),
			$js_ver,
			true
		);
	}
}
