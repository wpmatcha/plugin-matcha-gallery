<?php
/**
 * Plugin Name:       Matcha Gallery – AI Photo Wall, Masonry & Portfolio Studio
 * Description:       AI-powered image metadata generation, interactive mosaic photo walls, masonry layouts, picture framing, client proofing, and smart portfolios for WordPress.
 * Version:           1.0.0
 * Requires at least: 6.2
 * Requires PHP:      8.0
 * Author:            WP Matcha
 * Author URI:        https://wpmatcha.com
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       matcha-gallery
 * Domain Path:       /languages
 *
 * @package Matcha_Gallery
 */

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Plugin version constant.
 */
define( 'MATCHA_GALLERY_VERSION', '1.0.0' );

/**
 * Plugin directory path (with trailing slash).
 */
define( 'MATCHA_GALLERY_PATH', plugin_dir_path( __FILE__ ) );

/**
 * Plugin directory URL (with trailing slash).
 */
define( 'MATCHA_GALLERY_URL', plugin_dir_url( __FILE__ ) );

/**
 * Plugin base file.
 */
define( 'MATCHA_GALLERY_FILE', __FILE__ );

/**
 * Minimum PHP version.
 */
define( 'MATCHA_GALLERY_MIN_PHP', '8.0' );

/**
 * Check PHP version before anything else.
 */
if ( version_compare( PHP_VERSION, MATCHA_GALLERY_MIN_PHP, '<' ) ) {
	add_action(
		'admin_notices',
		static function () {
			printf(
				'<div class="notice notice-error"><p>%s</p></div>',
				sprintf(
					/* translators: 1: Required PHP version, 2: Current PHP version. */
					esc_html__( 'Matcha Gallery requires PHP %1$s or higher. You are running PHP %2$s. Please upgrade your PHP version.', 'matcha-gallery' ),
					esc_html( MATCHA_GALLERY_MIN_PHP ),
					esc_html( PHP_VERSION )
				)
			);
		}
	);
	return;
}

/**
 * PSR-4 style autoloader for the Matcha_AI_Smart_Gallery namespace.
 *
 * Maps Matcha_AI_Smart_Gallery\Foo\Bar to includes/Foo/Bar.php.
 */
spl_autoload_register(
	static function ( string $class ): void {
		$prefix    = 'Matcha_AI_Smart_Gallery\\';
		$base_dir  = MATCHA_GALLERY_PATH . 'includes/';

		$len = strlen( $prefix );
		if ( strncmp( $prefix, $class, $len ) !== 0 ) {
			return;
		}

		$relative_class = substr( $class, $len );
		$file           = $base_dir . str_replace( '\\', '/', $relative_class ) . '.php';

		if ( file_exists( $file ) ) {
			require_once $file;
		}
	}
);

/**
 * Initialize the plugin.
 */
add_action(
	'plugins_loaded',
	static function (): void {
		// Boot the plugin.
		\Matcha_AI_Smart_Gallery\Plugin::init();
	}
);

/**
 * Register activation hook.
 */
register_activation_hook(
	MATCHA_GALLERY_FILE,
	static function (): void {
		// Ensure CPT + taxonomy are registered so we can flush rules.
		\Matcha_AI_Smart_Gallery\Gallery\Gallery_CPT::register();
		\Matcha_AI_Smart_Gallery\Taxonomy\AI_Keywords_Taxonomy::register();
		\Matcha_AI_Smart_Gallery\Gallery\Gallery_CPT::register_post_type();
		\Matcha_AI_Smart_Gallery\Taxonomy\AI_Keywords_Taxonomy::register_taxonomy();
		flush_rewrite_rules();

		// Set default options if not yet present.
		if ( false === get_option( 'matcha_gallery_settings' ) ) {
			update_option(
				'matcha_gallery_settings',
				array(
					'api_key'            => '',
					'api_model'          => 'gemini-1.5-flash',
					'api_endpoint'       => 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
					'generate_alt'       => true,
					'generate_title'     => true,
					'generate_caption'   => true,
					'generate_tags'      => true,
					'locale'             => 'en',
					'auto_generate'      => false,
					'overwrite_existing' => false,
				)
			);
		}
	}
);

/**
 * Register deactivation hook.
 */
register_deactivation_hook(
	MATCHA_GALLERY_FILE,
	static function (): void {
		flush_rewrite_rules();
	}
);
