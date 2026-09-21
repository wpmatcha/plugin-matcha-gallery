<?php
/**
 * Full-Screen Studio page (Matcha Studio).
 *
 * @package Matcha_AI_Smart_Gallery\Admin
 */


namespace Matcha_AI_Smart_Gallery\Admin;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


use Matcha_AI_Smart_Gallery\Gallery\Gallery_CPT;

/**
 * Renders the isolated full-screen Studio.
 */
final class Studio_Page {

	/**
	 * Page slug.
	 */
	public const PAGE_SLUG = 'matcha-studio';

	/**
	/**
	 * Register hooks.
	 */
	public static function register(): void {
		add_action( 'admin_init', array( static::class, 'handle_actions' ) );
		add_action( 'admin_menu', array( static::class, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( static::class, 'enqueue_assets' ) );
		add_action( 'admin_head', array( static::class, 'render_menu_icon_styles' ) );
	}

	/**
	 * Handle Hub actions (duplicate, trash).
	 */
	public static function handle_actions(): void {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';
		if ( 'matcha-ai-hub' !== $page ) {
			return;
		}

		// Duplicate gallery
		if ( isset( $_GET['action'], $_GET['gallery_id'] ) && 'duplicate' === $_GET['action'] ) {
			$gallery_id = absint( $_GET['gallery_id'] );
			check_admin_referer( 'matcha_duplicate_' . $gallery_id );

			$post = get_post( $gallery_id );
			if ( $post && Gallery_CPT::POST_TYPE === $post->post_type ) {
				$new_id = wp_insert_post(
					array(
						'post_title'  => sprintf( __( '%s (Copy)', 'matcha-gallery' ), $post->post_title ?: __( 'Untitled Gallery', 'matcha-gallery' ) ),
						'post_type'   => Gallery_CPT::POST_TYPE,
						'post_status' => 'publish',
					)
				);
				if ( $new_id && ! is_wp_error( $new_id ) ) {
					$cfg = Gallery_CPT::get_config( $gallery_id );
					update_post_meta( $new_id, Gallery_CPT::META_CONFIG, wp_json_encode( $cfg ) );
					if ( ! empty( $cfg['imageIds'] ) ) {
						update_post_meta( $new_id, '_matcha_gallery_image_ids', implode( ',', $cfg['imageIds'] ) );
					}
					wp_safe_redirect( admin_url( 'admin.php?page=matcha-ai-hub&matcha_notice=duplicated' ) );
					exit;
				}
			}
		}

		// Delete/Trash gallery
		if ( isset( $_GET['action'], $_GET['gallery_id'] ) && 'trash' === $_GET['action'] ) {
			$gallery_id = absint( $_GET['gallery_id'] );
			check_admin_referer( 'matcha_trash_' . $gallery_id );

			$post = get_post( $gallery_id );
			if ( $post && Gallery_CPT::POST_TYPE === $post->post_type ) {
				wp_trash_post( $gallery_id );
				wp_safe_redirect( admin_url( 'admin.php?page=matcha-ai-hub&matcha_notice=trashed' ) );
				exit;
			}
		}
	}

	/**
	 * Output inline CSS in wp-admin head to strictly constrain menu icon size across all admin pages.
	 */
	public static function render_menu_icon_styles(): void {
		?>
		<style id="matcha-admin-menu-icon-css">
			#adminmenu #toplevel_page_matcha-ai-hub .wp-menu-image img,
			#adminmenu .toplevel_page_matcha-ai-hub .wp-menu-image img {
				width: 20px !important;
				height: 20px !important;
				max-width: 20px !important;
				max-height: 20px !important;
				padding: 7px 0 0 0 !important;
				object-fit: contain !important;
				box-sizing: content-box !important;
				display: inline-block !important;
			}
			#adminmenu #toplevel_page_matcha-ai-hub .wp-menu-image svg,
			#adminmenu .toplevel_page_matcha-ai-hub .wp-menu-image svg {
				width: 18px !important;
				height: 18px !important;
				max-width: 18px !important;
				max-height: 18px !important;
				padding: 8px 0 0 0 !important;
				box-sizing: content-box !important;
				display: inline-block !important;
			}
			#adminmenu #toplevel_page_matcha-ai-hub:hover .wp-menu-image img,
			#adminmenu #toplevel_page_matcha-ai-hub.wp-has-current-submenu .wp-menu-image img {
				opacity: 1 !important;
			}
		</style>
		<?php
	}

	/**
	 * Register menu entries.
	 * Top-level Matcha AI + Dashboard + All Galleries hub.
	 */
	public static function register_menu(): void {
		// Crisp vector SVG Matcha Leaf icon matching modern WordPress standards (20x20)
		$leaf_svg  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#5ec27f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>';
		$menu_icon = 'data:image/svg+xml;base64,' . base64_encode( $leaf_svg );

		// Top-level menu
		add_menu_page(
			__( 'Matcha AI', 'matcha-gallery' ),
			__( 'Matcha AI', 'matcha-gallery' ),
			'edit_posts',
			'matcha-ai-hub',
			array( static::class, 'render_hub' ),
			$menu_icon,
			30
		);

		// 1. Dashboard (first submenu under Matcha AI, matching Astra!)
		add_submenu_page(
			'matcha-ai-hub',
			__( 'Dashboard', 'matcha-gallery' ),
			__( 'Dashboard', 'matcha-gallery' ),
			'edit_posts',
			'matcha-ai-hub',
			array( static::class, 'render_hub' )
		);

		// 2. All Galleries
		add_submenu_page(
			'matcha-ai-hub',
			__( 'All Galleries', 'matcha-gallery' ),
			__( 'All Galleries', 'matcha-gallery' ),
			'edit_posts',
			'matcha-ai-galleries',
			array( static::class, 'render_galleries_submenu' )
		);

		// 3. Add New -> redirects to Studio
		add_submenu_page(
			'matcha-ai-hub',
			__( 'Add New Gallery', 'matcha-gallery' ),
			__( 'Add New Gallery', 'matcha-gallery' ),
			'edit_posts',
			self::PAGE_SLUG,
			array( static::class, 'render_studio' )
		);

		// 4. AI Settings (reuse existing Settings_Page slug but under hub)
		add_submenu_page(
			'matcha-ai-hub',
			__( 'AI Settings', 'matcha-gallery' ),
			__( 'AI Settings', 'matcha-gallery' ),
			'manage_options',
			'matcha-ai-settings',
			array( '\\Matcha_AI_Smart_Gallery\\Admin\\Settings_Page', 'render_page' )
		);

		// 5. AI Keywords -> edit-tags screen
		add_submenu_page(
			'matcha-ai-hub',
			__( 'AI Keywords', 'matcha-gallery' ),
			__( 'AI Keywords', 'matcha-gallery' ),
			'edit_posts',
			'edit-tags.php?taxonomy=matcha_ai_keywords',
			''
		);

		// 6. Free vs Pro
		add_submenu_page(
			'matcha-ai-hub',
			__( 'Free vs Pro', 'matcha-gallery' ),
			__( 'Free vs Pro', 'matcha-gallery' ),
			'edit_posts',
			'matcha-ai-comparison',
			array( static::class, 'render_comparison_submenu' )
		);
	}

	/**
	 * Submenu callback for Free vs Pro.
	 */
	public static function render_comparison_submenu(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$_GET['tab'] = 'comparison';
		static::render_hub();
	}

	/**
	 * Submenu callback for All Galleries.
	 */
	public static function render_galleries_submenu(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$_GET['tab'] = 'galleries';
		static::render_hub();
	}

	/**
	 * Get clean vector SVG icon for layout blueprint.
	 *
	 * @param string $layout Layout slug.
	 * @return string Inline SVG markup.
	 */
	public static function get_layout_svg( string $layout ): string {
		switch ( $layout ) {
			case 'masonry':
				return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><rect x="3" y="3" width="7" height="11"></rect><rect x="14" y="3" width="7" height="6"></rect><rect x="14" y="13" width="7" height="8"></rect><rect x="3" y="18" width="7" height="3"></rect></svg>';
			case 'justified':
				return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><rect x="3" y="3" width="11" height="7"></rect><rect x="17" y="3" width="4" height="7"></rect><rect x="3" y="14" width="6" height="7"></rect><rect x="12" y="14" width="9" height="7"></rect></svg>';
			case 'mosaic':
				return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><rect x="3" y="3" width="11" height="11"></rect><rect x="17" y="3" width="4" height="5"></rect><rect x="17" y="11" width="4" height="10"></rect><rect x="3" y="17" width="11" height="4"></rect></svg>';
			case 'pinwheel':
				return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><path d="M12 2v10M12 12l7-7M12 12h10M12 12l7 7M12 12v10M12 12l-7 7M12 12H2M12 12L5 5"></path></svg>';
			case 'bento':
				return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><rect x="3" y="3" width="18" height="8" rx="1"></rect><rect x="3" y="14" width="8" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect></svg>';
			case 'grid':
			default:
				return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>';
		}
	}

	/**
	 * Render Advanced Matcha Hub & Galleries Explorer.
	 */
	public static function render_hub(): void {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return;
		}

		$is_pro = Gallery_CPT::is_pro_active();

		$q = new \WP_Query(
			array(
				'post_type'      => Gallery_CPT::POST_TYPE,
				'post_status'    => array( 'publish', 'draft' ),
				'posts_per_page' => 100,
				'orderby'        => 'modified',
				'order'          => 'DESC',
			)
		);

		$galleries = $q->posts;
		$total_galleries = count( $galleries );
		$total_photos = 0;
		$unique_layouts = array();

		foreach ( $galleries as $p ) {
			$cfg = Gallery_CPT::get_config( (int) $p->ID );
			$total_photos += ! empty( $cfg['imageIds'] ) && is_array( $cfg['imageIds'] ) ? count( $cfg['imageIds'] ) : 0;
			if ( ! empty( $cfg['layout'] ) ) {
				$unique_layouts[ $cfg['layout'] ] = true;
			}
		}

		$layout_labels = array(
			'grid'      => array( 'label' => __( 'Classic Grid', 'matcha-gallery' ), 'class' => 'grid' ),
			'masonry'   => array( 'label' => __( 'Pinterest Masonry', 'matcha-gallery' ), 'class' => 'masonry' ),
			'justified' => array( 'label' => __( 'Flickr Justified', 'matcha-gallery' ), 'class' => 'justified' ),
			'mosaic'    => array( 'label' => __( 'PhotoBlocks Mosaic', 'matcha-gallery' ), 'class' => 'mosaic' ),
			'pinwheel'  => array( 'label' => __( 'Pinwheel Spiral', 'matcha-gallery' ), 'class' => 'pinwheel' ),
			'bento'     => array( 'label' => __( 'Bento Showcase', 'matcha-gallery' ), 'class' => 'bento' ),
		);

		$frame_labels = array(
			'none'          => __( 'Clean Borderless', 'matcha-gallery' ),
			'white-matting' => __( 'White Matting', 'matcha-gallery' ),
			'natural-oak'   => __( 'Oak Wood (PRO)', 'matcha-gallery' ),
			'black-metal'   => __( 'Black Metal (PRO)', 'matcha-gallery' ),
			'gold-brass'    => __( 'Gold Brass (PRO)', 'matcha-gallery' ),
			'glass-float'   => __( 'Glass Float (PRO)', 'matcha-gallery' ),
		);

		// Notice alerts
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$notice = isset( $_GET['matcha_notice'] ) ? sanitize_key( wp_unslash( $_GET['matcha_notice'] ) ) : '';

		// Active tab for header
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$raw_tab = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : 'dashboard';
		if ( 'comparison' === $raw_tab || 'features' === $raw_tab || 'free-vs-pro' === $raw_tab ) {
			$active_nav_tab = 'comparison';
		} else {
			$active_nav_tab = ( empty( $raw_tab ) || 'welcome' === $raw_tab || 'dashboard' === $raw_tab ) ? 'dashboard' : $raw_tab;
		}
		?>
		<div class="wrap matcha-hub-wrap">
			<?php \Matcha_AI_Smart_Gallery\Admin\Admin_Header::render( $active_nav_tab ); ?>

			<div class="matcha-container">
				<?php if ( 'duplicated' === $notice ) : ?>
					<div class="matcha-hub-notice">
						<span>✓ <?php esc_html_e( 'Gallery duplicated successfully with all layout parameters and images cloned.', 'matcha-gallery' ); ?></span>
					</div>
				<?php elseif ( 'trashed' === $notice ) : ?>
					<div class="matcha-hub-notice" style="border-left-color:#ef4444;color:#991b1b;background:#fef2f2;">
						<span><?php esc_html_e( 'Gallery moved to trash.', 'matcha-gallery' ); ?></span>
					</div>
				<?php endif; ?>

				<?php if ( 'dashboard' === $active_nav_tab ) : ?>
					<!-- ==========================================
					     ASTRA-STYLE DEDICATED DASHBOARD VIEW
					     ========================================== -->
					<div class="matcha-dashboard-grid">
						<!-- Main Column (Left, ~68%) -->
						<div class="matcha-dashboard-main">
							<!-- 1. Hero Card with Left Greeting & Right Getting Started Box -->
							<div class="matcha-hero-card">
								<div class="matcha-hero-card__left">
									<div class="matcha-greeting-tag">
										<span><?php printf( esc_html__( 'Hello %s', 'matcha-gallery' ), esc_html( wp_get_current_user()->display_name ?: 'Admin' ) ); ?></span>
										<span class="matcha-edition-pill"><?php echo $is_pro ? esc_html__( 'PRO VERSION', 'matcha-gallery' ) : esc_html__( 'FREE VERSION', 'matcha-gallery' ); ?></span>
									</div>
									<h1 class="matcha-hero-card__title"><?php esc_html_e( 'Welcome To Matcha Gallery!', 'matcha-gallery' ); ?></h1>
									<p class="matcha-hero-card__desc">
										<?php esc_html_e( 'Matcha is the fast, intelligent WordPress photo gallery suite. Build high-converting masonry, grid, justified, and mosaic galleries with zero CLS layout shift and automated AI vision tagging.', 'matcha-gallery' ); ?>
									</p>
									<div class="matcha-hero-card__actions">
										<a href="<?php echo esc_url( admin_url( 'admin.php?page=' . self::PAGE_SLUG ) ); ?>" class="matcha-btn-primary">
											<span class="dashicons dashicons-plus-alt2" style="font-size:17px;line-height:1;"></span>
											<?php esc_html_e( 'Create New Gallery', 'matcha-gallery' ); ?>
										</a>
										<a href="<?php echo esc_url( admin_url( 'admin.php?page=matcha-ai-settings' ) ); ?>" class="matcha-btn-secondary">
											<span class="dashicons dashicons-admin-settings" style="font-size:17px;line-height:1;"></span>
											<?php esc_html_e( 'Configure AI Settings', 'matcha-gallery' ); ?>
										</a>
									</div>
								</div>

								<!-- Getting Started Preview (Inside Hero Card) -->
								<div class="matcha-getting-started-box">
									<div class="matcha-getting-started-box__icon">
										<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
									</div>
									<h3 class="matcha-getting-started-box__title"><?php esc_html_e( 'Getting Started with Matcha', 'matcha-gallery' ); ?></h3>
									<p class="matcha-getting-started-box__desc">
										<?php esc_html_e( 'Learn how to auto-tag photos and publish your first responsive gallery in 60 seconds.', 'matcha-gallery' ); ?>
									</p>
									<a href="https://wpmatcha.com/wordpress-plugins/matcha-gallery-pro/" target="_blank" rel="noopener noreferrer" class="matcha-getting-started-box__link">
										<span><?php esc_html_e( 'Quick Start Video & Docs', 'matcha-gallery' ); ?></span>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
									</a>
								</div>
							</div>

							<!-- 2. Quick Settings Card (Astra Style 4x2 Grid) -->
							<div class="matcha-dashboard-card">
								<div class="matcha-dashboard-card__header">
									<h2 class="matcha-dashboard-card__title"><?php esc_html_e( 'Quick Settings', 'matcha-gallery' ); ?></h2>
									<a href="<?php echo esc_url( admin_url( 'admin.php?page=matcha-ai-settings' ) ); ?>" class="matcha-dashboard-card__link">
										<?php esc_html_e( 'Go to AI Settings ↗', 'matcha-gallery' ); ?>
									</a>
								</div>
								<div class="matcha-settings-grid">
									<div class="matcha-setting-tile">
										<div>
											<div class="matcha-setting-tile__name"><?php esc_html_e( 'Layout Blueprints', 'matcha-gallery' ); ?></div>
											<div class="matcha-setting-tile__desc"><?php esc_html_e( 'Grid, Masonry, Justified, Bento', 'matcha-gallery' ); ?></div>
										</div>
										<a href="<?php echo esc_url( admin_url( 'admin.php?page=matcha-ai-hub&tab=galleries' ) ); ?>" class="matcha-setting-tile__action">
											<?php esc_html_e( 'Manage', 'matcha-gallery' ); ?> ↗
										</a>
									</div>
									<div class="matcha-setting-tile">
										<div>
											<div class="matcha-setting-tile__name"><?php esc_html_e( 'AI Vision Tagging', 'matcha-gallery' ); ?></div>
											<div class="matcha-setting-tile__desc"><?php esc_html_e( 'Neural image analysis on upload', 'matcha-gallery' ); ?></div>
										</div>
										<a href="<?php echo esc_url( admin_url( 'admin.php?page=matcha-ai-settings' ) ); ?>" class="matcha-setting-tile__action">
											<?php esc_html_e( 'Configure', 'matcha-gallery' ); ?> ↗
										</a>
									</div>
									<div class="matcha-setting-tile">
										<div>
											<div class="matcha-setting-tile__name"><?php esc_html_e( 'Zero-CLS Lightbox', 'matcha-gallery' ); ?></div>
											<div class="matcha-setting-tile__desc"><?php esc_html_e( 'Accelerated popup transitions', 'matcha-gallery' ); ?></div>
										</div>
										<a href="<?php echo esc_url( admin_url( 'admin.php?page=matcha-ai-settings' ) ); ?>" class="matcha-setting-tile__action">
											<?php esc_html_e( 'Customize', 'matcha-gallery' ); ?> ↗
										</a>
									</div>
									<div class="matcha-setting-tile">
										<div>
											<div class="matcha-setting-tile__name"><?php esc_html_e( 'SEO & Alt Text', 'matcha-gallery' ); ?></div>
											<div class="matcha-setting-tile__desc"><?php esc_html_e( 'Auto-generated alt text & captions', 'matcha-gallery' ); ?></div>
										</div>
										<a href="<?php echo esc_url( admin_url( 'admin.php?page=matcha-ai-settings' ) ); ?>" class="matcha-setting-tile__action">
											<?php esc_html_e( 'Configure', 'matcha-gallery' ); ?> ↗
										</a>
									</div>
									<div class="matcha-setting-tile">
										<div>
											<div class="matcha-setting-tile__name"><?php esc_html_e( 'Taxonomy & Keywords', 'matcha-gallery' ); ?></div>
											<div class="matcha-setting-tile__desc"><?php esc_html_e( 'AI vision keywords cloud', 'matcha-gallery' ); ?></div>
										</div>
										<a href="<?php echo esc_url( admin_url( 'edit-tags.php?taxonomy=matcha_ai_keywords' ) ); ?>" class="matcha-setting-tile__action">
											<?php esc_html_e( 'View Terms', 'matcha-gallery' ); ?> ↗
										</a>
									</div>
									<div class="matcha-setting-tile">
										<div>
											<div class="matcha-setting-tile__name"><?php esc_html_e( 'Studio Visual Builder', 'matcha-gallery' ); ?></div>
											<div class="matcha-setting-tile__desc"><?php esc_html_e( 'Real-time drag & drop layout editing', 'matcha-gallery' ); ?></div>
										</div>
										<a href="<?php echo esc_url( admin_url( 'admin.php?page=' . self::PAGE_SLUG ) ); ?>" class="matcha-setting-tile__action">
											<?php esc_html_e( 'Open Studio', 'matcha-gallery' ); ?> ↗
										</a>
									</div>
									<div class="matcha-setting-tile">
										<div>
											<div class="matcha-setting-tile__name"><?php esc_html_e( 'Client Proofing', 'matcha-gallery' ); ?></div>
											<div class="matcha-setting-tile__desc"><?php esc_html_e( 'Photo favoriting & review tray', 'matcha-gallery' ); ?></div>
										</div>
										<a href="https://wpmatcha.com/wordpress-plugins/matcha-gallery-pro/" target="_blank" rel="noopener noreferrer" class="matcha-setting-tile__action" style="color:#ca8a04;">
											<?php esc_html_e( 'Pro Feature', 'matcha-gallery' ); ?> ↗
										</a>
									</div>
									<div class="matcha-setting-tile">
										<div>
											<div class="matcha-setting-tile__name"><?php esc_html_e( 'Watermark & Shield', 'matcha-gallery' ); ?></div>
											<div class="matcha-setting-tile__desc"><?php esc_html_e( 'Right-click photo protection', 'matcha-gallery' ); ?></div>
										</div>
										<a href="https://wpmatcha.com/wordpress-plugins/matcha-gallery-pro/" target="_blank" rel="noopener noreferrer" class="matcha-setting-tile__action" style="color:#ca8a04;">
											<?php esc_html_e( 'Pro Feature', 'matcha-gallery' ); ?> ↗
										</a>
									</div>
								</div>
							</div>

							<!-- 3. Do more with Matcha AI Pro (Astra Style 4x2 Grid) -->
							<div class="matcha-dashboard-card">
								<div class="matcha-dashboard-card__header">
									<h2 class="matcha-dashboard-card__title"><?php esc_html_e( 'Do more with Matcha AI Pro', 'matcha-gallery' ); ?></h2>
									<a href="https://wpmatcha.com/wordpress-plugins/matcha-gallery-pro/" target="_blank" rel="noopener noreferrer" class="matcha-dashboard-card__link">
										<?php esc_html_e( 'Get Full Control ↗', 'matcha-gallery' ); ?>
									</a>
								</div>
								<div class="matcha-toolkit-grid">
									<div class="matcha-toolkit-tile">
										<div class="matcha-toolkit-tile__left">
											<div class="matcha-toolkit-tile__icon">
												<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
											</div>
											<div>
												<div class="matcha-toolkit-tile__name"><?php esc_html_e( 'Unlimited AI Vision Tagging', 'matcha-gallery' ); ?></div>
												<div class="matcha-toolkit-tile__desc"><?php esc_html_e( 'Auto-enrich entire photo libraries in 1-click', 'matcha-gallery' ); ?></div>
											</div>
										</div>
									</div>
									<div class="matcha-toolkit-tile">
										<div class="matcha-toolkit-tile__left">
											<div class="matcha-toolkit-tile__icon">
												<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
											</div>
											<div>
												<div class="matcha-toolkit-tile__name"><?php esc_html_e( 'Client Proofing & Favoriting', 'matcha-gallery' ); ?></div>
												<div class="matcha-toolkit-tile__desc"><?php esc_html_e( 'Password galleries, favorites & ID copy tray', 'matcha-gallery' ); ?></div>
											</div>
										</div>
									</div>
									<div class="matcha-toolkit-tile">
										<div class="matcha-toolkit-tile__left">
											<div class="matcha-toolkit-tile__icon">
												<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
											</div>
											<div>
												<div class="matcha-toolkit-tile__name"><?php esc_html_e( 'Automated Batch Zip Downloads', 'matcha-gallery' ); ?></div>
												<div class="matcha-toolkit-tile__desc"><?php esc_html_e( 'Allow visitors to download high-res image sets', 'matcha-gallery' ); ?></div>
											</div>
										</div>
									</div>
									<div class="matcha-toolkit-tile">
										<div class="matcha-toolkit-tile__left">
											<div class="matcha-toolkit-tile__icon">
												<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
											</div>
											<div>
												<div class="matcha-toolkit-tile__name"><?php esc_html_e( '15+ Luxury Frame Styles', 'matcha-gallery' ); ?></div>
												<div class="matcha-toolkit-tile__desc"><?php esc_html_e( 'Natural oak, brass, black metal & glass matting', 'matcha-gallery' ); ?></div>
											</div>
										</div>
									</div>
									<div class="matcha-toolkit-tile">
										<div class="matcha-toolkit-tile__left">
											<div class="matcha-toolkit-tile__icon">
												<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
											</div>
											<div>
												<div class="matcha-toolkit-tile__name"><?php esc_html_e( 'Live Keyword & Category Filters', 'matcha-gallery' ); ?></div>
												<div class="matcha-toolkit-tile__desc"><?php esc_html_e( 'Instant front-end AJAX pills with photo counters', 'matcha-gallery' ); ?></div>
											</div>
										</div>
									</div>
									<div class="matcha-toolkit-tile">
										<div class="matcha-toolkit-tile__left">
											<div class="matcha-toolkit-tile__icon">
												<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
											</div>
											<div>
												<div class="matcha-toolkit-tile__name"><?php esc_html_e( 'Right-Click & Image Protection', 'matcha-gallery' ); ?></div>
												<div class="matcha-toolkit-tile__desc"><?php esc_html_e( 'Shield photography against scrapers & theft', 'matcha-gallery' ); ?></div>
											</div>
										</div>
									</div>
									<div class="matcha-toolkit-tile">
										<div class="matcha-toolkit-tile__left">
											<div class="matcha-toolkit-tile__icon">
												<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
											</div>
											<div>
												<div class="matcha-toolkit-tile__name"><?php esc_html_e( 'WooCommerce Prints & Sales', 'matcha-gallery' ); ?></div>
												<div class="matcha-toolkit-tile__desc"><?php esc_html_e( 'Sell fine-art canvas prints & digital downloads', 'matcha-gallery' ); ?></div>
											</div>
										</div>
									</div>
									<div class="matcha-toolkit-tile">
										<div class="matcha-toolkit-tile__left">
											<div class="matcha-toolkit-tile__icon">
												<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
											</div>
											<div>
												<div class="matcha-toolkit-tile__name"><?php esc_html_e( 'Dedicated VIP Priority Support', 'matcha-gallery' ); ?></div>
												<div class="matcha-toolkit-tile__desc"><?php esc_html_e( '24/7 priority ticket queue with < 2hr response', 'matcha-gallery' ); ?></div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Sidebar Column (Right, ~32%) -->
						<aside class="matcha-dashboard-sidebar">
							<!-- 1. Astra-Style Pro Upsell Card -->
							<div class="matcha-dashboard-card matcha-sidebar-pro-card">
								<div class="matcha-sidebar-pro-card__icon">
									<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
								</div>
								<h3 class="matcha-sidebar-pro-card__title"><?php esc_html_e( 'Build Complete Galleries Faster', 'matcha-gallery' ); ?></h3>
								<p class="matcha-sidebar-pro-card__desc">
									<?php esc_html_e( 'With Matcha AI Pro, you no longer have to manually tag photos, write custom CSS, or juggle multiple gallery tools. Everything works together seamlessly.', 'matcha-gallery' ); ?>
								</p>
								<?php if ( ! $is_pro ) : ?>
									<a href="https://wpmatcha.com/wordpress-plugins/matcha-gallery-pro/" target="_blank" rel="noopener noreferrer" class="matcha-sidebar-pro-card__btn">
										<?php esc_html_e( 'Upgrade Now', 'matcha-gallery' ); ?>
									</a>
								<?php else : ?>
									<a href="<?php echo esc_url( admin_url( 'admin.php?page=matcha-pro-license' ) ); ?>" class="matcha-sidebar-pro-card__btn" style="background:#166534;">
										✓ <?php esc_html_e( 'License Active & Verified', 'matcha-gallery' ); ?>
									</a>
								<?php endif; ?>

								<ul class="matcha-sidebar-checklist">
									<li>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
										<span><?php esc_html_e( '300+ Curated Layout Presets', 'matcha-gallery' ); ?></span>
									</li>
									<li>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
										<span><?php esc_html_e( 'Unlimited AI Vision Auto-Tagging', 'matcha-gallery' ); ?></span>
									</li>
									<li>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
										<span><?php esc_html_e( 'VIP Support – Skip the Queue', 'matcha-gallery' ); ?></span>
									</li>
									<li>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
										<span><?php esc_html_e( 'Client Proofing & Favorite Trays', 'matcha-gallery' ); ?></span>
									</li>
									<li>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
										<span><?php esc_html_e( '15+ Luxury Picture Frame Styles', 'matcha-gallery' ); ?></span>
									</li>
									<li>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
										<span><?php esc_html_e( 'Zero-CLS Layout Engine (100 PageSpeed)', 'matcha-gallery' ); ?></span>
									</li>
								</ul>
							</div>

							<!-- 2. Astra-Style Quick Access Card -->
							<div class="matcha-dashboard-card">
								<div class="matcha-dashboard-card__header">
									<h2 class="matcha-dashboard-card__title"><?php esc_html_e( 'Quick Access', 'matcha-gallery' ); ?></h2>
								</div>
								<ul class="matcha-quick-access-list">
									<li class="matcha-quick-access-item">
										<a href="https://wpmatcha.com/contact/" target="_blank" rel="noopener noreferrer">
											<div class="matcha-quick-access-item__left">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
												<span><?php esc_html_e( 'VIP Priority Support', 'matcha-gallery' ); ?></span>
											</div>
											<span class="matcha-badge-pro-tag"><?php esc_html_e( 'PRO', 'matcha-gallery' ); ?></span>
										</a>
									</li>
									<li class="matcha-quick-access-item">
										<a href="https://wpmatcha.com/wordpress-plugins/matcha-gallery-pro/" target="_blank" rel="noopener noreferrer">
											<div class="matcha-quick-access-item__left">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
												<span><?php esc_html_e( 'Help Center & Documentation', 'matcha-gallery' ); ?></span>
											</div>
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
										</a>
									</li>
									<li class="matcha-quick-access-item">
										<a href="https://wordpress.org/support/plugin/matcha-gallery/" target="_blank" rel="noopener noreferrer">
											<div class="matcha-quick-access-item__left">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
												<span><?php esc_html_e( 'Join the Community', 'matcha-gallery' ); ?></span>
											</div>
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
										</a>
									</li>
									<li class="matcha-quick-access-item">
										<a href="https://wordpress.org/support/plugin/matcha-gallery/reviews/#new-post" target="_blank" rel="noopener noreferrer">
											<div class="matcha-quick-access-item__left">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
												<span><?php esc_html_e( 'Rate Matcha ★★★★★', 'matcha-gallery' ); ?></span>
											</div>
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
										</a>
									</li>
								</ul>
							</div>
						</aside>
					</div>

										<?php elseif ( 'comparison' === $active_nav_tab ) : ?>
					<!-- ==========================================
					     ASTRA-STYLE DEDICATED FREE VS PRO VIEW
					     ========================================== -->
					<!-- Astra-Style Greeting Bar -->
					<div class="matcha-page-title-bar">
						<div class="matcha-page-title-bar__left">
							<div class="matcha-greeting-tag">
								<span><?php printf( esc_html__( 'Hello %s', 'matcha-gallery' ), esc_html( wp_get_current_user()->display_name ?: 'Admin' ) ); ?></span>
								<span class="matcha-edition-pill"><?php echo $is_pro ? esc_html__( 'PRO VERSION', 'matcha-gallery' ) : esc_html__( 'FREE VERSION', 'matcha-gallery' ); ?></span>
							</div>
							<h1 class="matcha-page-main-heading"><?php esc_html_e( 'Matcha Gallery Free vs. Pro', 'matcha-gallery' ); ?></h1>
							<p class="matcha-page-sub-heading">
								<?php esc_html_e( 'Compare core features with Pro superpowers. Upgrade to unlock architectural mosaic and bento blueprints, 15+ museum framing styles, in-frame focal cropping, client proofing, and priority support.', 'matcha-gallery' ); ?>
							</p>
						</div>
						<div class="matcha-page-title-bar__actions">
							<?php if ( ! $is_pro ) : ?>
								<a href="https://wpmatcha.com/wordpress-plugins/matcha-gallery-pro/" target="_blank" rel="noopener noreferrer" class="matcha-btn-primary">
									<?php esc_html_e( 'Upgrade to Pro ↗', 'matcha-gallery' ); ?>
								</a>
							<?php else : ?>
								<a href="<?php echo esc_url( admin_url( 'admin.php?page=matcha-pro-license' ) ); ?>" class="matcha-btn-primary">
									<?php esc_html_e( 'Manage Pro License ↗', 'matcha-gallery' ); ?>
								</a>
							<?php endif; ?>
							<a href="<?php echo esc_url( admin_url( 'admin.php?page=' . self::PAGE_SLUG ) ); ?>" class="matcha-btn-secondary">
								<span class="dashicons dashicons-plus-alt2" style="font-size:18px;line-height:1;"></span>
								<?php esc_html_e( 'Create Gallery', 'matcha-gallery' ); ?>
							</a>
						</div>
					</div>

					<!-- 6-Feature Showcase Grid (Vector SVGs) -->
					<div class="matcha-feature-grid">
						<div class="matcha-feature-card">
							<span class="matcha-feature-card__badge matcha-feature-card__badge--free"><?php esc_html_e( 'Core Engine', 'matcha-gallery' ); ?></span>
							<div class="matcha-feature-card__icon">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
							</div>
							<h3 class="matcha-feature-card__title"><?php esc_html_e( '6 Algorithmic Blueprints', 'matcha-gallery' ); ?></h3>
							<p class="matcha-feature-card__desc">
								<?php esc_html_e( 'Classic Uniform Grid, Pinterest Vertical Masonry, Flickr Justified Rows, plus Pro PhotoBlocks Mosaic, Pinwheel Spiral, and Bento Showcase.', 'matcha-gallery' ); ?>
							</p>
						</div>

						<div class="matcha-feature-card">
							<span class="matcha-feature-card__badge matcha-feature-card__badge--free"><?php esc_html_e( 'Core Engine', 'matcha-gallery' ); ?></span>
							<div class="matcha-feature-card__icon">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
							</div>
							<h3 class="matcha-feature-card__title"><?php esc_html_e( 'Zero-CLS Instant Frames', 'matcha-gallery' ); ?></h3>
							<p class="matcha-feature-card__desc">
								<?php esc_html_e( 'Pre-calculated CSS aspect-ratio framing stops layout jumps on initial page render. Pass Google Core Web Vitals with 100 PageSpeed scores.', 'matcha-gallery' ); ?>
							</p>
						</div>

						<div class="matcha-feature-card">
							<span class="matcha-feature-card__badge matcha-feature-card__badge--pro"><?php esc_html_e( 'PRO Superpower', 'matcha-gallery' ); ?></span>
							<div class="matcha-feature-card__icon">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
							</div>
							<h3 class="matcha-feature-card__title"><?php esc_html_e( 'Luxury Picture Framing', 'matcha-gallery' ); ?></h3>
							<p class="matcha-feature-card__desc">
								<?php esc_html_e( 'Turn photos into museum wall art with realistic picture frames: Natural Oak Wood, Slim Black Metal, Brushed Brass, and Glass Float Acrylic.', 'matcha-gallery' ); ?>
							</p>
						</div>

						<div class="matcha-feature-card">
							<span class="matcha-feature-card__badge matcha-feature-card__badge--free"><?php esc_html_e( 'Core Engine', 'matcha-gallery' ); ?></span>
							<div class="matcha-feature-card__icon">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
							</div>
							<h3 class="matcha-feature-card__title"><?php esc_html_e( 'Visual Discovery Toolbar', 'matcha-gallery' ); ?></h3>
							<p class="matcha-feature-card__desc">
								<?php esc_html_e( 'Real-time keyword search, multi-select category pills with photo counters, and AI color-swatch dot palettes for intuitive browsing.', 'matcha-gallery' ); ?>
							</p>
						</div>

						<div class="matcha-feature-card">
							<span class="matcha-feature-card__badge matcha-feature-card__badge--pro"><?php esc_html_e( 'PRO Superpower', 'matcha-gallery' ); ?></span>
							<div class="matcha-feature-card__icon">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
							</div>
							<h3 class="matcha-feature-card__title"><?php esc_html_e( 'Client Proofing & Shoppable Hotspots', 'matcha-gallery' ); ?></h3>
							<p class="matcha-feature-card__desc">
								<?php esc_html_e( 'Allow clients to favorite photos with 1-click ID list export. Sell art directly with customizable Buy Now buttons and dynamic price badges.', 'matcha-gallery' ); ?>
							</p>
						</div>

						<div class="matcha-feature-card">
							<span class="matcha-feature-card__badge matcha-feature-card__badge--pro"><?php esc_html_e( 'PRO Superpower', 'matcha-gallery' ); ?></span>
							<div class="matcha-feature-card__icon">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
							</div>
							<h3 class="matcha-feature-card__title"><?php esc_html_e( '1-Click PDF Proposal Export', 'matcha-gallery' ); ?></h3>
							<p class="matcha-feature-card__desc">
								<?php esc_html_e( 'Generate itemized PDF proposals and wall layout sheets directly from the visual builder, complete with dimensions, prices, and client info.', 'matcha-gallery' ); ?>
							</p>
						</div>
					</div>

					<!-- Comparison Matrix Table -->
					<div class="matcha-comparison-box">
						<div class="matcha-comparison-box__header">
							<div>
								<h3><?php esc_html_e( 'Free vs. Pro Feature Comparison', 'matcha-gallery' ); ?></h3>
								<p><?php esc_html_e( 'Compare capabilities and choose the right edition for your creative projects.', 'matcha-gallery' ); ?></p>
							</div>
							<?php if ( $is_pro ) : ?>
								<span class="matcha-hub-badge matcha-hub-badge--pro"><?php esc_html_e( 'All Pro Features Active', 'matcha-gallery' ); ?></span>
							<?php else : ?>
								<a href="https://wpmatcha.com/wordpress-plugins/matcha-gallery-pro/" target="_blank" rel="noopener noreferrer" class="matcha-hub-btn-primary" style="font-size:12px;padding:8px 16px;">
									<?php esc_html_e( 'Get Matcha Gallery Pro ↗', 'matcha-gallery' ); ?>
								</a>
							<?php endif; ?>
						</div>

						<table class="matcha-comparison-table">
							<thead>
								<tr>
									<th><?php esc_html_e( 'Feature / Superpower', 'matcha-gallery' ); ?></th>
									<th class="col-free"><?php esc_html_e( 'Free Core Edition', 'matcha-gallery' ); ?></th>
									<th class="col-pro">
										<span><?php esc_html_e( 'Matcha Gallery Pro', 'matcha-gallery' ); ?></span>
										<span class="matcha-badge-pro-tag">PRO</span>
									</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td><strong><?php esc_html_e( 'Layout Blueprints', 'matcha-gallery' ); ?></strong></td>
									<td class="col-free"><?php esc_html_e( 'Grid, Masonry, Justified', 'matcha-gallery' ); ?></td>
									<td class="col-pro"><span class="matcha-check">✓</span> <?php esc_html_e( '+ Mosaic, Pinwheel, Bento', 'matcha-gallery' ); ?></td>
								</tr>
								<tr>
									<td><strong><?php esc_html_e( 'Zero-CLS Aspect Ratio Frames', 'matcha-gallery' ); ?></strong></td>
									<td class="col-free"><span class="matcha-check">✓</span> <?php esc_html_e( 'Included', 'matcha-gallery' ); ?></td>
									<td class="col-pro"><span class="matcha-check">✓</span> <?php esc_html_e( 'Included', 'matcha-gallery' ); ?></td>
								</tr>
								<tr>
									<td><strong><?php esc_html_e( 'Luxury Picture Framing', 'matcha-gallery' ); ?></strong></td>
									<td class="col-free"><?php esc_html_e( 'Clean & White Matting', 'matcha-gallery' ); ?></td>
									<td class="col-pro"><span class="matcha-check">✓</span> <?php esc_html_e( '+ Oak, Black Metal, Brass, Acrylic', 'matcha-gallery' ); ?></td>
								</tr>
								<tr>
									<td><strong><?php esc_html_e( 'In-Frame Pan & Zoom 2D Cropper', 'matcha-gallery' ); ?></strong></td>
									<td class="col-free"><span class="matcha-lock-text">—</span></td>
									<td class="col-pro"><span class="matcha-check">✓</span> <?php esc_html_e( 'Full 2D Reticle & Zoom', 'matcha-gallery' ); ?></td>
								</tr>
								<tr>
									<td><strong><?php esc_html_e( 'Client Proofing & Favorite Export', 'matcha-gallery' ); ?></strong></td>
									<td class="col-free"><span class="matcha-lock-text">—</span></td>
									<td class="col-pro"><span class="matcha-check">✓</span> <?php esc_html_e( 'Favorite Tray + ID Copy', 'matcha-gallery' ); ?></td>
								</tr>
								<tr>
									<td><strong><?php esc_html_e( 'Shoppable Hotspots & Buy Links', 'matcha-gallery' ); ?></strong></td>
									<td class="col-free"><span class="matcha-lock-text">—</span></td>
									<td class="col-pro"><span class="matcha-check">✓</span> <?php esc_html_e( 'Custom Links & Price Tags', 'matcha-gallery' ); ?></td>
								</tr>
								<tr>
									<td><strong><?php esc_html_e( 'AI Vision Color Swatches', 'matcha-gallery' ); ?></strong></td>
									<td class="col-free"><span class="matcha-lock-text">—</span></td>
									<td class="col-pro"><span class="matcha-check">✓</span> <?php esc_html_e( 'Dynamic Color Dots', 'matcha-gallery' ); ?></td>
								</tr>
								<tr>
									<td><strong><?php esc_html_e( 'Pagination Systems', 'matcha-gallery' ); ?></strong></td>
									<td class="col-free"><?php esc_html_e( 'Load More Button', 'matcha-gallery' ); ?></td>
									<td class="col-pro"><span class="matcha-check">✓</span> <?php esc_html_e( '+ Infinite Scroll & Numbered Pages', 'matcha-gallery' ); ?></td>
								</tr>
								<tr>
									<td><strong><?php esc_html_e( '1-Click PDF Proposal Export', 'matcha-gallery' ); ?></strong></td>
									<td class="col-free"><span class="matcha-lock-text">—</span></td>
									<td class="col-pro"><span class="matcha-check">✓</span> <?php esc_html_e( 'Printable PDF Sheets', 'matcha-gallery' ); ?></td>
								</tr>
								<tr>
									<td><strong><?php esc_html_e( 'Gutenberg Block & Elementor Widget', 'matcha-gallery' ); ?></strong></td>
									<td class="col-free"><span class="matcha-check">✓</span> <?php esc_html_e( 'Full Support', 'matcha-gallery' ); ?></td>
									<td class="col-pro"><span class="matcha-check">✓</span> <?php esc_html_e( 'Full Support + Pro Controls', 'matcha-gallery' ); ?></td>
								</tr>
								<tr>
									<td><strong><?php esc_html_e( 'Updates & Premium Support', 'matcha-gallery' ); ?></strong></td>
									<td class="col-free"><?php esc_html_e( 'Community Forums', 'matcha-gallery' ); ?></td>
									<td class="col-pro"><span class="matcha-check">✓</span> <?php esc_html_e( '1-Click Updates & 1-on-1 Help', 'matcha-gallery' ); ?></td>
								</tr>
							</tbody>
						</table>

						<div class="matcha-comparison-footer">
							<span style="font-size:13px;color:#64748b;">
								<?php esc_html_e( 'All licenses include 1 year of updates, customer support, and access to all upcoming superpowers.', 'matcha-gallery' ); ?>
							</span>
							<?php if ( ! $is_pro ) : ?>
								<a href="https://wpmatcha.com/wordpress-plugins/matcha-gallery-pro/" target="_blank" rel="noopener noreferrer" class="matcha-hub-btn-primary">
									<?php esc_html_e( 'Upgrade to Pro at WPMatcha.com ↗', 'matcha-gallery' ); ?>
								</a>
							<?php endif; ?>
						</div>
					</div>

				<?php else : ?>
					<!-- ==========================================
					     ASTRA-STYLE ALL GALLERIES MANAGER VIEW
					     ========================================== -->
					<!-- Astra-Style Greeting Bar -->
					<div class="matcha-page-title-bar">
						<div class="matcha-page-title-bar__left">
							<div class="matcha-greeting-tag">
								<span><?php printf( esc_html__( 'Hello %s', 'matcha-gallery' ), esc_html( wp_get_current_user()->display_name ?: 'Admin' ) ); ?></span>
								<span class="matcha-edition-pill"><?php echo $is_pro ? esc_html__( 'PRO VERSION', 'matcha-gallery' ) : esc_html__( 'FREE VERSION', 'matcha-gallery' ); ?></span>
							</div>
							<h1 class="matcha-page-main-heading"><?php esc_html_e( 'All Galleries', 'matcha-gallery' ); ?></h1>
							<p class="matcha-page-sub-heading">
								<?php esc_html_e( 'Manage and customize your photo galleries. Engineered for Zero-CLS instant loading, 6 architectural layouts, and luxury picture framing.', 'matcha-gallery' ); ?>
							</p>
						</div>
						<div class="matcha-page-title-bar__actions">
							<a href="<?php echo esc_url( admin_url( 'admin.php?page=' . self::PAGE_SLUG ) ); ?>" class="matcha-btn-primary">
								<span class="dashicons dashicons-plus-alt2" style="font-size:18px;line-height:1;"></span>
								<?php esc_html_e( 'Create New Gallery', 'matcha-gallery' ); ?>
							</a>
							<?php if ( ! $is_pro ) : ?>
								<a href="<?php echo esc_url( admin_url( 'admin.php?page=matcha-ai-hub&tab=comparison' ) ); ?>" class="matcha-btn-secondary">
									<?php esc_html_e( 'Free vs. Pro ↗', 'matcha-gallery' ); ?>
								</a>
							<?php else : ?>
								<a href="<?php echo esc_url( admin_url( 'admin.php?page=matcha-pro-license' ) ); ?>" class="matcha-btn-secondary">
									<span class="dashicons dashicons-admin-network" style="font-size:16px;"></span>
									<?php esc_html_e( 'License Manager', 'matcha-gallery' ); ?>
								</a>
							<?php endif; ?>
						</div>
					</div>

					<!-- KPI METRICS CARDS -->
					<div class="matcha-kpi-grid">
						<div class="matcha-kpi-card">
							<div class="matcha-kpi-card__icon matcha-kpi-card__icon--green">
								<span class="dashicons dashicons-format-gallery"></span>
							</div>
							<div class="matcha-kpi-card__info">
								<span class="matcha-kpi-card__value"><?php echo (int) $total_galleries; ?></span>
								<span class="matcha-kpi-card__label"><?php esc_html_e( 'Galleries Created', 'matcha-gallery' ); ?></span>
							</div>
						</div>
						<div class="matcha-kpi-card">
							<div class="matcha-kpi-card__icon matcha-kpi-card__icon--blue">
								<span class="dashicons dashicons-images-alt2"></span>
							</div>
							<div class="matcha-kpi-card__info">
								<span class="matcha-kpi-card__value"><?php echo (int) $total_photos; ?></span>
								<span class="matcha-kpi-card__label"><?php esc_html_e( 'Curated Photos', 'matcha-gallery' ); ?></span>
							</div>
						</div>
						<div class="matcha-kpi-card">
							<div class="matcha-kpi-card__icon matcha-kpi-card__icon--amber">
								<span class="dashicons dashicons-performance"></span>
							</div>
							<div class="matcha-kpi-card__info">
								<span class="matcha-kpi-card__value"><?php esc_html_e( 'Zero-CLS', 'matcha-gallery' ); ?></span>
								<span class="matcha-kpi-card__label"><?php esc_html_e( 'Layout Engine Active', 'matcha-gallery' ); ?></span>
							</div>
						</div>
						<div class="matcha-kpi-card">
							<div class="matcha-kpi-card__icon matcha-kpi-card__icon--purple">
								<span class="dashicons dashicons-star-filled"></span>
							</div>
							<div class="matcha-kpi-card__info">
								<?php if ( $is_pro ) : ?>
									<span class="matcha-kpi-card__value" style="color:#16a34a;"><?php esc_html_e( 'Pro Active', 'matcha-gallery' ); ?> ✓</span>
									<span class="matcha-kpi-card__label"><?php esc_html_e( 'All Superpowers Unlocked', 'matcha-gallery' ); ?></span>
								<?php else : ?>
									<span class="matcha-kpi-card__value" style="color:#ca8a04;"><?php esc_html_e( 'Free Edition', 'matcha-gallery' ); ?></span>
									<span class="matcha-kpi-card__label"><?php esc_html_e( '6 Layouts with Pro', 'matcha-gallery' ); ?></span>
								<?php endif; ?>
							</div>
						</div>
					</div>

					<!-- Navigation Tabs -->
					<nav class="matcha-hub-nav">
						<button type="button" class="matcha-hub-tab is-active" data-tab="galleries">
							<?php esc_html_e( 'Galleries Manager', 'matcha-gallery' ); ?> (<?php echo (int) $total_galleries; ?>)
						</button>
						<a href="<?php echo esc_url( admin_url( 'admin.php?page=matcha-ai-hub&tab=comparison' ) ); ?>" class="matcha-hub-nav-link">
							<?php esc_html_e( 'Features & Pro Comparison', 'matcha-gallery' ); ?> ↗
						</a>
						<button type="button" class="matcha-hub-tab" data-tab="integration">
							<?php esc_html_e( 'Embedding & Builders Guide', 'matcha-gallery' ); ?>
						</button>
					</nav>

					<!-- Panel: Galleries Manager -->
					<div id="matcha-panel-galleries" class="matcha-hub-panel is-active">
						<?php if ( empty( $galleries ) ) : ?>
							<div class="matcha-hub-empty">
								<div class="matcha-hub-empty__icon-wrap">
									<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
								</div>
								<h3><?php esc_html_e( 'No galleries created yet', 'matcha-gallery' ); ?></h3>
								<p><?php esc_html_e( 'Start by creating your first visual photo wall in the full-screen Matcha Studio editor.', 'matcha-gallery' ); ?></p>
								<a href="<?php echo esc_url( admin_url( 'admin.php?page=' . self::PAGE_SLUG ) ); ?>" class="matcha-btn-primary">
									<span class="dashicons dashicons-plus-alt2"></span>
									<?php esc_html_e( 'Launch Matcha Studio Builder', 'matcha-gallery' ); ?>
								</a>
							</div>
						<?php else : ?>
							<div class="matcha-explorer-card">
								<!-- Toolbar with live search & layout filter pills -->
								<div class="matcha-explorer-toolbar">
									<div class="matcha-explorer-search">
										<span class="dashicons dashicons-search"></span>
										<input type="text" id="matcha-hub-search" placeholder="<?php esc_attr_e( 'Filter galleries by title or ID...', 'matcha-gallery' ); ?>">
									</div>
									<div class="matcha-filter-pills">
										<button type="button" class="matcha-filter-pill is-active" data-layout="all"><?php esc_html_e( 'All Blueprints', 'matcha-gallery' ); ?></button>
										<button type="button" class="matcha-filter-pill" data-layout="grid">
											<?php echo self::get_layout_svg( 'grid' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
											<span><?php esc_html_e( 'Grid', 'matcha-gallery' ); ?></span>
										</button>
										<button type="button" class="matcha-filter-pill" data-layout="masonry">
											<?php echo self::get_layout_svg( 'masonry' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
											<span><?php esc_html_e( 'Masonry', 'matcha-gallery' ); ?></span>
										</button>
										<button type="button" class="matcha-filter-pill" data-layout="justified">
											<?php echo self::get_layout_svg( 'justified' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
											<span><?php esc_html_e( 'Justified', 'matcha-gallery' ); ?></span>
										</button>
										<button type="button" class="matcha-filter-pill" data-layout="mosaic">
											<?php echo self::get_layout_svg( 'mosaic' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
											<span><?php esc_html_e( 'Mosaic', 'matcha-gallery' ); ?></span>
										</button>
										<button type="button" class="matcha-filter-pill" data-layout="bento">
											<?php echo self::get_layout_svg( 'bento' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
											<span><?php esc_html_e( 'Bento', 'matcha-gallery' ); ?></span>
										</button>
										<button type="button" class="matcha-filter-pill" data-layout="pinwheel">
											<?php echo self::get_layout_svg( 'pinwheel' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
											<span><?php esc_html_e( 'Pinwheel', 'matcha-gallery' ); ?></span>
										</button>
									</div>
									<span id="matcha-visible-count" class="matcha-counter-pill">
										<?php
										printf(
											/* translators: %d: number of galleries */
											esc_html__( 'Showing %d galleries', 'matcha-gallery' ),
											(int) $total_galleries
										);
										?>
									</span>
								</div>

								<!-- Table -->
								<div class="matcha-explorer-table-wrap">
									<table class="matcha-explorer-table" id="matcha-galleries-table">
										<thead>
											<tr>
												<th><?php esc_html_e( 'Preview & Title', 'matcha-gallery' ); ?></th>
												<th><?php esc_html_e( 'Layout & Geometry', 'matcha-gallery' ); ?></th>
												<th><?php esc_html_e( 'Photos & Features', 'matcha-gallery' ); ?></th>
												<th><?php esc_html_e( 'Embed Shortcode', 'matcha-gallery' ); ?></th>
												<th><?php esc_html_e( 'Modified', 'matcha-gallery' ); ?></th>
												<th style="text-align:right;"><?php esc_html_e( 'Actions', 'matcha-gallery' ); ?></th>
											</tr>
										</thead>
										<tbody>
											<?php
											foreach ( $galleries as $post ) :
												$gid           = $post->ID;
												$cfg           = Gallery_CPT::get_config( (int) $gid );
												$img_ids       = ! empty( $cfg['imageIds'] ) && is_array( $cfg['imageIds'] ) ? $cfg['imageIds'] : array();
												$cnt           = count( $img_ids );
												$layout        = $cfg['layout'] ?? 'grid';
												$layout_info   = $layout_labels[ $layout ] ?? array( 'label' => ucfirst( $layout ), 'class' => 'grid' );
												$frame         = $cfg['frameStyle'] ?? 'none';
												$frame_name    = $frame_labels[ $frame ] ?? __( 'Clean Borderless', 'matcha-gallery' );
												$columns       = $cfg['columns'] ?? 3;
												$gutter        = $cfg['gutter'] ?? 16;
												$edit_url      = admin_url( 'admin.php?page=' . self::PAGE_SLUG . '&id=' . $gid );
												$trash_url     = wp_nonce_url( admin_url( 'admin.php?page=matcha-ai-hub&action=trash&gallery_id=' . $gid ), 'matcha_trash_' . $gid );
												$duplicate_url = wp_nonce_url( admin_url( 'admin.php?page=matcha-ai-hub&action=duplicate&gallery_id=' . $gid ), 'matcha_duplicate_' . $gid );
												$relative_time = human_time_diff( get_post_modified_time( 'U', false, $post ), current_time( 'timestamp' ) ) . ' ' . __( 'ago', 'matcha-gallery' );

												$preview_urls = array();
												foreach ( array_slice( $img_ids, 0, 4 ) as $attach_id ) {
													$src = wp_get_attachment_image_url( (int) $attach_id, 'thumbnail' );
													if ( $src ) {
														$preview_urls[] = $src;
													}
												}
												$preview_count     = count( $preview_urls );
												$thumb_count_class = 'matcha-mini-thumbs--' . ( $preview_count > 0 ? min( 4, $preview_count ) : 'empty' );
												?>
												<tr class="matcha-gallery-row" data-id="<?php echo (int) $gid; ?>" data-title="<?php echo esc_attr( strtolower( $post->post_title ) ); ?>" data-layout="<?php echo esc_attr( $layout ); ?>">
													<!-- Preview + Title -->
													<td>
														<div class="matcha-gallery-cell-preview">
															<div class="matcha-mini-thumbs <?php echo esc_attr( $thumb_count_class ); ?>">
																<?php if ( empty( $preview_urls ) ) : ?>
																	<div class="matcha-mini-thumb matcha-mini-thumb--empty">
																		<span class="dashicons dashicons-format-image"></span>
																	</div>
																<?php else : ?>
																	<?php foreach ( $preview_urls as $src ) : ?>
																		<img src="<?php echo esc_url( $src ); ?>" alt="" class="matcha-mini-thumb">
																	<?php endforeach; ?>
																<?php endif; ?>
																<?php if ( $cnt > 4 ) : ?>
																	<span class="matcha-mini-more">+<?php echo (int) ( $cnt - 4 ); ?></span>
																<?php endif; ?>
															</div>

															<div class="matcha-gallery-meta-text">
																<a href="<?php echo esc_url( $edit_url ); ?>" class="matcha-gallery-cell-title">
																	<?php echo esc_html( $post->post_title ?: __( 'Untitled Gallery', 'matcha-gallery' ) ); ?>
																	<span class="matcha-id-pill">#<?php echo (int) $gid; ?></span>
																</a>
																<div class="matcha-row-actions">
																	<a href="<?php echo esc_url( $edit_url ); ?>" class="matcha-row-action matcha-row-action--edit">
																		<strong><?php esc_html_e( 'Edit in Studio', 'matcha-gallery' ); ?> ↗</strong>
																	</a>
																	<span class="matcha-row-sep">•</span>
																	<a href="<?php echo esc_url( $duplicate_url ); ?>" class="matcha-row-action" title="<?php esc_attr_e( 'Duplicate gallery settings and photos', 'matcha-gallery' ); ?>">
																		<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
																		<?php esc_html_e( 'Duplicate', 'matcha-gallery' ); ?>
																	</a>
																	<span class="matcha-row-sep">•</span>
																	<a href="<?php echo esc_url( $trash_url ); ?>" class="matcha-row-action matcha-trash-link" onclick="return confirm('<?php esc_attr_e( 'Are you sure you want to move this gallery to trash?', 'matcha-gallery' ); ?>');">
																		<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
																		<?php esc_html_e( 'Trash', 'matcha-gallery' ); ?>
																	</a>
																</div>
															</div>
														</div>
													</td>

											<!-- Layout & Geometry -->
											<td>
												<span class="matcha-layout-badge matcha-layout-badge--<?php echo esc_attr( $layout_info['class'] ); ?>">
													<?php echo self::get_layout_svg( $layout ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
													<span><?php echo esc_html( $layout_info['label'] ); ?></span>
												</span>
												<div class="matcha-specs-line">
													<?php if ( in_array( $layout, array( 'grid', 'masonry' ), true ) ) : ?>
														<span><?php echo (int) $columns; ?> <?php esc_html_e( 'Cols', 'matcha-gallery' ); ?></span>
														<span>•</span>
													<?php elseif ( 'justified' === $layout ) : ?>
														<span><?php echo (int) ( $cfg['rowHeight'] ?? 240 ); ?>px <?php esc_html_e( 'Rows', 'matcha-gallery' ); ?></span>
														<span>•</span>
													<?php endif; ?>
													<span><?php echo (int) $gutter; ?>px <?php esc_html_e( 'Gutter', 'matcha-gallery' ); ?></span>
													<span>•</span>
													<span><?php echo esc_html( $frame_name ); ?></span>
												</div>
											</td>

											<!-- Photos & Features -->
											<td>
												<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
													<span class="matcha-feat-tag matcha-feat-tag--active" style="font-size:11px;padding:3px 8px;display:inline-flex;align-items:center;gap:4px;">
														<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
														<strong><?php echo (int) $cnt; ?></strong> <?php esc_html_e( 'Photos', 'matcha-gallery' ); ?>
													</span>
													<?php if ( ! empty( $cfg['instantFramesEnabled'] ) ) : ?>
														<span class="matcha-feat-tag matcha-feat-tag--active" title="<?php esc_attr_e( 'Zero-CLS Aspect Ratio Frames Active', 'matcha-gallery' ); ?>" style="display:inline-flex;align-items:center;gap:3px;">
															<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
															Zero-CLS
														</span>
													<?php endif; ?>
												</div>
												<div class="matcha-tags-wrap">
													<?php if ( ! empty( $cfg['searchEnabled'] ) ) : ?>
														<span class="matcha-feat-tag">
															<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
															<?php esc_html_e( 'Search', 'matcha-gallery' ); ?>
														</span>
													<?php endif; ?>
													<?php if ( ! empty( $cfg['filtersEnabled'] ) ) : ?>
														<span class="matcha-feat-tag">
															<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line></svg>
															<?php esc_html_e( 'Filters', 'matcha-gallery' ); ?>
														</span>
													<?php endif; ?>
													<?php if ( ! empty( $cfg['colorFilterEnabled'] ) ) : ?>
														<span class="matcha-feat-tag">
															<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><circle cx="8" cy="10" r="1.5" fill="currentColor"></circle><circle cx="16" cy="10" r="1.5" fill="currentColor"></circle><circle cx="12" cy="15" r="1.5" fill="currentColor"></circle></svg>
															<?php esc_html_e( 'Colors', 'matcha-gallery' ); ?>
														</span>
													<?php endif; ?>
													<?php if ( ! empty( $cfg['shoppableEnabled'] ) && ! empty( $cfg['imageLinks'] ) ) : ?>
														<span class="matcha-feat-tag matcha-feat-tag--shop">
															<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
															<?php esc_html_e( 'Shop', 'matcha-gallery' ); ?>
														</span>
													<?php endif; ?>
													<?php if ( ! empty( $cfg['proofingEnabled'] ) ) : ?>
														<span class="matcha-feat-tag matcha-feat-tag--heart">
															<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
															<?php esc_html_e( 'Proofing', 'matcha-gallery' ); ?>
														</span>
													<?php endif; ?>
													<?php if ( ! empty( $cfg['paginationType'] ) && 'none' !== $cfg['paginationType'] ) : ?>
														<span class="matcha-feat-tag">
															<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
															<?php echo esc_html( ucfirst( $cfg['paginationType'] ) ); ?>
														</span>
													<?php endif; ?>
												</div>
											</td>

											<!-- Embed Shortcode -->
											<td>
												<div class="matcha-code-box">
													<code>[matcha_gallery id="<?php echo (int) $gid; ?>"]</code>
													<button type="button" class="matcha-copy-btn" data-copy='[matcha_gallery id="<?php echo (int) $gid; ?>"]' title="<?php esc_attr_e( 'Copy shortcode to clipboard', 'matcha-gallery' ); ?>">
														<?php esc_html_e( 'Copy', 'matcha-gallery' ); ?>
													</button>
												</div>
											</td>

											<!-- Modified -->
											<td>
												<span class="matcha-time-text"><?php echo esc_html( $relative_time ); ?></span>
											</td>

											<!-- Actions -->
											<td style="text-align:right;">
												<a href="<?php echo esc_url( $edit_url ); ?>" class="matcha-btn-studio">
													<?php esc_html_e( 'Open Studio ↗', 'matcha-gallery' ); ?>
												</a>
											</td>
										</tr>
									<?php endforeach; ?>
								</tbody>
							</table>
						</div>
					</div>
				<?php endif; ?>
			</div>

				<!-- Panel: Embedding & Integration Guide -->
				<div id="matcha-panel-integration" class="matcha-hub-panel">
					<div class="matcha-guide-grid">
						<div class="matcha-guide-card">
							<h4><?php esc_html_e( 'Gutenberg Block Editor', 'matcha-gallery' ); ?></h4>
							<p><?php esc_html_e( 'Open any post or page, click + to insert a new block, and search for "Matcha Gallery" or type /matcha. Select your saved gallery from the inspector dropdown on the right.', 'matcha-gallery' ); ?></p>
							<pre><code>/smart-gallery</code></pre>
						</div>

						<div class="matcha-guide-card">
							<h4><?php esc_html_e( 'Elementor Page Builder', 'matcha-gallery' ); ?></h4>
							<p><?php esc_html_e( 'Edit with Elementor, find the dedicated "Matcha Gallery" widget in the left panel under the Matcha Gallery category, drag it to your canvas, and choose your gallery ID.', 'matcha-gallery' ); ?></p>
							<pre><code>Widget: matcha_gallery</code></pre>
						</div>

						<div class="matcha-guide-card">
							<h4><?php esc_html_e( 'WordPress Shortcode', 'matcha-gallery' ); ?></h4>
							<p><?php esc_html_e( 'Embed anywhere in classic content, text widgets, sidebars, or page builder raw HTML blocks using the standard shortcode syntax.', 'matcha-gallery' ); ?></p>
							<pre><code>[matcha_gallery id="27"]</code></pre>
						</div>

						<div class="matcha-guide-card">
							<h4><?php esc_html_e( 'PHP Theme Template Tag', 'matcha-gallery' ); ?></h4>
							<p><?php esc_html_e( 'Include your galleries directly inside custom page templates, archive headers, or theme hook callbacks using do_shortcode().', 'matcha-gallery' ); ?></p>
							<pre><code>&lt;?php echo do_shortcode( '[matcha_gallery id="27"]' ); ?&gt;</code></pre>
						</div>
					</div>
				</div>
			<?php endif; ?>

		</div><!-- .matcha-container -->
	</div><!-- .matcha-hub-wrap -->
		<?php
	}

	/**
	 * Render full-screen Studio.
	 */
	public static function render_studio(): void {
		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'matcha-gallery' ) );
		}
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Page routing and reading gallery ID for display.
		$id   = isset( $_GET['id'] ) ? absint( wp_unslash( $_GET['id'] ) ) : ( isset( $_GET['gallery_id'] ) ? absint( wp_unslash( $_GET['gallery_id'] ) ) : 0 );
		$post = $id ? get_post( $id ) : null;
		$title = $post ? $post->post_title : __( 'New Gallery', 'matcha-gallery' );
		$cfg   = $post ? Gallery_CPT::get_config( $id ) : Gallery_CPT::default_config();
		?>
		<div id="matcha-studio-root" data-gallery-id="<?php echo (int) $id; ?>" data-config="<?php echo esc_attr( wp_json_encode( $cfg ) ); ?>" data-title="<?php echo esc_attr( $title ); ?>"></div>
		<?php
	}

	/**
	 * Enqueue Studio assets only on studio page.
	 *
	 * @param string $hook Hook suffix.
	 */
	public static function enqueue_assets( string $hook ): void {
		// Hub needs CSS and copy/tab/search script
		if ( str_contains( $hook, 'matcha-ai-hub' ) ) {
			wp_enqueue_style( 'matcha-admin', MATCHA_GALLERY_URL . 'assets/css/admin.css', array(), MATCHA_GALLERY_VERSION );
			wp_enqueue_script( 'matcha-hub', MATCHA_GALLERY_URL . 'assets/js/hub.js', array(), MATCHA_GALLERY_VERSION, true );
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Page hook checking.
		if ( ! isset( $_GET['page'] ) || self::PAGE_SLUG !== sanitize_text_field( wp_unslash( $_GET['page'] ) ) ) {
			return;
		}

		// Full-screen Studio
		wp_enqueue_media();

		// Studio bundle (vanilla IIFE, no imports)
		$studio_js  = MATCHA_GALLERY_URL . 'assets/js/studio.js';
		$studio_css = MATCHA_GALLERY_URL . 'assets/css/studio.css';
		$css_ver    = file_exists( MATCHA_GALLERY_PATH . 'assets/css/studio.css' ) ? filemtime( MATCHA_GALLERY_PATH . 'assets/css/studio.css' ) : MATCHA_GALLERY_VERSION;
		$css_front  = file_exists( MATCHA_GALLERY_PATH . 'assets/css/frontend-gallery.css' ) ? filemtime( MATCHA_GALLERY_PATH . 'assets/css/frontend-gallery.css' ) : MATCHA_GALLERY_VERSION;
		$js_ver     = file_exists( MATCHA_GALLERY_PATH . 'assets/js/studio.js' ) ? filemtime( MATCHA_GALLERY_PATH . 'assets/js/studio.js' ) : MATCHA_GALLERY_VERSION;

		wp_enqueue_style( 'matcha-studio', $studio_css, array(), $css_ver );
		wp_enqueue_style( 'matcha-frontend-for-canvas', MATCHA_GALLERY_URL . 'assets/css/frontend-gallery.css', array(), $css_front );
		// Add full-screen hide for WP chrome for pure studio immersion
		wp_add_inline_style( 'matcha-studio', '#wpadminbar,#adminmenumain,#adminmenuback,#wpfooter{display:none !important} #wpcontent{margin-left:0 !important;padding:0 !important;} #wpbody-content{padding:0 !important;} html.wp-toolbar{padding-top:0 !important;}' );

		// Bust cache after studio fixes
		wp_enqueue_script( 'matcha-studio', $studio_js, array( 'media-editor' ), $js_ver, true );
		wp_enqueue_style( 'matcha-studio-v4', MATCHA_GALLERY_URL . 'assets/css/frontend-gallery.css', array(), MATCHA_GALLERY_VERSION . '.4' );
		// Local vendored libraries (WordPress.org compliant — no remote CDNs)
		wp_enqueue_script( 'sortablejs', MATCHA_GALLERY_URL . 'assets/js/vendor/sortable.min.js', array(), '1.15.7', true );
		wp_enqueue_script( 'html2canvas', MATCHA_GALLERY_URL . 'assets/js/vendor/html2canvas.min.js', array(), '1.4.1', true );

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Gallery ID reading for script localization.
		$id = isset( $_GET['id'] ) ? absint( wp_unslash( $_GET['id'] ) ) : 0;
		$studio_data = array(
			'root'       => esc_url_raw( rest_url() ),
			'nonce'      => wp_create_nonce( 'wp_rest' ),
			'galleryId'  => $id,
			'config'     => $id ? Gallery_CPT::get_config( $id ) : Gallery_CPT::default_config(),
			'title'      => $id ? get_the_title( $id ) : '',
			'iconUrl'    => MATCHA_GALLERY_URL . 'assets/images/icon-128x128.png',
			'isPro'      => Gallery_CPT::is_pro_active(),
			'upgradeUrl' => apply_filters( 'matcha_gallery_upgrade_url', 'https://wpmatcha.com/wordpress-plugins/matcha-gallery-pro/' ),
			'ajaxUrl'    => admin_url( 'admin-ajax.php' ),
			'mediaNonce' => wp_create_nonce( 'matcha_ai_generate' ),
			'i18n'       => array(
				'untitled' => __( 'Untitled Gallery', 'matcha-gallery' ),
			),
		);
		$studio_data = apply_filters( 'matcha_gallery_studio_localized_data', $studio_data );

		wp_localize_script(
			'matcha-studio',
			'MatchaStudio',
			$studio_data
		);
	}
}
