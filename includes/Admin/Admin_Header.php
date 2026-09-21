<?php
/**
 * Universal Admin Top Navigation Header for Matcha Gallery.
 *
 * Provides a clean, modern, full-width top navigation bar inspired by Astra and Elementor,
 * unifying all plugin administrative views with consistent branding, tab navigation,
 * and status indicators.
 *
 * @package Matcha_AI_Smart_Gallery\Admin
 */

namespace Matcha_AI_Smart_Gallery\Admin;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Matcha_AI_Smart_Gallery\Pro\Pro_Features;

/**
 * Universal Admin Header renderer.
 */
class Admin_Header {

	/**
	 * Render the full-width Astra-style admin header bar.
	 *
	 * @param string $active_tab Active tab identifier ('dashboard', 'galleries', 'settings', 'comparison', 'license').
	 */
	public static function render( string $active_tab = 'dashboard' ): void {
		$is_pro = class_exists( '\\Matcha_AI_Smart_Gallery\\Gallery\\Gallery_CPT' )
			? \Matcha_AI_Smart_Gallery\Gallery\Gallery_CPT::is_pro_active()
			: Pro_Features::is_active();

		$dashboard_url  = admin_url( 'admin.php?page=matcha-ai-hub' );
		$galleries_url  = admin_url( 'admin.php?page=matcha-ai-hub&tab=galleries' );
		$studio_url     = admin_url( 'admin.php?page=matcha-studio' );
		$settings_url   = admin_url( 'admin.php?page=matcha-ai-settings' );
		$comparison_url = admin_url( 'admin.php?page=matcha-ai-hub&tab=comparison' );
		$license_url    = admin_url( 'admin.php?page=matcha-pro-license' );
		$upgrade_url    = 'https://wpmatcha.com/wordpress-plugins/matcha-gallery-pro/';
		$docs_url       = 'https://wpmatcha.com/wordpress-plugins/matcha-gallery-pro/';
		$support_url    = 'https://wpmatcha.com/contact/';
		?>
		<!-- Astra-Style Top Announcement Notice -->
		<aside class="matcha-announcement-bar" id="matcha-announcement-bar" aria-label="<?php esc_attr_e( 'Matcha Announcement', 'matcha-gallery' ); ?>">
			<div class="matcha-announcement-bar__inner">
				<span class="matcha-announcement-bar__highlight"><?php esc_html_e( 'Zero-CLS Layout Engine:', 'matcha-gallery' ); ?></span>
				<span class="matcha-announcement-bar__text"><?php esc_html_e( 'Supercharge your WordPress photo galleries with AI Vision auto-tagging & 6 masonry layouts.', 'matcha-gallery' ); ?></span>
				<?php if ( ! $is_pro ) : ?>
					<a href="<?php echo esc_url( $upgrade_url ); ?>" target="_blank" rel="noopener noreferrer" class="matcha-announcement-bar__cta">
						<?php esc_html_e( 'Get Full Control ↗', 'matcha-gallery' ); ?>
					</a>
				<?php else : ?>
					<a href="<?php echo esc_url( $settings_url ); ?>" class="matcha-announcement-bar__cta">
						<?php esc_html_e( 'Configure AI Settings ↗', 'matcha-gallery' ); ?>
					</a>
				<?php endif; ?>
			</div>
			<button type="button" class="matcha-announcement-bar__close" onclick="document.getElementById('matcha-announcement-bar').style.display='none';" aria-label="<?php esc_attr_e( 'Dismiss notice', 'matcha-gallery' ); ?>">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
			</button>
		</aside>

		<!-- Astra-Style Full-Width Sticky Header -->
		<header class="matcha-top-nav-bar">
			<div class="matcha-top-nav-inner">
				<!-- Brand Logo & Name -->
				<div class="matcha-nav-brand">
					<a href="<?php echo esc_url( $dashboard_url ); ?>" class="matcha-nav-brand__link">
						<span class="matcha-nav-brand__icon">
							<img src="<?php echo esc_url( MATCHA_GALLERY_URL . 'assets/images/icon-128x128.png?v=' . MATCHA_GALLERY_VERSION . '.2' ); ?>" alt="<?php esc_attr_e( 'Matcha Gallery', 'matcha-gallery' ); ?>" width="34" height="34" style="border-radius:7px;object-fit:cover;display:block;" />
						</span>
						<span class="matcha-nav-brand__title"><?php esc_html_e( 'Matcha Gallery', 'matcha-gallery' ); ?></span>
					</a>
				</div>

				<!-- Horizontal Navigation Menu (Astra Style) -->
				<nav class="matcha-nav-menu" aria-label="<?php esc_attr_e( 'Matcha Gallery Navigation', 'matcha-gallery' ); ?>">
					<a href="<?php echo esc_url( $dashboard_url ); ?>" class="matcha-nav-item <?php echo ( 'dashboard' === $active_tab || 'welcome' === $active_tab ) ? 'is-active' : ''; ?>">
						<span><?php esc_html_e( 'Dashboard', 'matcha-gallery' ); ?></span>
						<?php if ( 'dashboard' === $active_tab || 'welcome' === $active_tab ) : ?><span class="matcha-nav-indicator"></span><?php endif; ?>
					</a>

					<a href="<?php echo esc_url( $galleries_url ); ?>" class="matcha-nav-item <?php echo 'galleries' === $active_tab ? 'is-active' : ''; ?>">
						<span><?php esc_html_e( 'All Galleries', 'matcha-gallery' ); ?></span>
						<?php if ( 'galleries' === $active_tab ) : ?><span class="matcha-nav-indicator"></span><?php endif; ?>
					</a>

					<a href="<?php echo esc_url( $studio_url ); ?>" class="matcha-nav-item <?php echo 'studio' === $active_tab ? 'is-active' : ''; ?>">
						<span><?php esc_html_e( 'Add New Gallery', 'matcha-gallery' ); ?></span>
						<?php if ( 'studio' === $active_tab ) : ?><span class="matcha-nav-indicator"></span><?php endif; ?>
					</a>

					<a href="<?php echo esc_url( $settings_url ); ?>" class="matcha-nav-item <?php echo 'settings' === $active_tab ? 'is-active' : ''; ?>">
						<span><?php esc_html_e( 'AI Settings', 'matcha-gallery' ); ?></span>
						<?php if ( 'settings' === $active_tab ) : ?><span class="matcha-nav-indicator"></span><?php endif; ?>
					</a>

					<a href="<?php echo esc_url( $comparison_url ); ?>" class="matcha-nav-item <?php echo 'comparison' === $active_tab ? 'is-active' : ''; ?>">
						<span><?php esc_html_e( 'Free vs Pro', 'matcha-gallery' ); ?></span>
						<?php if ( 'comparison' === $active_tab ) : ?><span class="matcha-nav-indicator"></span><?php endif; ?>
					</a>

					<a href="<?php echo esc_url( $docs_url ); ?>" target="_blank" rel="noopener noreferrer" class="matcha-nav-item">
						<span><?php esc_html_e( 'Learn & Docs', 'matcha-gallery' ); ?></span>
					</a>

					<?php if ( $is_pro ) : ?>
						<a href="<?php echo esc_url( $license_url ); ?>" class="matcha-nav-item <?php echo 'license' === $active_tab ? 'is-active' : ''; ?>">
							<span><?php esc_html_e( 'Pro License', 'matcha-gallery' ); ?></span>
							<?php if ( 'license' === $active_tab ) : ?><span class="matcha-nav-indicator"></span><?php endif; ?>
						</a>
					<?php else : ?>
						<a href="<?php echo esc_url( $upgrade_url ); ?>" target="_blank" rel="noopener noreferrer" class="matcha-nav-item matcha-nav-item--upgrade">
							<span><?php esc_html_e( 'Get Full Control ↗', 'matcha-gallery' ); ?></span>
						</a>
					<?php endif; ?>
				</nav>

				<!-- Right Meta Actions -->
				<div class="matcha-nav-meta">
					<?php if ( $is_pro ) : ?>
						<span class="matcha-nav-badge matcha-nav-badge--pro">
							<?php esc_html_e( 'PRO ACTIVE', 'matcha-gallery' ); ?>
						</span>
					<?php else : ?>
						<span class="matcha-nav-badge matcha-nav-badge--free">
							<?php esc_html_e( 'FREE', 'matcha-gallery' ); ?>
						</span>
					<?php endif; ?>

					<div class="matcha-nav-meta-links">
						<a href="<?php echo esc_url( $docs_url ); ?>" target="_blank" rel="noopener noreferrer" class="matcha-nav-icon-link" title="<?php esc_attr_e( 'Documentation', 'matcha-gallery' ); ?>">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
						</a>
						<a href="<?php echo esc_url( $support_url ); ?>" target="_blank" rel="noopener noreferrer" class="matcha-nav-icon-link" title="<?php esc_attr_e( 'Help & Priority Support', 'matcha-gallery' ); ?>">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
						</a>
					</div>
				</div>
			</div>
		</header>
		<?php
	}
}
