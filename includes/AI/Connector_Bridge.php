<?php
/**
 * WordPress AI Connectors Bridge.
 *
 * Provides compatibility with WordPress 7.0+ Connectors API (Settings > Connectors),
 * environment credentials, and fallback to direct Matcha API settings.
 *
 * @package Matcha_AI_Smart_Gallery\AI
 */

namespace Matcha_AI_Smart_Gallery\AI;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Matcha_AI_Smart_Gallery\Plugin;

/**
 * Handles detection and resolution of WordPress AI Connectors credentials.
 */
class Connector_Bridge {

	/**
	 * Check if WordPress Connectors API or WP_AI_Client is supported in current environment.
	 *
	 * @return bool
	 */
	public static function is_supported(): bool {
		global $wp_version;

		if ( ! empty( $wp_version ) && version_compare( $wp_version, '7.0', '>=' ) ) {
			return true;
		}

		if ( file_exists( ABSPATH . 'wp-admin/options-connectors.php' ) ) {
			return true;
		}

		if ( class_exists( 'WP_AI_Client' ) || function_exists( 'wp_ai_client' ) ) {
			return true;
		}

		if ( defined( 'WP_AI_SUPPORT' ) && true === WP_AI_SUPPORT ) {
			return true;
		}

		return false;
	}

	/**
	 * Get active connector details from WordPress Core or environment constants.
	 *
	 * @return array{
	 *   supported: bool,
	 *   connected: bool,
	 *   provider: string,
	 *   provider_name: string,
	 *   model: string,
	 *   endpoint: string,
	 *   api_key: string,
	 *   source: string,
	 *   connectors_url: string,
	 * }
	 */
	public static function get_active_connector(): array {
		$supported   = self::is_supported();
		$manage_url  = admin_url( 'options-connectors.php' );

		$defaults = array(
			'supported'      => $supported,
			'connected'      => false,
			'provider'       => '',
			'provider_name'  => '',
			'model'          => '',
			'endpoint'       => '',
			'api_key'        => '',
			'source'         => 'none',
			'connectors_url' => $manage_url,
		);

		// 1. Check filter override first (allow custom extensions or third-party bridges).
		$filtered = apply_filters( 'matcha_gallery_ai_connector_credentials', null );
		if ( is_array( $filtered ) && ! empty( $filtered['api_key'] ) ) {
			return wp_parse_args(
				array(
					'supported'     => true,
					'connected'     => true,
					'source'        => 'filter',
					'provider_name' => $filtered['provider_name'] ?? __( 'Custom Filter Connector', 'matcha-gallery' ),
				),
				wp_parse_args( $filtered, $defaults )
			);
		}

		// 2. Check Core Options (WordPress 7.0 Connectors stores registered provider options).
		$core_connectors = get_option( 'wp_ai_connectors', null );
		if ( empty( $core_connectors ) || ! is_array( $core_connectors ) ) {
			$core_connectors = get_option( 'options_connectors', null );
		}
		if ( empty( $core_connectors ) || ! is_array( $core_connectors ) ) {
			$core_connectors = get_option( 'wp_ai_providers', null );
		}

		if ( is_array( $core_connectors ) && ! empty( $core_connectors ) ) {
			foreach ( $core_connectors as $prov_key => $data ) {
				if ( ! is_array( $data ) ) {
					continue;
				}
				$key = $data['api_key'] ?? ( $data['key'] ?? '' );
				if ( ! empty( $key ) ) {
					$model     = $data['model'] ?? ( $data['default_model'] ?? '' );
					$is_gemini = str_starts_with( $key, 'AIza' ) || str_contains( strtolower( (string) $prov_key ), 'gemini' ) || str_contains( strtolower( (string) $prov_key ), 'google' );
					return array(
						'supported'      => true,
						'connected'      => true,
						'provider'       => $is_gemini ? 'gemini' : sanitize_key( (string) $prov_key ),
						'provider_name'  => $is_gemini ? 'Google Gemini' : ucwords( str_replace( '_', ' ', (string) $prov_key ) ),
						'model'          => $model ?: ( $is_gemini ? 'gemini-1.5-flash' : 'gpt-4o-mini' ),
						'endpoint'       => $data['endpoint'] ?? ( $is_gemini ? 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' : 'https://api.openai.com/v1/chat/completions' ),
						'api_key'        => $key,
						'source'         => 'wp_connectors',
						'connectors_url' => $manage_url,
					);
				}
			}
		}

		// 3. Check wp-config / environment constants (enterprise & high-security WordPress setups).
		if ( defined( 'WP_AI_API_KEY' ) && ! empty( constant( 'WP_AI_API_KEY' ) ) ) {
			$key       = constant( 'WP_AI_API_KEY' );
			$is_gemini = str_starts_with( $key, 'AIza' );
			return array(
				'supported'      => true,
				'connected'      => true,
				'provider'       => $is_gemini ? 'gemini' : ( defined( 'WP_AI_PROVIDER' ) ? constant( 'WP_AI_PROVIDER' ) : 'openai' ),
				'provider_name'  => $is_gemini ? 'Google Gemini (wp-config)' : 'WordPress AI (wp-config)',
				'model'          => defined( 'WP_AI_MODEL' ) ? constant( 'WP_AI_MODEL' ) : ( $is_gemini ? 'gemini-1.5-flash' : 'gpt-4o-mini' ),
				'endpoint'       => defined( 'WP_AI_ENDPOINT' ) ? constant( 'WP_AI_ENDPOINT' ) : ( $is_gemini ? 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' : 'https://api.openai.com/v1/chat/completions' ),
				'api_key'        => $key,
				'source'         => 'wp_config',
				'connectors_url' => $manage_url,
			);
		}

		if ( defined( 'OPENAI_API_KEY' ) && ! empty( constant( 'OPENAI_API_KEY' ) ) ) {
			return array(
				'supported'      => true,
				'connected'      => true,
				'provider'       => 'openai',
				'provider_name'  => 'OpenAI (Environment / wp-config)',
				'model'          => 'gpt-4o-mini',
				'endpoint'       => 'https://api.openai.com/v1/chat/completions',
				'api_key'        => constant( 'OPENAI_API_KEY' ),
				'source'         => 'wp_config',
				'connectors_url' => $manage_url,
			);
		}

		if ( defined( 'GEMINI_API_KEY' ) && ! empty( constant( 'GEMINI_API_KEY' ) ) ) {
			return array(
				'supported'      => true,
				'connected'      => true,
				'provider'       => 'gemini',
				'provider_name'  => 'Google Gemini (Environment / wp-config)',
				'model'          => 'gemini-1.5-flash',
				'endpoint'       => 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
				'api_key'        => constant( 'GEMINI_API_KEY' ),
				'source'         => 'wp_config',
				'connectors_url' => $manage_url,
			);
		}

		return $defaults;
	}

	/**
	 * Check if any valid AI credentials exist (either direct setting or active connector).
	 *
	 * @return bool
	 */
	public static function has_credentials(): bool {
		$direct_key = Plugin::get_setting( 'api_key', '' );
		if ( ! empty( $direct_key ) ) {
			return true;
		}

		$connector = self::get_active_connector();
		return ! empty( $connector['connected'] ) && ! empty( $connector['api_key'] );
	}

	/**
	 * Resolve final credentials to use for an AI call.
	 *
	 * Prioritizes direct key if explicitly configured; otherwise seamlessly falls back
	 * to active WordPress Connectors / environment credentials.
	 *
	 * @return array{
	 *   api_key: string,
	 *   model: string,
	 *   endpoint: string,
	 *   provider: string,
	 *   source: 'direct'|'connector'|'none',
	 * }
	 */
	public static function get_resolved_credentials(): array {
		$direct_key = Plugin::get_setting( 'api_key', '' );

		if ( ! empty( $direct_key ) ) {
			$model     = Plugin::get_setting( 'api_model', 'gemini-1.5-flash' );
			$endpoint  = Plugin::get_setting( 'api_endpoint', 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' );
			$is_gemini = str_starts_with( $direct_key, 'AIza' ) || str_contains( $endpoint, 'googleapis.com' ) || str_contains( strtolower( $model ), 'gemini' );

			return array(
				'api_key'  => $direct_key,
				'model'    => $model,
				'endpoint' => $endpoint,
				'provider' => $is_gemini ? 'gemini' : 'openai',
				'source'   => 'direct',
			);
		}

		// Fallback to WordPress Connector / environment credentials.
		$connector = self::get_active_connector();
		if ( ! empty( $connector['connected'] ) && ! empty( $connector['api_key'] ) ) {
			$saved_model    = Plugin::get_setting( 'api_model', '' );
			$saved_endpoint = Plugin::get_setting( 'api_endpoint', '' );

			return array(
				'api_key'  => $connector['api_key'],
				'model'    => ! empty( $saved_model ) ? $saved_model : $connector['model'],
				'endpoint' => ! empty( $saved_endpoint ) ? $saved_endpoint : $connector['endpoint'],
				'provider' => $connector['provider'],
				'source'   => 'connector',
			);
		}

		return array(
			'api_key'  => '',
			'model'    => Plugin::get_setting( 'api_model', 'gemini-1.5-flash' ),
			'endpoint' => Plugin::get_setting( 'api_endpoint', 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' ),
			'provider' => 'none',
			'source'   => 'none',
		);
	}
}
