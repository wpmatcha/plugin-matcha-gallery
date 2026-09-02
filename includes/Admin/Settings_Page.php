<?php
/**
 * Advanced Admin Settings Page for Matcha AI Smart Gallery.
 *
 * Provides a modern, lightweight, tabbed dashboard with live API connection testing,
 * interactive shortcode builder, AI keyword cloud, and automation controls.
 *
 * @package Matcha_AI_Smart_Gallery\Admin
 */


namespace Matcha_AI_Smart_Gallery\Admin;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


use Matcha_AI_Smart_Gallery\Plugin;
use Matcha_AI_Smart_Gallery\Taxonomy\AI_Keywords_Taxonomy;
use Matcha_AI_Smart_Gallery\Pro\Pro_Features;

/**
 * Settings Page controller and renderer.
 */
class Settings_Page {

	/**
	 * Option group name.
	 */
	public const OPTION_GROUP = 'matcha_gallery_settings_group';

	/**
	 * Option name in wp_options.
	 */
	public const OPTION_NAME = 'matcha_gallery_settings';

	/**
	 * Menu slug.
	 */
	public const MENU_SLUG = 'matcha-ai-gallery';

	/**
	 * Register hooks.
	 */
	public static function register(): void {
		add_action( 'admin_menu', array( static::class, 'add_menu_page' ) );
		add_action( 'admin_init', array( static::class, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( static::class, 'enqueue_assets' ) );
		add_action( 'wp_ajax_matcha_test_api_connection', array( static::class, 'ajax_test_api_connection' ) );
	}

	/**
	 * Add the settings page — now as submenu under Matcha AI hub, keep legacy redirect.
	 */
	public static function add_menu_page(): void {
		// Legacy options page kept for backward compat (redirects to hub submenu)
		add_options_page(
			__( 'Matcha AI Gallery', 'matcha-gallery' ),
			__( 'Matcha AI Gallery', 'matcha-gallery' ),
			'manage_options',
			self::MENU_SLUG,
			array( static::class, 'render_page' )
		);
		// Also hooked via Studio_Page hub — no duplicate add_submenu here to avoid recursion
	}

	/**
	 * Enqueue admin styles and scripts on the settings page.
	 *
	 * @param string $hook_suffix Current admin page hook suffix.
	 */
	public static function enqueue_assets( string $hook_suffix ): void {
		// Legacy: settings_page_matcha-ai-gallery, New: matcha-ai-hub_page_matcha-ai-settings + toplevel
		$allowed = array( 'settings_page_' . self::MENU_SLUG, 'toplevel_page_matcha-ai-hub', 'matcha-ai-hub_page_matcha-ai-settings' );
		$is_matcha = false;
		foreach ( $allowed as $a ) {
			if ( $hook_suffix === $a ) { $is_matcha = true; break; }
		}
		// Also allow any hook containing matcha-ai-settings
		if ( ! $is_matcha && false === strpos( $hook_suffix, 'matcha-ai' ) ) {
			return;
		}
		// Final guard: only on our pages (contains matcha)
		if ( false === strpos( $hook_suffix, 'matcha' ) ) {
			return;
		}

		wp_enqueue_style(
			'matcha-admin',
			MATCHA_GALLERY_URL . 'assets/css/admin.css',
			array(),
			MATCHA_GALLERY_VERSION . '.5'
		);

		// Small inline helper script for tabs, copy buttons, and AJAX connection test.
		wp_add_inline_script(
			'jquery',
			self::get_settings_inline_script()
		);
	}

	/**
	 * Register settings with WordPress Settings API.
	 */
	public static function register_settings(): void {
		register_setting(
			self::OPTION_GROUP,
			self::OPTION_NAME,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( static::class, 'sanitize_settings' ),
				'default'           => array(),
			)
		);
	}

	/**
	 * Sanitize settings before saving.
	 *
	 * @param mixed $input Raw input from form.
	 * @return array<string, mixed>
	 */
	public static function sanitize_settings( mixed $input ): array {
		if ( ! is_array( $input ) ) {
			return array();
		}

		$endpoint = esc_url_raw( $input['api_endpoint'] ?? 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' );
		// SSRF guard on custom endpoint
		if ( class_exists( '\\Matcha_AI_Smart_Gallery\\AI\\AI_REST' ) ) {
			$check = \Matcha_AI_Smart_Gallery\AI\AI_REST::validate_endpoint_url( $endpoint );
			if ( is_wp_error( $check ) ) {
				add_settings_error( 'matcha_gallery_settings', 'invalid_endpoint', $check->get_error_message() );
				$endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
			}
		}

		// Preserve existing key if masked via UI (***** case) or encrypt at rest
		$raw_key = sanitize_text_field( $input['api_key'] ?? '' );
		$existing = Plugin::get_setting( 'api_key', '' );
		// If user submitted masked value (contains • or *), keep existing
		if ( preg_match( '/^[•\*]+$/', $raw_key ) && ! empty( $existing ) ) {
			$raw_key = $existing;
		}

		return array(
			'api_key'            => $raw_key,
			'api_model'          => sanitize_text_field( $input['api_model'] ?? 'gemini-1.5-flash' ),
			'api_endpoint'       => $endpoint,
			'generate_alt'       => ! empty( $input['generate_alt'] ),
			'generate_title'     => ! empty( $input['generate_title'] ),
			'generate_caption'   => ! empty( $input['generate_caption'] ),
			'generate_tags'      => ! empty( $input['generate_tags'] ),
			'locale'             => sanitize_text_field( $input['locale'] ?? 'en' ),
			'auto_generate'      => ! empty( $input['auto_generate'] ),
			'overwrite_existing' => ! empty( $input['overwrite_existing'] ),
		);
	}

	/**
	 * Render the modern settings dashboard.
	 */
	public static function render_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$settings = Plugin::get_all_settings();
		$stats    = self::get_stats();
		$keywords = AI_Keywords_Taxonomy::get_all_terms( array( 'number' => 30, 'orderby' => 'count', 'order' => 'DESC' ) );
		?>
		<div class="wrap matcha-dashboard">
			<!-- Header -->
			<div class="matcha-dash-header">
				<div class="matcha-dash-header__brand">
					<div class="matcha-logo-icon" style="background:linear-gradient(135deg, #22c55e, #15803d);color:#fff;display:flex;align-items:center;justify-content:center;border-radius:10px;width:38px;height:38px;">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
					</div>
					<div>
						<h1 class="matcha-dash-title"><?php esc_html_e( 'Matcha Gallery', 'matcha-gallery' ); ?></h1>
						<p class="matcha-dash-subtitle"><?php esc_html_e( 'AI Vision Metadata & Smart Dynamic Photo Walls', 'matcha-gallery' ); ?></p>
					</div>
				</div>
				<div class="matcha-dash-header__meta">
					<span class="matcha-version-pill">v<?php echo esc_html( MATCHA_GALLERY_VERSION ); ?></span>
					<span class="matcha-status-pill <?php echo ! empty( $settings['api_key'] ) ? 'is-connected' : 'is-disconnected'; ?>">
						<span class="matcha-status-dot"></span>
						<?php echo ! empty( $settings['api_key'] ) ? esc_html__( 'AI Ready', 'matcha-gallery' ) : esc_html__( 'API Key Required', 'matcha-gallery' ); ?>
					</span>
				</div>
			</div>

			<!-- Stats Banner -->
			<div class="matcha-stats-grid">
				<div class="matcha-stat-card">
					<div class="matcha-stat-card__number"><?php echo (int) $stats['total_images']; ?></div>
					<div class="matcha-stat-card__label"><?php esc_html_e( 'Media Library Images', 'matcha-gallery' ); ?></div>
				</div>
				<div class="matcha-stat-card matcha-stat-card--highlight">
					<div class="matcha-stat-card__number"><?php echo (int) $stats['ai_tagged_images']; ?></div>
					<div class="matcha-stat-card__label"><?php esc_html_e( 'AI Tagged Images', 'matcha-gallery' ); ?></div>
				</div>
				<div class="matcha-stat-card">
					<div class="matcha-stat-card__number"><?php echo (int) $stats['total_keywords']; ?></div>
					<div class="matcha-stat-card__label"><?php esc_html_e( 'Unique AI Keywords', 'matcha-gallery' ); ?></div>
				</div>
				<div class="matcha-stat-card">
					<div class="matcha-stat-card__number"><?php echo (int) $stats['coverage_percent']; ?>%</div>
					<div class="matcha-stat-card__label"><?php esc_html_e( 'AI Enrichment Coverage', 'matcha-gallery' ); ?></div>
				</div>
			</div>

			<!-- Navigation Tabs -->
			<div class="matcha-tabs-nav">
				<button type="button" class="matcha-tab-btn is-active" data-tab="tab-api">
					<span class="dashicons dashicons-admin-network"></span> <?php esc_html_e( 'AI Provider & API', 'matcha-gallery' ); ?>
				</button>
				<button type="button" class="matcha-tab-btn" data-tab="tab-automation">
					<span class="dashicons dashicons-admin-settings"></span> <?php esc_html_e( 'Automation & Rules', 'matcha-gallery' ); ?>
				</button>
				<button type="button" class="matcha-tab-btn" data-tab="tab-shortcode">
					<span class="dashicons dashicons-shortcode"></span> <?php esc_html_e( 'Shortcode Builder', 'matcha-gallery' ); ?>
				</button>
				<button type="button" class="matcha-tab-btn" data-tab="tab-keywords">
					<span class="dashicons dashicons-tag"></span> <?php esc_html_e( 'AI Keywords Cloud', 'matcha-gallery' ); ?>
				</button>
				<button type="button" class="matcha-tab-btn" data-tab="tab-pro">
					<span class="dashicons dashicons-star-filled" style="color:#fbc02d;"></span> <?php esc_html_e( 'Pro Features', 'matcha-gallery' ); ?>
				</button>
			</div>

			<form method="post" action="options.php" class="matcha-form">
				<?php settings_fields( self::OPTION_GROUP ); ?>

				<!-- Tab 1: AI Provider & API -->
				<div id="tab-api" class="matcha-tab-content is-active">
					<div class="matcha-card">
						<div class="matcha-card__header">
							<h3><?php esc_html_e( 'AI Provider Credentials', 'matcha-gallery' ); ?></h3>
							<p><?php esc_html_e( 'Configure your OpenAI or OpenAI-compatible Vision endpoint. Your API key is encrypted and stored locally.', 'matcha-gallery' ); ?></p>
						</div>

						<div class="matcha-field-row">
							<label for="matcha_api_key">
								<strong><?php esc_html_e( 'API Key', 'matcha-gallery' ); ?></strong>
								<span class="matcha-badge matcha-badge--required"><?php esc_html_e( 'Required', 'matcha-gallery' ); ?></span>
							</label>
							<?php wp_nonce_field( 'matcha_ai_generate', 'matcha_api_test_nonce' ); ?>
							<div class="matcha-input-group">
								<input type="password" id="matcha_api_key" name="<?php echo esc_attr( self::OPTION_NAME ); ?>[api_key]" value="<?php echo esc_attr( $settings['api_key'] ?? '' ); ?>" class="regular-text" placeholder="sk-proj-..." autocomplete="off" />
								<button type="button" id="matcha-toggle-key-visibility" class="button" title="<?php esc_attr_e( 'Show / Hide Key', 'matcha-gallery' ); ?>">👁</button>
								<button type="button" id="matcha-test-api-btn" class="button button-secondary">
									<span class="dashicons dashicons-update" style="vertical-align:middle; font-size:16px;"></span>
									<?php esc_html_e( 'Test Connection', 'matcha-gallery' ); ?>
								</button>
							</div>
							<div id="matcha-api-test-result" class="matcha-test-result" style="display:none;"></div>
							<p class="description">
								<?php esc_html_e( 'Get an API key from the OpenAI Platform or any compatible Vision API provider.', 'matcha-gallery' ); ?>
							</p>
						</div>

						<div class="matcha-field-row">
							<label><strong><?php esc_html_e( 'Select AI Provider Preset', 'matcha-gallery' ); ?></strong></label>
							<div class="matcha-quick-presets" style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 14px;">
								<button type="button" class="button matcha-provider-preset-btn" data-model="gpt-4o-mini" data-endpoint="https://api.openai.com/v1/chat/completions">
									🟢 <strong>OpenAI</strong> (gpt-4o-mini)
								</button>
								<button type="button" class="button matcha-provider-preset-btn" data-model="gemini-1.5-flash" data-endpoint="https://generativelanguage.googleapis.com/v1beta/openai/chat/completions">
									🔵 <strong>Google Gemini</strong> (gemini-1.5-flash)
								</button>
								<button type="button" class="button matcha-provider-preset-btn" data-model="google/gemini-flash-1.5" data-endpoint="https://openrouter.ai/api/v1/chat/completions">
									🟣 <strong>OpenRouter</strong> (Multi-provider)
								</button>
							</div>
						</div>

						<div class="matcha-field-row">
							<label for="matcha_api_model"><strong><?php esc_html_e( 'Vision Model', 'matcha-gallery' ); ?></strong></label>
							<input type="text" id="matcha_api_model" name="<?php echo esc_attr( self::OPTION_NAME ); ?>[api_model]" value="<?php echo esc_attr( $settings['api_model'] ?? 'gemini-1.5-flash' ); ?>" class="regular-text" />
							<p class="description"><?php esc_html_e( 'e.g. gemini-1.5-flash, gemini-2.0-flash, gpt-4o-mini', 'matcha-gallery' ); ?></p>
						</div>

						<div class="matcha-field-row">
							<label for="matcha_api_endpoint"><strong><?php esc_html_e( 'API Endpoint URL', 'matcha-gallery' ); ?></strong></label>
							<input type="url" id="matcha_api_endpoint" name="<?php echo esc_attr( self::OPTION_NAME ); ?>[api_endpoint]" value="<?php echo esc_attr( $settings['api_endpoint'] ?? 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' ); ?>" class="large-text" />
							<p class="description"><?php esc_html_e( 'For Google Gemini: https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', 'matcha-gallery' ); ?></p>
						</div>
					</div>
				</div>

				<!-- Tab 2: Automation & Rules -->
				<div id="tab-automation" class="matcha-tab-content">
					<div class="matcha-card">
						<div class="matcha-card__header">
							<h3><?php esc_html_e( 'AI Generation Rules', 'matcha-gallery' ); ?></h3>
							<p><?php esc_html_e( 'Control when AI triggers and what metadata fields get generated.', 'matcha-gallery' ); ?></p>
						</div>

						<div class="matcha-field-row">
							<label class="matcha-switch-label">
								<input type="checkbox" name="<?php echo esc_attr( self::OPTION_NAME ); ?>[auto_generate]" value="1" <?php checked( ! empty( $settings['auto_generate'] ) ); ?> />
								<span class="matcha-switch-slider"></span>
								<span class="matcha-switch-text">
									<strong><?php esc_html_e( 'Auto-analyze on Image Upload', 'matcha-gallery' ); ?></strong>
									<span class="description"><?php esc_html_e( 'Automatically run AI analysis whenever a new image is uploaded to the Media Library.', 'matcha-gallery' ); ?></span>
								</span>
							</label>
						</div>

						<div class="matcha-field-row">
							<label class="matcha-switch-label">
								<input type="checkbox" name="<?php echo esc_attr( self::OPTION_NAME ); ?>[overwrite_existing]" value="1" <?php checked( ! empty( $settings['overwrite_existing'] ) ); ?> />
								<span class="matcha-switch-slider"></span>
								<span class="matcha-switch-text">
									<strong><?php esc_html_e( 'Overwrite Existing Metadata', 'matcha-gallery' ); ?></strong>
									<span class="description"><?php esc_html_e( 'If unchecked, AI will only populate empty fields and preserve existing alt text and titles.', 'matcha-gallery' ); ?></span>
								</span>
							</label>
						</div>

						<div class="matcha-field-row">
							<label><strong><?php esc_html_e( 'Metadata Fields to Generate', 'matcha-gallery' ); ?></strong></label>
							<div class="matcha-checkbox-grid">
								<label><input type="checkbox" name="<?php echo esc_attr( self::OPTION_NAME ); ?>[generate_alt]" value="1" <?php checked( $settings['generate_alt'] ?? true ); ?> /> <?php esc_html_e( 'Alt Text (SEO & Accessibility)', 'matcha-gallery' ); ?></label>
								<label><input type="checkbox" name="<?php echo esc_attr( self::OPTION_NAME ); ?>[generate_title]" value="1" <?php checked( $settings['generate_title'] ?? true ); ?> /> <?php esc_html_e( 'Human-readable Title', 'matcha-gallery' ); ?></label>
								<label><input type="checkbox" name="<?php echo esc_attr( self::OPTION_NAME ); ?>[generate_caption]" value="1" <?php checked( $settings['generate_caption'] ?? true ); ?> /> <?php esc_html_e( 'Caption & Description', 'matcha-gallery' ); ?></label>
								<label><input type="checkbox" name="<?php echo esc_attr( self::OPTION_NAME ); ?>[generate_tags]" value="1" <?php checked( $settings['generate_tags'] ?? true ); ?> /> <?php esc_html_e( 'AI Keywords & Filter Tags', 'matcha-gallery' ); ?></label>
							</div>
						</div>

						<div class="matcha-field-row">
							<label for="matcha_locale"><strong><?php esc_html_e( 'Target Language / Locale', 'matcha-gallery' ); ?></strong></label>
							<select id="matcha_locale" name="<?php echo esc_attr( self::OPTION_NAME ); ?>[locale]">
								<?php
								$locales = array(
									'en' => 'English',
									'es' => 'Español (Spanish)',
									'fr' => 'Français (French)',
									'de' => 'Deutsch (German)',
									'it' => 'Italiano (Italian)',
									'pt' => 'Português (Portuguese)',
									'nl' => 'Nederlands (Dutch)',
									'ja' => '日本語 (Japanese)',
									'ko' => '한국어 (Korean)',
									'zh' => '中文 (Chinese)',
									'ar' => 'العربية (Arabic)',
								);
								foreach ( $locales as $code => $name ) {
									printf( '<option value="%s" %s>%s</option>', esc_attr( $code ), selected( $settings['locale'] ?? 'en', $code, false ), esc_html( $name ) );
								}
								?>
							</select>
						</div>
					</div>
				</div>

				<!-- Tab 3: Interactive Shortcode Builder -->
				<div id="tab-shortcode" class="matcha-tab-content">
					<div class="matcha-card">
						<div class="matcha-card__header">
							<h3><?php esc_html_e( 'Smart Shortcode Generator', 'matcha-gallery' ); ?></h3>
							<p><?php esc_html_e( 'Build your gallery shortcode visually to use in Elementor, Divi, Classic Editor, or theme templates.', 'matcha-gallery' ); ?></p>
						</div>

						<div class="matcha-builder-controls">
							<div class="matcha-builder-row">
								<div>
									<label><strong><?php esc_html_e( 'Filter by AI Keyword Tag', 'matcha-gallery' ); ?></strong></label>
									<select id="sc-tag" class="widefat">
										<option value=""><?php esc_html_e( 'All Images (No Tag Filter)', 'matcha-gallery' ); ?></option>
										<?php foreach ( $keywords as $term ) : ?>
											<option value="<?php echo esc_attr( $term->slug ); ?>"><?php echo esc_html( $term->name . ' (' . $term->count . ')' ); ?></option>
										<?php endforeach; ?>
									</select>
								</div>
								<div>
									<label><strong><?php esc_html_e( 'Layout Type', 'matcha-gallery' ); ?></strong></label>
									<select id="sc-layout" class="widefat">
										<option value="grid"><?php esc_html_e( 'Grid', 'matcha-gallery' ); ?></option>
										<option value="masonry"><?php esc_html_e( 'Masonry', 'matcha-gallery' ); ?></option>
									</select>
								</div>
								<div>
									<label><strong><?php esc_html_e( 'Columns (Desktop)', 'matcha-gallery' ); ?></strong></label>
									<select id="sc-columns" class="widefat">
										<option value="2">2 Columns</option>
										<option value="3" selected>3 Columns</option>
										<option value="4">4 Columns</option>
										<option value="5">5 Columns</option>
									</select>
								</div>
							</div>

							<div class="matcha-builder-row" style="margin-top:12px;">
								<label><input type="checkbox" id="sc-filters" checked /> <?php esc_html_e( 'Enable Tag Filter Bar', 'matcha-gallery' ); ?></label>
								<label><input type="checkbox" id="sc-lightbox" checked /> <?php esc_html_e( 'Enable Lightbox Popup', 'matcha-gallery' ); ?></label>
							</div>

							<!-- Live Shortcode Result Box -->
							<div class="matcha-generated-shortcode-box">
								<div class="matcha-sc-label"><?php esc_html_e( 'Generated Shortcode:', 'matcha-gallery' ); ?></div>
								<div class="matcha-sc-code-wrap">
									<code id="matcha-live-shortcode">[matcha_gallery layout="grid" columns="3" filters="true" lightbox="true"]</code>
									<button type="button" class="button button-primary matcha-copy-sc-btn"><?php esc_html_e( 'Copy Shortcode', 'matcha-gallery' ); ?></button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Tab 4: AI Keywords Cloud -->
				<div id="tab-keywords" class="matcha-tab-content">
					<div class="matcha-card">
						<div class="matcha-card__header">
							<h3><?php esc_html_e( 'Generated AI Keywords Cloud', 'matcha-gallery' ); ?></h3>
							<p><?php esc_html_e( 'These are the active AI keywords assigned to your media library images.', 'matcha-gallery' ); ?></p>
						</div>

						<?php if ( empty( $keywords ) ) : ?>
							<p class="description"><?php esc_html_e( 'No AI keywords generated yet. Upload an image or use the Media Library bulk action to get started.', 'matcha-gallery' ); ?></p>
						<?php else : ?>
							<div class="matcha-tag-cloud">
								<?php foreach ( $keywords as $kw ) : ?>
									<span class="matcha-tag-pill">
										<?php echo esc_html( $kw->name ); ?>
										<span class="matcha-tag-count"><?php echo (int) $kw->count; ?></span>
									</span>
								<?php endforeach; ?>
							</div>
						<?php endif; ?>
					</div>
				</div>

				<!-- Tab 5: Pro Features -->
				<div id="tab-pro" class="matcha-tab-content">
					<?php Settings_Page::render_pro_section(); ?>
				</div>

				<!-- Save Button -->
				<div class="matcha-submit-bar">
					<?php submit_button( __( 'Save Changes', 'matcha-gallery' ), 'primary button-hero', 'submit', false ); ?>
				</div>
			</form>
		</div>
		<?php
	}

	/**
	 * AJAX endpoint for testing the AI API connection.
	 */
	public static function ajax_test_api_connection(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied.', 'matcha-gallery' ) ), 403 );
		}
		check_ajax_referer( 'matcha_ai_generate', 'nonce' );

		$api_key  = isset( $_POST['api_key'] ) ? sanitize_text_field( wp_unslash( $_POST['api_key'] ) ) : Plugin::get_setting( 'api_key', '' );
		$model    = isset( $_POST['api_model'] ) ? sanitize_text_field( wp_unslash( $_POST['api_model'] ) ) : Plugin::get_setting( 'api_model', 'gemini-1.5-flash' );
		$endpoint = isset( $_POST['api_endpoint'] ) ? esc_url_raw( wp_unslash( $_POST['api_endpoint'] ) ) : Plugin::get_setting( 'api_endpoint', 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' );
		// SSRF check
		if ( class_exists( '\\Matcha_AI_Smart_Gallery\\AI\\AI_REST' ) ) {
			$check = \Matcha_AI_Smart_Gallery\AI\AI_REST::validate_endpoint_url( $endpoint );
			if ( is_wp_error( $check ) ) {
				wp_send_json_error( array( 'message' => $check->get_error_message() ), 400 );
			}
		}

		if ( empty( $api_key ) ) {
			wp_send_json_error( array( 'message' => __( 'Please enter an API key first.', 'matcha-gallery' ) ), 400 );
		}

		$start_time = microtime( true );
		$is_gemini  = str_starts_with( $api_key, 'AIza' ) || str_contains( $endpoint, 'googleapis.com' ) || str_contains( strtolower( $model ), 'gemini' );

		if ( $is_gemini ) {
			$clean_model = trim( str_replace( 'models/', '', $model ) );
			$post_url    = sprintf(
				'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s',
				rawurlencode( $clean_model ?: 'gemini-1.5-flash' ),
				rawurlencode( $api_key )
			);
			$response = wp_remote_post(
				$post_url,
				array(
					'timeout' => 15,
					'headers' => array( 'Content-Type' => 'application/json' ),
					'body'    => wp_json_encode(
						array(
							'contents' => array(
								array(
									'parts' => array(
										array( 'text' => 'Respond with the word pong' ),
									),
								),
							),
						)
					),
				)
			);
		} else {
			$response = wp_remote_post(
				$endpoint,
				array(
					'timeout' => 15,
					'headers' => array(
						'Content-Type'  => 'application/json',
						'Authorization' => 'Bearer ' . $api_key,
					),
					'body'    => wp_json_encode(
						array(
							'model'      => $model,
							'max_tokens' => 50,
							'messages'   => array(
								array(
									'role'    => 'user',
									'content' => 'Respond with the word "pong".',
								),
							),
						)
					),
				)
			);
		}

		$latency_ms = round( ( microtime( true ) - $start_time ) * 1000 );

		if ( is_wp_error( $response ) ) {
			wp_send_json_error(
				array(
					'message' => sprintf(
						/* translators: %s: Error message */
						__( 'Connection failed: %s', 'matcha-gallery' ),
						$response->get_error_message()
					),
				),
				500
			);
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		$body        = wp_remote_retrieve_body( $response );

		if ( 200 === $status_code ) {
			wp_send_json_success(
				array(
					'message' => sprintf(
						/* translators: 1: Latency in ms, 2: Model name */
						__( 'Connection successful! Responded in %1$dms using %2$s.', 'matcha-gallery' ),
						$latency_ms,
						$model
					),
				)
			);
		} else {
			if ( $is_gemini && 404 === $status_code ) {
				// Query list of models actually enabled on this specific key
				$list_url = sprintf( 'https://generativelanguage.googleapis.com/v1beta/models?key=%s', rawurlencode( $api_key ) );
				$list_res = wp_remote_get( $list_url, array( 'timeout' => 10 ) );
				if ( ! is_wp_error( $list_res ) && 200 === wp_remote_retrieve_response_code( $list_res ) ) {
					$list_data = json_decode( wp_remote_retrieve_body( $list_res ), true );
					$avail     = array();
					if ( ! empty( $list_data['models'] ) ) {
						foreach ( $list_data['models'] as $m ) {
							if ( ! empty( $m['supportedGenerationMethods'] ) && in_array( 'generateContent', $m['supportedGenerationMethods'], true ) ) {
								$name = str_replace( 'models/', '', $m['name'] );
								if ( str_contains( $name, 'gemini' ) && ! str_contains( $name, 'embedding' ) ) {
									$avail[] = $name;
								}
							}
						}
					}
					if ( ! empty( $avail ) ) {
						// Pick best (prioritize flash)
						$best = $avail[0];
						foreach ( $avail as $cand ) {
							if ( str_contains( $cand, 'flash' ) ) {
								$best = $cand;
								break;
							}
						}
						wp_send_json_error(
							array(
								'message'         => sprintf(
									/* translators: 1: Current model name, 2: Comma-separated list of available models, 3: Recommended model name */
									__( 'Model "%1$s" is not found on your key. Available on your key: %2$s. Recommended: "%3$s"', 'matcha-gallery' ),
									esc_html( $clean_model ),
									esc_html( implode( ', ', array_slice( $avail, 0, 5 ) ) ),
									esc_html( $best )
								),
								'suggested_model' => $best,
							),
							404
						);
					}
				}
			}

			$data = json_decode( $body, true );
			$err  = '';
			if ( is_array( $data ) && ! empty( $data['error'] ) ) {
				$err = is_array( $data['error'] ) ? ( $data['error']['message'] ?? ( $data['error']['status'] ?? wp_json_encode( $data['error'] ) ) ) : (string) $data['error'];
			}
			if ( empty( $err ) ) {
				$err = ! empty( $body ) ? wp_strip_all_tags( mb_substr( $body, 0, 300 ) ) : __( 'Unknown API error', 'matcha-gallery' );
			}
			wp_send_json_error(
				array(
					'message' => sprintf(
						/* translators: 1: Status code, 2: Error message */
						__( 'API Error (HTTP %1$d): %2$s', 'matcha-gallery' ),
						$status_code,
						$err
					),
				),
				$status_code
			);
		}
	}

	/**
	 * Get stats for dashboard counters.
	 *
	 * @return array<string, int|float>
	 */
	private static function get_stats(): array {
		global $wpdb;

		$cached = wp_cache_get( 'matcha_dashboard_stats', 'matcha_gallery' );
		if ( false !== $cached && is_array( $cached ) ) {
			return $cached;
		}

		// Total images.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$total_images = (int) $wpdb->get_var(
			"SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'attachment' AND post_mime_type LIKE 'image/%'"
		);

		// AI tagged images.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$ai_tagged = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(DISTINCT post_id) FROM {$wpdb->postmeta} WHERE meta_key = %s",
				'_matcha_ai_generated'
			)
		);

		// Total keywords.
		$total_keywords = (int) wp_count_terms(
			array(
				'taxonomy'   => AI_Keywords_Taxonomy::TAXONOMY,
				'hide_empty' => false,
			)
		);

		$coverage = $total_images > 0 ? round( ( $ai_tagged / $total_images ) * 100, 1 ) : 0;

		$stats = array(
			'total_images'     => $total_images,
			'ai_tagged_images' => $ai_tagged,
			'total_keywords'   => $total_keywords,
			'coverage_percent' => $coverage,
		);

		wp_cache_set( 'matcha_dashboard_stats', $stats, 'matcha_gallery', 300 );

		return $stats;
	}

	/**
	 * Render Pro section.
	 */
	public static function render_pro_section(): void {
		if ( Pro_Features::is_active() ) {
			echo '<div class="matcha-pro-cta"><p>' . esc_html__( 'Pro features are active. Thank you for your support!', 'matcha-gallery' ) . '</p></div>';
			return;
		}
		?>
		<div class="matcha-pro-card">
			<div class="matcha-pro-card__badge"><?php esc_html_e( 'PRO UPGRADE', 'matcha-gallery' ); ?></div>
			<h2><?php esc_html_e( 'Supercharge Matcha AI with Pro', 'matcha-gallery' ); ?></h2>
			<p class="matcha-pro-desc"><?php esc_html_e( 'Unlock advanced layouts, background batch queues, multi-category filters, and WooCommerce support.', 'matcha-gallery' ); ?></p>
			
			<div class="matcha-pro-features-grid">
				<div class="matcha-pro-feat">✦ <?php esc_html_e( 'Carousel Slider & 3D Tilt Showcase', 'matcha-gallery' ); ?></div>
				<div class="matcha-pro-feat">✦ <?php esc_html_e( 'Background Queue (Action Scheduler) for 1000+ Images', 'matcha-gallery' ); ?></div>
				<div class="matcha-pro-feat">✦ <?php esc_html_e( 'Multi-select Faceted Filters & Deep-Linking', 'matcha-gallery' ); ?></div>
				<div class="matcha-pro-feat">✦ <?php esc_html_e( 'Claude 3.5 Sonnet & Google Gemini Pro Support', 'matcha-gallery' ); ?></div>
				<div class="matcha-pro-feat">✦ <?php esc_html_e( 'WooCommerce Products & Custom Post Type Grids', 'matcha-gallery' ); ?></div>
				<div class="matcha-pro-feat">✦ <?php esc_html_e( 'Social Sharing & High-Res Lightbox Zoom', 'matcha-gallery' ); ?></div>
			</div>

			<a href="https://wpmatcha.com/pro" class="button button-primary button-hero matcha-pro-upgrade-btn" target="_blank" rel="noopener">
				<?php esc_html_e( 'Upgrade to Pro →', 'matcha-gallery' ); ?>
			</a>
		</div>
		<?php
	}

	/**
	 * Inline JS for tabs, shortcode generator, and connection testing.
	 *
	 * @return string
	 */
	private static function get_settings_inline_script(): string {
		return <<<'JS'
(function($) {
	$(document).ready(function() {
		// Tabs
		$('.matcha-tab-btn').on('click', function() {
			var tab = $(this).data('tab');
			$('.matcha-tab-btn').removeClass('is-active');
			$(this).addClass('is-active');
			$('.matcha-tab-content').removeClass('is-active');
			$('#' + tab).addClass('is-active');
		});

		// Toggle API Key visibility
		$('#matcha-toggle-key-visibility').on('click', function() {
			var $input = $('#matcha_api_key');
			var type = $input.attr('type') === 'password' ? 'text' : 'password';
			$input.attr('type', type);
			$(this).text(type === 'password' ? '👁' : '🔒');
		});

		// Quick Provider Presets
		$('.matcha-provider-preset-btn').on('click', function(e) {
			e.preventDefault();
			var model = $(this).data('model');
			var endpoint = $(this).data('endpoint');
			$('#matcha_api_model').val(model);
			$('#matcha_api_endpoint').val(endpoint);
			$('.matcha-provider-preset-btn').removeClass('button-primary');
			$(this).addClass('button-primary');
		});

		// Test API Connection
		$('#matcha-test-api-btn').on('click', function(e) {
			e.preventDefault();
			var $btn = $(this);
			var $result = $('#matcha-api-test-result');
			var apiKey = $('#matcha_api_key').val();
			var model = $('#matcha_api_model').val();
			var endpoint = $('#matcha_api_endpoint').val();

			$btn.prop('disabled', true);
			$result.show().removeClass('is-success is-error').html('<span class="matcha-spinner"></span> Connecting to AI Provider…');

			$.post(ajaxurl, {
				action: 'matcha_test_api_connection',
				nonce: $('#matcha_api_test_nonce').val() || '',
				api_key: apiKey,
				api_model: model,
				api_endpoint: endpoint
			})
			.done(function(res) {
				if (res.success) {
					$result.addClass('is-success').html('✓ ' + res.data.message);
				} else {
					$result.addClass('is-error').html('✗ ' + (res.data.message || 'Unknown error'));
				}
			})
			.fail(function(xhr) {
				var msg = 'Connection failed.';
				var suggested = '';
				try {
					var j = JSON.parse(xhr.responseText);
					msg = j.data.message || msg;
					suggested = j.data.suggested_model || '';
				} catch(e) {}
				var html = '✗ ' + msg;
				if (suggested) {
					html += '<br><button type="button" class="button button-small button-primary" id="matcha-apply-suggested" style="margin-top:8px;">Switch Model to "' + suggested + '" & Retest</button>';
				}
				$result.addClass('is-error').html(html);
				$('#matcha-apply-suggested').on('click', function() {
					$('#matcha_api_model').val(suggested);
					$('#matcha-test-api-btn').trigger('click');
				});
			})
			.always(function() {
				$btn.prop('disabled', false);
			});
		});

		// Live Shortcode Builder
		function updateShortcode() {
			var tag = $('#sc-tag').val();
			var layout = $('#sc-layout').val();
			var columns = $('#sc-columns').val();
			var filters = $('#sc-filters').is(':checked');
			var lightbox = $('#sc-lightbox').is(':checked');

			var sc = '[matcha_gallery';
			if (tag) sc += ' tag="' + tag + '"';
			if (layout !== 'grid') sc += ' layout="' + layout + '"';
			if (columns !== '3') sc += ' columns="' + columns + '"';
			if (!filters) sc += ' filters="false"';
			if (!lightbox) sc += ' lightbox="false"';
			sc += ']';

			$('#matcha-live-shortcode').text(sc);
		}

		$('#sc-tag, #sc-layout, #sc-columns, #sc-filters, #sc-lightbox').on('change input', updateShortcode);

		// Copy Shortcode
		$('.matcha-copy-sc-btn').on('click', function() {
			var text = $('#matcha-live-shortcode').text();
			navigator.clipboard.writeText(text).then(function() {
				var $btn = $('.matcha-copy-sc-btn');
				var orig = $btn.text();
				$btn.text('✓ Copied!');
				setTimeout(function() { $btn.text(orig); }, 2000);
			});
		});
	});
})(jQuery);
JS;
	}
}
