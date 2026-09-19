<?php
/**
 * Elementor Integration Bootstrap.
 *
 * Hooks into Elementor lifecycle to register dedicated Matcha Gallery widgets.
 *
 * @package Matcha_AI_Smart_Gallery\Integrations\Elementor
 */

namespace Matcha_AI_Smart_Gallery\Integrations\Elementor;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Initializes Elementor widgets and category registration.
 */
final class Elementor_Integration {

	/**
	 * Hook into Elementor if present.
	 */
	public static function init(): void {
		add_action( 'elementor/elements/categories_registered', array( static::class, 'register_category' ) );
		add_action( 'elementor/widgets/register', array( static::class, 'register_widgets' ) );
		// Backward compatibility hook for Elementor < 3.5
		add_action( 'elementor/widgets/widgets_registered', array( static::class, 'register_widgets' ) );

		// Ensure frontend assets are enqueued in Elementor preview mode
		add_action( 'elementor/frontend/after_enqueue_styles', array( static::class, 'enqueue_editor_assets' ) );
		add_action( 'elementor/frontend/after_register_scripts', array( static::class, 'enqueue_editor_assets' ) );
	}

	/**
	 * Enqueue gallery scripts and styles when inside Elementor preview.
	 */
	public static function enqueue_editor_assets(): void {
		\Matcha_AI_Smart_Gallery\Blocks\Smart_Gallery_Block::enqueue_frontend_assets();
	}

	/**
	 * Register 'Matcha Gallery' widget category in Elementor panel.
	 *
	 * @param \Elementor\Elements_Manager $elements_manager Elementor elements manager.
	 */
	public static function register_category( $elements_manager ): void {
		$elements_manager->add_category(
			'matcha-gallery',
			array(
				'title' => __( 'Matcha Gallery', 'matcha-gallery' ),
				'icon'  => 'eicon-gallery-grid',
			)
		);
	}

	/**
	 * Register the Matcha Gallery Elementor widget.
	 *
	 * @param \Elementor\Widgets_Manager $widgets_manager Elementor widgets manager.
	 */
	public static function register_widgets( $widgets_manager ): void {
		static $registered = false;
		if ( $registered ) {
			return;
		}
		$registered = true;

		require_once __DIR__ . '/Widgets/Matcha_Gallery_Widget.php';
		$widget = new Widgets\Matcha_Gallery_Widget();

		if ( method_exists( $widgets_manager, 'register' ) ) {
			$widgets_manager->register( $widget );
		} elseif ( method_exists( $widgets_manager, 'register_widget_type' ) ) {
			$widgets_manager->register_widget_type( $widget );
		}
	}
}
