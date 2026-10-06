<?php
/**
 * WordPress AI Connectors Bridge.
 *
 * Provides native compatibility with WordPress 7.0+ Connectors API (Settings > Connectors),
 * WP_AI_Client registry, environment credentials, and fallback to direct Matcha API settings.
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

		if ( function_exists( 'wp_get_connectors' ) || function_exists( 'wp_supports_ai' ) ) {
			return true;
		}

		if ( class_exists( '\\WordPress\\AiClient\\AiClient' ) || function_exists( 'wp_ai_client_prompt' ) ) {
			return true;
		}

		if ( file_exists( ABSPATH . 'wp-admin/options-connectors.php' ) || file_exists( ABSPATH . 'wp-includes/connectors.php' ) ) {
			return true;
		}

		if ( ! empty( $wp_version ) && version_compare( $wp_version, '7.0', '>=' ) ) {
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
		$supported  = self::is_supported();
		$manage_url = admin_url( 'options-connectors.php' );

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

		// 2. Query WordPress 7.0 native Connectors API (wp_get_connectors()).
		if ( function_exists( 'wp_get_connectors' ) ) {
			$connectors  = wp_get_connectors();
			$ai_registry = class_exists( '\\WordPress\\AiClient\\AiClient' ) ? \WordPress\AiClient\AiClient::defaultRegistry() : null;

			foreach ( $connectors as $id => $data ) {
				if ( ! is_array( $data ) || ( isset( $data['type'] ) && 'ai_provider' !== $data['type'] ) ) {
					continue;
				}

				$auth          = $data['authentication'] ?? array();
				$sanitized_id  = str_replace( '-', '_', $id );
				$setting_name  = $auth['setting_name'] ?? ( 'connectors_ai_' . $sanitized_id . '_api_key' );
				$constant_name = $auth['constant_name'] ?? ( strtoupper( $sanitized_id ) . '_API_KEY' );
				$env_var_name  = $auth['env_var_name'] ?? $constant_name;

				$key    = '';
				$source = 'wp_connectors';

				if ( ! empty( $constant_name ) && defined( $constant_name ) && is_string( constant( $constant_name ) ) && '' !== constant( $constant_name ) ) {
					$key    = constant( $constant_name );
					$source = 'constant';
				} elseif ( ! empty( $env_var_name ) && false !== getenv( $env_var_name ) && '' !== getenv( $env_var_name ) ) {
					$key    = (string) getenv( $env_var_name );
					$source = 'env';
				} else {
					$stored = get_option( $setting_name, '' );
					if ( is_string( $stored ) && '' !== $stored ) {
						$key    = $stored;
						$source = 'wp_connectors';
					}
				}

				$is_configured = false;
				if ( ! empty( $key ) ) {
					$is_configured = true;
				} elseif ( $ai_registry && $ai_registry->hasProvider( $id ) ) {
					try {
						$is_configured = $ai_registry->isProviderConfigured( $id );
					} catch ( \Throwable $e ) {
						$is_configured = false;
					}
				}

				if ( $is_configured ) {
					$is_gemini = ( 'google' === $id || str_contains( strtolower( (string) $id ), 'gemini' ) || str_starts_with( $key, 'AIza' ) );
					$model     = $is_gemini ? 'gemini-1.5-flash' : ( 'openai' === $id ? 'gpt-4o-mini' : 'claude-3-5-sonnet' );
					$endpoint  = $is_gemini ? 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' : 'https://api.openai.com/v1/chat/completions';

					return array(
						'supported'      => true,
						'connected'      => true,
						'provider'       => $is_gemini ? 'gemini' : sanitize_key( (string) $id ),
						'provider_name'  => $data['name'] ?? ( $is_gemini ? 'Google Gemini' : ucwords( str_replace( '_', ' ', (string) $id ) ) ),
						'model'          => $model,
						'endpoint'       => $endpoint,
						'api_key'        => $key,
						'source'         => $source,
						'connectors_url' => $manage_url,
					);
				}
			}
		}

		// 3. Direct checks for standard WordPress 7.0 database options: connectors_ai_{provider}_api_key
		$known_providers = array(
			'google'    => array(
				'setting'  => 'connectors_ai_google_api_key',
				'name'     => 'Google (Gemini)',
				'provider' => 'gemini',
				'model'    => 'gemini-1.5-flash',
				'endpoint' => 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
			),
			'openai'    => array(
				'setting'  => 'connectors_ai_openai_api_key',
				'name'     => 'OpenAI',
				'provider' => 'openai',
				'model'    => 'gpt-4o-mini',
				'endpoint' => 'https://api.openai.com/v1/chat/completions',
			),
			'anthropic' => array(
				'setting'  => 'connectors_ai_anthropic_api_key',
				'name'     => 'Anthropic (Claude)',
				'provider' => 'anthropic',
				'model'    => 'claude-3-5-sonnet',
				'endpoint' => 'https://api.anthropic.com/v1/messages',
			),
		);

		foreach ( $known_providers as $prov_id => $pdata ) {
			$opt_key = get_option( $pdata['setting'], '' );
			if ( is_string( $opt_key ) && '' !== $opt_key ) {
				return array(
					'supported'      => true,
					'connected'      => true,
					'provider'       => $pdata['provider'],
					'provider_name'  => $pdata['name'],
					'model'          => $pdata['model'],
					'endpoint'       => $pdata['endpoint'],
					'api_key'        => $opt_key,
					'source'         => 'wp_connectors',
					'connectors_url' => $manage_url,
				);
			}
		}

		// 4. Check wp-config / environment constants (enterprise & high-security WordPress setups).
		if ( defined( 'GOOGLE_API_KEY' ) && ! empty( constant( 'GOOGLE_API_KEY' ) ) ) {
			return array(
				'supported'      => true,
				'connected'      => true,
				'provider'       => 'gemini',
				'provider_name'  => 'Google Gemini (wp-config / Environment)',
				'model'          => 'gemini-1.5-flash',
				'endpoint'       => 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
				'api_key'        => constant( 'GOOGLE_API_KEY' ),
				'source'         => 'wp_config',
				'connectors_url' => $manage_url,
			);
		}

		if ( defined( 'OPENAI_API_KEY' ) && ! empty( constant( 'OPENAI_API_KEY' ) ) ) {
			return array(
				'supported'      => true,
				'connected'      => true,
				'provider'       => 'openai',
				'provider_name'  => 'OpenAI (wp-config / Environment)',
				'model'          => 'gpt-4o-mini',
				'endpoint'       => 'https://api.openai.com/v1/chat/completions',
				'api_key'        => constant( 'OPENAI_API_KEY' ),
				'source'         => 'wp_config',
				'connectors_url' => $manage_url,
			);
		}

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
