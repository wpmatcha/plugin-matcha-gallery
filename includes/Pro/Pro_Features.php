<?php
/**
 * Pro features stub.
 *
 * Provides extensibility hooks and placeholder checks for Pro functionality.
 *
 * @package Matcha_AI_Smart_Gallery\Pro
 */


namespace Matcha_AI_Smart_Gallery\Pro;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


/**
 * Pro features manager.
 *
 * All Pro feature checks route through this class.
 * The Pro add-on plugin will hook into the filters registered here.
 */
class Pro_Features {

	/**
	 * Bootstrap Pro feature hooks.
	 */
	public static function bootstrap(): void {
		// Register default (free) layouts.
		add_filter( 'matcha_gallery_layouts', array( static::class, 'register_free_layouts' ) );

		// Register default filter modes.
		add_filter( 'matcha_gallery_filter_modes', array( static::class, 'register_free_filter_modes' ) );
	}

	/**
	 * Check if Pro is active and licensed.
	 *
	 * @return bool
	 */
	public static function is_active(): bool {
		return (bool) apply_filters( 'matcha_gallery_is_pro', (bool) apply_filters( 'matcha_gallery_pro_active', false ) );
	}

	/**
	 * Check if Pro is active (alias for is_active).
	 *
	 * @return bool
	 */
	public static function is_pro(): bool {
		return self::is_active();
	}

	/**
	 * Check if a specific Pro feature is available.
	 *
	 * @param string $feature Feature identifier (e.g., 'justified_layout', 'multi_filter').
	 * @return bool
	 */
	public static function has_feature( string $feature ): bool {
		if ( ! self::is_active() ) {
			return false;
		}

		/**
		 * Filters whether a specific Pro feature is available.
		 *
		 * @param bool   $available Whether the feature is available.
		 * @param string $feature   Feature identifier.
		 */
		return (bool) apply_filters( 'matcha_gallery_pro_feature', false, $feature );
	}

	/**
	 * Register free layouts.
	 *
	 * @param array<string, string> $layouts Registered layouts.
	 * @return array<string, string>
	 */
	public static function register_free_layouts( array $layouts ): array {
		$layouts['grid']      = __( 'Grid', 'matcha-gallery' );
		$layouts['masonry']   = __( 'Masonry', 'matcha-gallery' );
		$layouts['justified'] = __( 'Justified', 'matcha-gallery' );
		$layouts['mosaic']    = __( 'Mosaic', 'matcha-gallery' );
		$layouts['pinwheel']  = __( 'Pinwheel', 'matcha-gallery' );
		$layouts['bento']     = __( 'Bento', 'matcha-gallery' );

		return $layouts;
	}

	/**
	 * Register free filter modes.
	 *
	 * @param array<string, string> $modes Registered filter modes.
	 * @return array<string, string>
	 */
	public static function register_free_filter_modes( array $modes ): array {
		$modes['single'] = __( 'Single select', 'matcha-gallery' );

		return $modes;
	}

	/**
	 * Get all registered layouts.
	 *
	 * @return array<string, string>
	 */
	public static function get_layouts(): array {
		/**
		 * Filters the available gallery layouts.
		 *
		 * Pro can add 'justified', 'slider', etc.
		 *
		 * @param array<string, string> $layouts Layout slug => label.
		 */
		return apply_filters( 'matcha_gallery_layouts', array() );
	}

	/**
	 * Get all registered filter modes.
	 *
	 * @return array<string, string>
	 */
	public static function get_filter_modes(): array {
		/**
		 * Filters the available filter modes.
		 *
		 * Pro can add 'multi', 'deep_link', etc.
		 *
		 * @param array<string, string> $modes Mode slug => label.
		 */
		return apply_filters( 'matcha_gallery_filter_modes', array() );
	}
}
