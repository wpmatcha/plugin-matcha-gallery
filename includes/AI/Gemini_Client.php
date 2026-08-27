<?php
/**
 * Native Google Gemini Vision API client implementation.
 *
 * Communicates directly with Google AI Studio generateContent endpoint.
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
 * Sends images directly to Google Gemini's generateContent endpoint with JSON mode.
 */
class Gemini_Client implements Client_Interface {

	/**
	 * Gemini API key.
	 *
	 * @var string
	 */
	private string $api_key;

	/**
	 * Model identifier (e.g., gemini-1.5-flash).
	 *
	 * @var string
	 */
	private string $model;

	/**
	 * Constructor.
	 *
	 * @param string $api_key API key.
	 * @param string $model   Model identifier.
	 */
	public function __construct( string $api_key = '', string $model = '' ) {
		$this->api_key = $api_key ?: Plugin::get_setting( 'api_key', '' );
		$this->model   = $model ?: Plugin::get_setting( 'api_model', 'gemini-1.5-flash' );
		// Normalize model name (remove 'models/' prefix if user typed it)
		$this->model   = trim( str_replace( 'models/', '', $this->model ) );
	}

	/**
	 * Analyze image via Google Gemini API.
	 *
	 * @param string               $image_source Base64 data URI or raw base64.
	 * @param array<string, mixed> $options      Options array.
	 * @return array{alt_text: string, title: string, caption: string, keywords: list<string>}
	 * @throws \RuntimeException On error.
	 */
	public function analyze_image( string $image_source, array $options = array() ): array {
		if ( empty( $this->api_key ) ) {
			throw new \RuntimeException(
				esc_html__( 'Matcha AI: Gemini API key is missing. Please set it in AI Settings.', 'matcha-gallery' )
			);
		}

		$locale = $options['locale'] ?? 'en';
		$fields = $options['fields'] ?? array( 'alt_text', 'title', 'caption', 'keywords' );

		// Extract raw base64 data and mime type
		$mime_type = 'image/jpeg';
		$raw_b64   = $image_source;
		if ( preg_match( '/^data:([^;]+);base64,(.+)$/', $image_source, $matches ) ) {
			$mime_type = $matches[1];
			$raw_b64   = $matches[2];
		}

		$system_prompt = $this->build_system_prompt( $locale, $fields );
		$endpoint      = sprintf(
			'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s',
			rawurlencode( $this->model ),
			rawurlencode( $this->api_key )
		);

		$body = array(
			'systemInstruction' => array(
				'parts' => array(
					array( 'text' => $system_prompt ),
				),
			),
			'contents'          => array(
				array(
					'parts' => array(
						array(
							'inline_data' => array(
								'mime_type' => $mime_type,
								'data'      => $raw_b64,
							),
						),
						array(
							'text' => 'Analyze this image and return the requested metadata as JSON.',
						),
					),
				),
			),
			'generationConfig'  => array(
				'responseMimeType' => 'application/json',
				'temperature'      => 0.2,
				'maxOutputTokens'  => 1000,
			),
		);

		$response = wp_remote_post(
			$endpoint,
			array(
				'timeout' => 60,
				'headers' => array(
					'Content-Type' => 'application/json',
				),
				'body'    => wp_json_encode( $body ),
			)
		);

		if ( is_wp_error( $response ) ) {
			throw new \RuntimeException(
				sprintf(
					/* translators: %s: Error message */
					esc_html__( 'Matcha AI: Gemini request failed — %s', 'matcha-gallery' ),
					esc_html( $response->get_error_message() )
				)
			);
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		$raw_body    = wp_remote_retrieve_body( $response );

		if ( $status_code < 200 || $status_code >= 300 ) {
			$data = json_decode( $raw_body, true );
			$msg  = $data['error']['message'] ?? $raw_body;
			throw new \RuntimeException(
				sprintf(
					/* translators: 1: Code, 2: Message */
					esc_html__( 'Matcha AI: Gemini API error (HTTP %1$d) — %2$s', 'matcha-gallery' ),
					absint( $status_code ),
					esc_html( mb_substr( $msg, 0, 300 ) )
				)
			);
		}

		$data = json_decode( $raw_body, true );
		$text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

		if ( empty( $text ) ) {
			throw new \RuntimeException(
				esc_html__( 'Matcha AI: Gemini returned an empty response.', 'matcha-gallery' )
			);
		}

		$metadata = json_decode( trim( $text ), true );
		if ( ! is_array( $metadata ) ) {
			throw new \RuntimeException(
				sprintf(
					/* translators: %s: Raw response */
					esc_html__( 'Matcha AI: Could not parse Gemini JSON response — %s', 'matcha-gallery' ),
					esc_html( mb_substr( $text, 0, 200 ) )
				)
			);
		}

		$colors = array_filter( array_map( function ( $c ) {
			$c = sanitize_hex_color( (string) $c );
			return $c ?: null;
		}, (array) ( $metadata['colors'] ?? array() ) ) );

		$fx = isset( $metadata['focal_point']['x'] ) ? max( 0, min( 100, (int) $metadata['focal_point']['x'] ) ) : 50;
		$fy = isset( $metadata['focal_point']['y'] ) ? max( 0, min( 100, (int) $metadata['focal_point']['y'] ) ) : 50;

		return array(
			'alt_text'    => sanitize_text_field( $metadata['alt_text'] ?? '' ),
			'title'       => sanitize_text_field( $metadata['title'] ?? '' ),
			'caption'     => sanitize_textarea_field( $metadata['caption'] ?? '' ),
			'keywords'    => array_map(
				'sanitize_title',
				array_filter( (array) ( $metadata['keywords'] ?? array() ) )
			),
			'colors'      => array_values( $colors ),
			'focal_point' => array( 'x' => $fx, 'y' => $fy ),
		);
	}

	/**
	 * Build system prompt for Gemini.
	 *
	 * @param string       $locale Locale.
	 * @param list<string> $fields Fields.
	 * @return string
	 */
	private function build_system_prompt( string $locale, array $fields ): string {
		$field_descriptions = array(
			'alt_text'    => '"alt_text": A concise, descriptive alt text for accessibility (max 125 characters).',
			'title'       => '"title": A short, human-readable title for the image (max 60 characters).',
			'caption'     => '"caption": A one- or two-sentence descriptive caption.',
			'keywords'    => '"keywords": An array of 2-4 broad, high-level category keywords suitable for a gallery filter bar (e.g. ["technology", "architecture", "minimalist", "portraits"]), lowercase, strictly avoiding incidental background colors or minor objects.',
			'colors'      => '"colors": An array of 2-4 dominant aesthetic HEX color codes visible in image, e.g. ["#2e7d32", "#e8f5e9"].',
			'focal_point' => '"focal_point": { "x": 50, "y": 35 } coordinates in percentage (0-100) of the main subject/face.',
		);

		$requested = array();
		foreach ( array( 'alt_text', 'title', 'caption', 'keywords', 'colors', 'focal_point' ) as $field ) {
			if ( isset( $field_descriptions[ $field ] ) ) {
				$requested[] = $field_descriptions[ $field ];
			}
		}

		$locale_instruction = 'en' !== $locale
			? sprintf( 'Write all text in the "%s" locale/language.', $locale )
			: 'Write all text in English.';

		return implode(
			"\n",
			array(
				'You are an expert image metadata & aesthetic analysis engine for WordPress.',
				$locale_instruction,
				'Respond ONLY with a valid JSON object matching this schema exactly:',
				'{',
				implode( ",\n", $requested ),
				'}',
				'Be accurate and specific to what is actually visible in the image.',
			)
		);
	}
}
