<?php
/**
 * Main plugin bootstrap class.
 *
 * @package Matcha_AI_Smart_Gallery
 */


namespace Matcha_AI_Smart_Gallery;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


use Matcha_AI_Smart_Gallery\Admin\Settings_Page;
use Matcha_AI_Smart_Gallery\Admin\Media_Actions;
use Matcha_AI_Smart_Gallery\Admin\Studio_Page;
use Matcha_AI_Smart_Gallery\Taxonomy\AI_Keywords_Taxonomy;
use Matcha_AI_Smart_Gallery\Blocks\Smart_Gallery_Block;
use Matcha_AI_Smart_Gallery\Gallery\Gallery_CPT;
use Matcha_AI_Smart_Gallery\Gallery\Gallery_REST;
use Matcha_AI_Smart_Gallery\AI\AI_REST;
use Matcha_AI_Smart_Gallery\Pro\Pro_Features;

/**
 * Plugin bootstrap.
 *
 * Wires hooks, initializes components, and enqueues shared assets.
 */
final class Plugin {

	/**
	 * Whether the plugin has been initialized.
	 *
	 * @var bool
	 */
	private static bool $initialized = false;

	/**
	 * Initialize the plugin (idempotent).
	 */
	public static function init(): void {
		if ( self::$initialized ) {
			return;
		}
		self::$initialized = true;

		// --- Always-loaded components ---
		AI_Keywords_Taxonomy::register();
		Gallery_CPT::register();
		Gallery_REST::register();
		AI_REST::register();
		Pro_Features::bootstrap();

		// --- Block & Shortcode registration (runs on both admin and frontend) ---
		Smart_Gallery_Block::register();
		\Matcha_AI_Smart_Gallery\Shortcode\Gallery_Shortcode::register();

		// --- Page Builder Integrations (Elementor, etc.) ---
		\Matcha_AI_Smart_Gallery\Integrations\Elementor\Elementor_Integration::init();

		// --- Admin-only components ---
		if ( is_admin() ) {
			// Studio hub must register before Settings_Page to own top-level menu
			Studio_Page::register();
			Settings_Page::register();
			Media_Actions::register();
		}
	}

	/**
	 * Get a plugin setting value.
	 *
	 * @param string $key     Setting key.
	 * @param mixed  $default Default value if setting not found.
	 * @return mixed
	 */
	public static function get_setting( string $key, mixed $default = null ): mixed {
		$settings = get_option( 'matcha_gallery_settings', array() );

		if ( ! is_array( $settings ) ) {
			return $default;
		}

		return $settings[ $key ] ?? $default;
	}

	/**
	 * Get all plugin settings.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_all_settings(): array {
		$settings = get_option( 'matcha_gallery_settings', array() );

		return is_array( $settings ) ? $settings : array();
	}

	/**
	 * Update a single plugin setting.
	 *
	 * @param string $key   Setting key.
	 * @param mixed  $value Setting value.
	 */
	public static function update_setting( string $key, mixed $value ): void {
		$settings         = self::get_all_settings();
		$settings[ $key ] = $value;
		update_option( 'matcha_gallery_settings', $settings );
	}
}
