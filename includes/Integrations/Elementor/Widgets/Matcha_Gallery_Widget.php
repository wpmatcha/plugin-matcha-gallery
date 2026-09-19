<?php
/**
 * Matcha Gallery Elementor Widget.
 *
 * Dedicated visual element for Elementor Page Builder.
 *
 * @package Matcha_AI_Smart_Gallery\Integrations\Elementor\Widgets
 */

namespace Matcha_AI_Smart_Gallery\Integrations\Elementor\Widgets;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Widget_Base;
use Elementor\Controls_Manager;
use Matcha_AI_Smart_Gallery\Gallery\Gallery_CPT;
use Matcha_AI_Smart_Gallery\Blocks\Smart_Gallery_Block;
use Matcha_AI_Smart_Gallery\Pro\Pro_Features;

/**
 * Matcha Gallery Widget for Elementor.
 */
class Matcha_Gallery_Widget extends Widget_Base {

	/**
	 * Get widget unique slug.
	 */
	public function get_name(): string {
		return 'matcha_gallery';
	}

	/**
	 * Get widget display title.
	 */
	public function get_title(): string {
		return __( 'Matcha Gallery', 'matcha-gallery' );
	}

	/**
	 * Get widget icon class.
	 */
	public function get_icon(): string {
		return 'eicon-gallery-grid';
	}

	/**
	 * Get widget categories.
	 */
	public function get_categories(): array {
		return array( 'matcha-gallery', 'general' );
	}

	/**
	 * Get widget keywords for search.
	 */
	public function get_keywords(): array {
		return array( 'gallery', 'photo', 'masonry', 'portfolio', 'mosaic', 'matcha', 'image', 'wall', 'lightbox' );
	}

	/**
	 * Get widget style dependencies.
	 */
	public function get_style_depends(): array {
		return array( 'matcha-gallery-frontend' );
	}

	/**
	 * Get widget script dependencies.
	 */
	public function get_script_depends(): array {
		return array( 'matcha-gallery-frontend' );
	}

	/**
	 * Fetch all saved Matcha Studio galleries for the dropdown.
	 *
	 * @return array<int|string, string>
	 */
	private function get_gallery_options(): array {
		$options = array( '' => __( '-- Select a Matcha Gallery --', 'matcha-gallery' ) );

		$galleries = get_posts(
			array(
				'post_type'      => Gallery_CPT::POST_TYPE,
				'post_status'    => array( 'publish', 'draft' ),
				'posts_per_page' => 100,
				'orderby'        => 'title',
				'order'          => 'ASC',
			)
		);

		if ( ! empty( $galleries ) ) {
			foreach ( $galleries as $gal ) {
				$title = ! empty( $gal->post_title ) ? $gal->post_title : sprintf( __( 'Gallery #%d', 'matcha-gallery' ), $gal->ID );
				$options[ $gal->ID ] = $title;
			}
		}

		return $options;
	}

	/**
	 * Register widget controls in Elementor panel.
	 */
	protected function register_controls(): void {
		$is_pro = Pro_Features::is_pro();

		// ==========================================
		// SECTION: GALLERY SELECTION
		// ==========================================
		$this->start_controls_section(
			'section_gallery',
			array(
				'label' => __( 'Matcha Gallery', 'matcha-gallery' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'gallery_id',
			array(
				'label'       => __( 'Select Gallery', 'matcha-gallery' ),
				'type'        => Controls_Manager::SELECT,
				'options'     => $this->get_gallery_options(),
				'default'     => '',
				'description' => __( 'Select a gallery created in the Matcha Studio visual editor.', 'matcha-gallery' ),
			)
		);

		$studio_url = admin_url( 'admin.php?page=matcha-studio' );
		$this->add_control(
			'studio_quick_link',
			array(
				'type' => Controls_Manager::RAW_HTML,
				'raw'  => sprintf(
					'<div style="margin-top:8px;padding:10px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;font-size:12px;color:#166534;display:flex;justify-content:space-between;align-items:center;">
						<span style="display:inline-flex;align-items:center;gap:5px;">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
							<strong>Matcha Studio</strong>
						</span>
						<a href="%s" target="_blank" rel="noopener noreferrer" style="color:#15803d;text-decoration:underline;font-weight:700;">Open Builder ↗</a>
					</div>',
					esc_url( $studio_url )
				),
			)
		);

		$this->end_controls_section();

		// ==========================================
		// SECTION: LAYOUT OVERRIDES (OPTIONAL)
		// ==========================================
		$this->start_controls_section(
			'section_layout_overrides',
			array(
				'label' => __( 'Layout & Framing Overrides', 'matcha-gallery' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'override_layout',
			array(
				'label'        => __( 'Customize Layout Here', 'matcha-gallery' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => __( 'Yes', 'matcha-gallery' ),
				'label_off'    => __( 'Inherit', 'matcha-gallery' ),
				'return_value' => 'yes',
				'default'      => 'no',
				'description'  => __( 'Override the layout configured in Matcha Studio for this specific page.', 'matcha-gallery' ),
			)
		);

		$layout_options = array(
			'grid'      => __( 'Classic Grid', 'matcha-gallery' ),
			'masonry'   => __( 'Pinterest Masonry', 'matcha-gallery' ),
			'justified' => __( 'Flickr Justified Rows', 'matcha-gallery' ),
		);

		if ( $is_pro ) {
			$layout_options['mosaic']   = __( 'PhotoBlocks Mosaic (PRO)', 'matcha-gallery' );
			$layout_options['pinwheel'] = __( 'Pinwheel Spiral (PRO)', 'matcha-gallery' );
			$layout_options['bento']    = __( 'Bento Showcase (PRO)', 'matcha-gallery' );
		}

		$this->add_control(
			'layout_type',
			array(
				'label'     => __( 'Layout Blueprint', 'matcha-gallery' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => $layout_options,
				'default'   => 'grid',
				'condition' => array(
					'override_layout' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'columns',
			array(
				'label'       => __( 'Columns', 'matcha-gallery' ),
				'type'        => Controls_Manager::NUMBER,
				'min'         => 1,
				'max'         => 8,
				'step'        => 1,
				'default'     => 4,
				'condition'   => array(
					'override_layout' => 'yes',
					'layout_type'     => array( 'grid', 'masonry' ),
				),
			)
		);

		$this->add_control(
			'gutter',
			array(
				'label'      => __( 'Gutter Size (px)', 'matcha-gallery' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px' ),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 48,
						'step' => 2,
					),
				),
				'default'    => array(
					'unit' => 'px',
					'size' => 16,
				),
				'condition'  => array(
					'override_layout' => 'yes',
				),
			)
		);

		$frame_options = array(
			'none'          => __( 'None (Clean Borderless)', 'matcha-gallery' ),
			'white-matting' => __( 'White Gallery Matting', 'matcha-gallery' ),
		);

		if ( $is_pro ) {
			$frame_options['natural-oak'] = __( 'Natural Oak Wood (PRO)', 'matcha-gallery' );
			$frame_options['black-metal'] = __( 'Slim Black Metal (PRO)', 'matcha-gallery' );
			$frame_options['gold-brass']  = __( 'Brushed Gold Brass (PRO)', 'matcha-gallery' );
			$frame_options['glass-float'] = __( 'Glass Float Acrylic (PRO)', 'matcha-gallery' );
		}

		$this->add_control(
			'frame_style',
			array(
				'label'     => __( 'Picture Frame Style', 'matcha-gallery' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => $frame_options,
				'default'   => 'none',
				'condition' => array(
					'override_layout' => 'yes',
				),
			)
		);

		$this->end_controls_section();

		// ==========================================
		// SECTION: DISPLAY & TOOLBAR OVERRIDES
		// ==========================================
		$this->start_controls_section(
			'section_display_overrides',
			array(
				'label' => __( 'Toolbar & Features', 'matcha-gallery' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'override_display',
			array(
				'label'        => __( 'Customize Toolbar Here', 'matcha-gallery' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => __( 'Yes', 'matcha-gallery' ),
				'label_off'    => __( 'Inherit', 'matcha-gallery' ),
				'return_value' => 'yes',
				'default'      => 'no',
			)
		);

		$this->add_control(
			'show_search',
			array(
				'label'     => __( 'Live Search Input', 'matcha-gallery' ),
				'type'      => Controls_Manager::SWITCHER,
				'default'   => 'yes',
				'condition' => array(
					'override_display' => 'yes',
				),
			)
		);

		$this->add_control(
			'show_filters',
			array(
				'label'     => __( 'Category Filter Pills', 'matcha-gallery' ),
				'type'      => Controls_Manager::SWITCHER,
				'default'   => 'yes',
				'condition' => array(
					'override_display' => 'yes',
				),
			)
		);

		if ( $is_pro ) {
			$this->add_control(
				'show_colors',
				array(
					'label'     => __( 'AI Color Dot Swatches (PRO)', 'matcha-gallery' ),
					'type'      => Controls_Manager::SWITCHER,
					'default'   => 'yes',
					'condition' => array(
						'override_display' => 'yes',
					),
				)
			);
		}

		$this->add_control(
			'enable_lightbox',
			array(
				'label'     => __( 'Fullscreen Lightbox', 'matcha-gallery' ),
				'type'      => Controls_Manager::SWITCHER,
				'default'   => 'yes',
				'condition' => array(
					'override_display' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render widget output in frontend and Elementor editor.
	 */
	protected function render(): void {
		$settings = $this->get_settings_for_display();
		$gid      = ! empty( $settings['gallery_id'] ) ? absint( $settings['gallery_id'] ) : 0;

		if ( $gid <= 0 ) {
			if ( \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
				?>
				<div style="padding: 40px 24px; text-align: center; background: #0f1411; border: 2px dashed #22c55e; border-radius: 12px; color: #f2f5f3; font-family: sans-serif;">
					<span style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; margin: 0 auto 12px; background: rgba(34, 197, 94, 0.15); border-radius: 12px; color: #22c55e;">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
					</span>
					<h3 style="margin: 0 0 6px; color: #22c55e; font-size: 18px; font-weight: 700;">
						<?php esc_html_e( 'Matcha Gallery', 'matcha-gallery' ); ?>
					</h3>
					<p style="margin: 0 0 16px; color: #94a3b8; font-size: 13px;">
						<?php esc_html_e( 'Select a gallery from the widget panel on the left to display your photos.', 'matcha-gallery' ); ?>
					</p>
					<a href="<?php echo esc_url( admin_url( 'admin.php?page=matcha-studio' ) ); ?>" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; background: #22c55e; color: #052e16; padding: 8px 18px; border-radius: 6px; font-weight: 800; font-size: 12px; text-decoration: none;">
						<?php esc_html_e( 'Open Matcha Studio Builder ↗', 'matcha-gallery' ); ?>
					</a>
				</div>
				<?php
			}
			return;
		}

		$post = get_post( $gid );
		if ( ! $post || Gallery_CPT::POST_TYPE !== $post->post_type ) {
			if ( \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
				?>
				<div style="padding: 20px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 13px;">
					<strong><?php esc_html_e( 'Matcha Gallery Notice:', 'matcha-gallery' ); ?></strong>
					<?php esc_html_e( 'Selected gallery was not found. Please choose an existing gallery.', 'matcha-gallery' ); ?>
				</div>
				<?php
			}
			return;
		}

		// Load stored Studio configuration
		$cfg              = Gallery_CPT::get_config( $gid );
		$cfg['galleryId'] = $gid;

		// Apply layout overrides if enabled
		if ( ! empty( $settings['override_layout'] ) && 'yes' === $settings['override_layout'] ) {
			if ( ! empty( $settings['layout_type'] ) ) {
				$cfg['layout'] = sanitize_key( $settings['layout_type'] );
			}
			if ( ! empty( $settings['columns'] ) ) {
				$cfg['columns'] = absint( $settings['columns'] );
			}
			if ( isset( $settings['gutter']['size'] ) ) {
				$cfg['gutterSize'] = absint( $settings['gutter']['size'] );
			}
			if ( ! empty( $settings['frame_style'] ) ) {
				$cfg['frameStyle'] = sanitize_key( $settings['frame_style'] );
			}
		}

		// Apply display overrides if enabled
		if ( ! empty( $settings['override_display'] ) && 'yes' === $settings['override_display'] ) {
			$cfg['searchEnabled']    = 'yes' === ( $settings['show_search'] ?? 'no' );
			$cfg['filtersEnabled']   = 'yes' === ( $settings['show_filters'] ?? 'no' );
			$cfg['lightboxEnabled']  = 'yes' === ( $settings['enable_lightbox'] ?? 'no' );
			if ( isset( $settings['show_colors'] ) ) {
				$cfg['colorFilterEnabled'] = 'yes' === $settings['show_colors'];
			}
		}

		// Render the gallery markup
		echo Smart_Gallery_Block::render( $cfg ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

		// If rendered inside Elementor Live Editor, trigger immediate JS re-initialization
		if ( \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
			?>
			<script>
			if (typeof window.matchaInitGalleries === 'function') {
				setTimeout(function() {
					window.matchaInitGalleries();
				}, 150);
			}
			</script>
			<?php
		}
	}
}
