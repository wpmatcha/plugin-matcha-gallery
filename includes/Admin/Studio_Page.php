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
	 * Register hooks.
	 */
	public static function register(): void {
		add_action( 'admin_menu', array( static::class, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( static::class, 'enqueue_assets' ) );
	}

	/**
	 * Register menu entries.
	 * Top-level Matcha AI + All Galleries hub.
	 */
	public static function register_menu(): void {
		// Top-level menu
		add_menu_page(
			__( 'Matcha AI', 'matcha-gallery' ),
			__( 'Matcha AI', 'matcha-gallery' ),
			'edit_posts',
			'matcha-ai-hub',
			array( static::class, 'render_hub' ),
			'dashicons-format-gallery',
			30
		);

		// All Galleries hub
		add_submenu_page(
			'matcha-ai-hub',
			__( 'All Galleries', 'matcha-gallery' ),
			__( 'All Galleries', 'matcha-gallery' ),
			'edit_posts',
			'matcha-ai-hub',
			array( static::class, 'render_hub' )
		);

		// Add New -> redirects to Studio
		add_submenu_page(
			'matcha-ai-hub',
			__( 'Add New Gallery', 'matcha-gallery' ),
			__( 'Add New Gallery', 'matcha-gallery' ),
			'edit_posts',
			self::PAGE_SLUG,
			array( static::class, 'render_studio' )
		);

		// AI Settings (reuse existing Settings_Page slug but under hub)
		add_submenu_page(
			'matcha-ai-hub',
			__( 'AI Settings', 'matcha-gallery' ),
			__( 'AI Settings', 'matcha-gallery' ),
			'manage_options',
			'matcha-ai-settings',
			array( '\\Matcha_AI_Smart_Gallery\\Admin\\Settings_Page', 'render_page' )
		);

		// AI Keywords -> edit-tags screen
		add_submenu_page(
			'matcha-ai-hub',
			__( 'AI Keywords', 'matcha-gallery' ),
			__( 'AI Keywords', 'matcha-gallery' ),
			'edit_posts',
			'edit-tags.php?taxonomy=matcha_ai_keywords',
			''
		);
	}

	/**
	 * Render All Galleries hub.
	 */
	public static function render_hub(): void {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return;
		}
		$q = new \WP_Query(
			array(
				'post_type'      => Gallery_CPT::POST_TYPE,
				'post_status'    => array( 'publish', 'draft' ),
				'posts_per_page' => 50,
				'orderby'        => 'modified',
				'order'          => 'DESC',
			)
		);
		?>
		<div class="wrap matcha-hub">
			<h1 class="wp-heading-inline"><?php esc_html_e( 'Matcha Galleries', 'matcha-gallery' ); ?></h1>
			<a href="<?php echo esc_url( admin_url( 'admin.php?page=' . self::PAGE_SLUG ) ); ?>" class="page-title-action"><?php esc_html_e( 'Add New Gallery', 'matcha-gallery' ); ?></a>
			<hr class="wp-header-end">
			<?php if ( empty( $q->posts ) ) : ?>
				<div class="matcha-empty-hub" style="text-align:center;padding:60px 20px;background:#fff;border:1px solid #ccd0d4;margin-top:20px;">
					<p style="font-size:16px;color:#646970;"><?php esc_html_e( 'No galleries yet. Create your first AI-powered gallery.', 'matcha-gallery' ); ?></p>
					<a href="<?php echo esc_url( admin_url( 'admin.php?page=' . self::PAGE_SLUG ) ); ?>" class="button button-primary button-hero"><?php esc_html_e( 'Create Gallery →', 'matcha-gallery' ); ?></a>
				</div>
			<?php else : ?>
				<table class="wp-list-table widefat fixed striped" style="margin-top:20px;">
					<thead><tr><th><?php esc_html_e( 'Title', 'matcha-gallery' ); ?></th><th><?php esc_html_e( 'Images', 'matcha-gallery' ); ?></th><th><?php esc_html_e( 'Shortcode', 'matcha-gallery' ); ?></th><th><?php esc_html_e( 'Modified', 'matcha-gallery' ); ?></th></tr></thead>
					<tbody>
					<?php foreach ( $q->posts as $post ) :
						$cfg = Gallery_CPT::get_config( (int) $post->ID );
						$cnt = count( $cfg['imageIds'] );
						$edit_url = admin_url( 'admin.php?page=' . self::PAGE_SLUG . '&id=' . (int) $post->ID );
						?>
						<tr>
							<td><a href="<?php echo esc_url( $edit_url ); ?>"><strong><?php echo esc_html( $post->post_title ?: __( '(no title)', 'matcha-gallery' ) ); ?></strong></a>
								<div class="row-actions"><span class="edit"><a href="<?php echo esc_url( $edit_url ); ?>"><?php esc_html_e( 'Edit', 'matcha-gallery' ); ?></a> | </span><span class="trash"><a href="<?php echo esc_url( get_delete_post_link( (int) $post->ID ) ); ?>"><?php esc_html_e( 'Trash', 'matcha-gallery' ); ?></a></span></div>
							</td>
							<td><?php echo (int) $cnt; ?></td>
							<td><code>[matcha_gallery id="<?php echo (int) $post->ID; ?>"]</code> <button type="button" class="button button-small matcha-copy-btn" data-copy='[matcha_gallery id="<?php echo (int) $post->ID; ?>"]'><?php esc_html_e( 'Copy', 'matcha-gallery' ); ?></button></td>
							<td><?php echo esc_html( $post->post_modified ); ?></td>
						</tr>
					<?php endforeach; ?>
					</tbody>
				</table>
			<?php endif; ?>
		</div>
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
		$id   = isset( $_GET['id'] ) ? absint( wp_unslash( $_GET['id'] ) ) : 0;
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
		// Hub needs minimal CSS and copy script
		if ( str_contains( $hook, 'matcha-ai-hub' ) ) {
			wp_enqueue_style( 'matcha-admin', MATCHA_GALLERY_URL . 'assets/css/admin.css', array(), MATCHA_GALLERY_VERSION );
			wp_enqueue_script( 'wp-util' );
			wp_add_inline_script(
				'wp-util',
				"document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('.matcha-copy-btn').forEach(function(b){b.addEventListener('click',function(){navigator.clipboard.writeText(b.dataset.copy);b.textContent='✓';setTimeout(function(){b.textContent='Copy';},1200);});});});"
			);
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

		wp_enqueue_style( 'matcha-studio', $studio_css, array(), MATCHA_GALLERY_VERSION );
		wp_enqueue_style( 'matcha-frontend-for-canvas', MATCHA_GALLERY_URL . 'assets/css/frontend-gallery.css', array(), MATCHA_GALLERY_VERSION );
		// Add full-screen hide for WP chrome for pure studio immersion
		wp_add_inline_style( 'matcha-studio', '#wpadminbar,#adminmenumain,#adminmenuback,#wpfooter{display:none !important} #wpcontent{margin-left:0 !important;padding:0 !important;} #wpbody-content{padding:0 !important;} html.wp-toolbar{padding-top:0 !important;}' );

		// Bust cache after clipboard+PUT fix
		wp_enqueue_script( 'matcha-studio', $studio_js, array( 'media-editor' ), MATCHA_GALLERY_VERSION . '.4', true );
		wp_enqueue_style( 'matcha-studio-v4', MATCHA_GALLERY_URL . 'assets/css/frontend-gallery.css', array(), MATCHA_GALLERY_VERSION . '.4' );
		// Local vendored libraries (WordPress.org compliant — no remote CDNs)
		wp_enqueue_script( 'sortablejs', MATCHA_GALLERY_URL . 'assets/js/vendor/sortable.min.js', array(), '1.15.6', true );
		wp_enqueue_script( 'html2canvas', MATCHA_GALLERY_URL . 'assets/js/vendor/html2canvas.min.js', array(), '1.4.1', true );

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Gallery ID reading for script localization.
		$id = isset( $_GET['id'] ) ? absint( wp_unslash( $_GET['id'] ) ) : 0;
		wp_localize_script(
			'matcha-studio',
			'MatchaStudio',
			array(
				'root'      => esc_url_raw( rest_url() ),
				'nonce'     => wp_create_nonce( 'wp_rest' ),
				'galleryId' => $id,
				'config'    => $id ? Gallery_CPT::get_config( $id ) : Gallery_CPT::default_config(),
				'title'     => $id ? get_the_title( $id ) : '',
				'isPro'      => Gallery_CPT::is_pro_active(),
				'upgradeUrl' => apply_filters( 'matcha_gallery_upgrade_url', 'https://wpmatcha.com/pricing' ),
				'ajaxUrl'    => admin_url( 'admin-ajax.php' ),
				'mediaNonce' => wp_create_nonce( 'matcha_ai_generate' ),
				'i18n'       => array(
					'untitled' => __( 'Untitled Gallery', 'matcha-gallery' ),
				),
			)
		);
	}
}
