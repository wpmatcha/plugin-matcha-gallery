<?php
/**
 * OpenAI Vision API client implementation.
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
 * Sends images to an OpenAI-compatible Vision endpoint and parses structured metadata.
 */
class OpenAI_Client implements Client_Interface {

	/**
	 * API key.
	 *
	 * @var string
	 */
	private string $api_key;

	/**
	 * Model identifier (e.g., gpt-4o-mini).
	 *
	 * @var string
	 */
	private string $model;

	/**
	 * API endpoint URL.
	 *
	 * @var string
	 */
	private string $endpoint;

	/**
	 * Constructor.
	 *
	 * @param string $api_key  API key for authentication.
	 * @param string $model    Model name.
	 * @param string $endpoint API endpoint URL.
	 */
	public function __construct( string $api_key = '', string $model = '', string $endpoint = '' ) {
		$this->api_key  = $api_key ?: Plugin::get_setting( 'api_key', '' );
		$this->model    = $model ?: Plugin::get_setting( 'api_model', 'gpt-4o-mini' );
		$this->endpoint = $endpoint ?: Plugin::get_setting( 'api_endpoint', 'https://api.openai.com/v1/chat/completions' );
	}

	/**
	 * Analyze an image via the OpenAI Vision API.
	 *
	 * @param string               $image_source Base64 data or URL.
	 * @param array<string, mixed> $options      Analysis options.
	 * @return array{alt_text: string, title: string, caption: string, keywords: list<string>}
	 * @throws \RuntimeException On API failure.
	 */
	public function analyze_image( string $image_source, array $options = array() ): array {
		if ( empty( $this->api_key ) ) {
			throw new \RuntimeException(
				esc_html__( 'Matcha AI: API key is not configured. Please set it in Settings → Matcha AI Gallery.', 'matcha-gallery' )
			);
		}

		$locale = $options['locale'] ?? 'en';
		$fields = $options['fields'] ?? array( 'alt_text', 'title', 'caption', 'keywords' );

		$system_prompt = $this->build_system_prompt( $locale, $fields );
		$image_content = $this->build_image_content( $image_source );

		$body = array(
			'model'       => $this->model,
			'max_tokens'  => 1000,
			'temperature' => 0.3,
			'messages'    => array(
				array(
					'role'    => 'system',
					'content' => $system_prompt,
				),
				array(
					'role'    => 'user',
					'content' => array(
						$image_content,
						array(
							'type' => 'text',
							'text' => 'Analyze this image and return the requested metadata as JSON.',
						),
					),
				),
			),
		);

		$headers = array(
			'Content-Type'  => 'application/json',
			'Authorization' => 'Bearer ' . $this->api_key,
		);
		$post_url = $this->endpoint;
		if ( str_contains( $this->endpoint, 'googleapis.com' ) ) {
			$headers['x-goog-api-key'] = $this->api_key;
			if ( ! str_contains( $this->endpoint, 'key=' ) ) {
				$post_url = add_query_arg( 'key', $this->api_key, $this->endpoint );
			}
		}

		$response = wp_remote_post(
			$post_url,
			array(
				'timeout' => 60,
				'headers' => $headers,
				'body'    => wp_json_encode( $body ),
			)
		);

		if ( is_wp_error( $response ) ) {
			throw new \RuntimeException(
				sprintf(
					/* translators: %s: Error message from API. */
					esc_html__( 'Matcha AI: API request failed — %s', 'matcha-gallery' ),
					esc_html( $response->get_error_message() )
				)
			);
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		$raw_body    = wp_remote_retrieve_body( $response );

		if ( $status_code < 200 || $status_code >= 300 ) {
			throw new \RuntimeException(
				sprintf(
					/* translators: 1: HTTP status code, 2: Response body. */
					esc_html__( 'Matcha AI: API returned HTTP %1$d — %2$s', 'matcha-gallery' ),
					absint( $status_code ),
					esc_html( mb_substr( $raw_body, 0, 500 ) )
				)
			);
		}

		return $this->parse_response( $raw_body, $fields );
	}

	/**
	 * Build the system prompt telling the AI what to return.
	 *
	 * @param string        $locale Target language.
	 * @param list<string>  $fields Fields to generate.
	 * @return string
	 */
	private function build_system_prompt( string $locale, array $fields ): string {
		$field_descriptions = array(
			'alt_text'  => '"alt_text": A concise, descriptive alt text for accessibility (max 125 characters).',
			'title'     => '"title": A short, human-readable title for the image (max 60 characters).',
			'caption'   => '"caption": A one- or two-sentence descriptive caption.',
			'keywords'  => '"keywords": An array of 3-8 relevant single-word or two-word tags, lowercase.',
		);

		$requested = array();
		foreach ( $fields as $field ) {
			if ( isset( $field_descriptions[ $field ] ) ) {
				$requested[] = $field_descriptions[ $field ];
			}
		}

		$locale_instruction = 'en' !== $locale
			? sprintf( 'Write all text in the "%s" locale/language.', $locale )
			: 'Write all text in English.';

		$prompt = implode(
			"\n",
			array(
				'You are an image metadata generator for a WordPress website.',
				$locale_instruction,
				'Respond ONLY with valid JSON (no markdown fences, no extra text).',
				'The JSON must contain exactly these fields:',
				implode( "\n", $requested ),
				'If a field was not requested, still include it with an empty string or empty array.',
				'Be accurate and specific to what is actually visible in the image.',
			)
		);

		return (string) apply_filters( 'matcha_gallery_ai_system_prompt', $prompt, $locale, $fields );
	}

	/**
	 * Build the image content block for the API message.
	 *
	 * @param string $image_source Base64 data or URL.
	 * @return array<string, mixed>
	 */
	private function build_image_content( string $image_source ): array {
		// Detect if it's already a URL or base64 data.
		if ( filter_var( $image_source, FILTER_VALIDATE_URL ) ) {
			return array(
				'type'      => 'image_url',
				'image_url' => array(
					'url'    => $image_source,
					'detail' => 'low',
				),
			);
		}

		// Assume base64 — add data URI prefix if not present.
		if ( ! str_starts_with( $image_source, 'data:' ) ) {
			$image_source = 'data:image/jpeg;base64,' . $image_source;
		}

		return array(
			'type'      => 'image_url',
			'image_url' => array(
				'url'    => $image_source,
				'detail' => 'low',
			),
		);
	}

	/**
	 * Parse the API response into a structured array.
	 *
	 * @param string       $raw_body Raw response body.
	 * @param list<string> $fields   Requested fields.
	 * @return array{alt_text: string, title: string, caption: string, keywords: list<string>}
	 * @throws \RuntimeException If response cannot be parsed.
	 */
	private function parse_response( string $raw_body, array $fields ): array {
		$data = json_decode( $raw_body, true );

		if ( ! is_array( $data ) ) {
			throw new \RuntimeException(
				esc_html__( 'Matcha AI: Could not decode API response.', 'matcha-gallery' )
			);
		}

		// Extract the text content from the chat completion response.
		$content = $data['choices'][0]['message']['content'] ?? '';

		if ( empty( $content ) ) {
			throw new \RuntimeException(
				esc_html__( 'Matcha AI: API returned an empty response.', 'matcha-gallery' )
			);
		}

		// Strip markdown code fences if the model wrapped its response.
		$content = preg_replace( '/^```(?:json)?\s*/i', '', $content );
		$content = preg_replace( '/\s*```$/', '', $content );

		$metadata = json_decode( trim( $content ), true );

		if ( ! is_array( $metadata ) ) {
			throw new \RuntimeException(
				sprintf(
					/* translators: %s: Raw content from API. */
					esc_html__( 'Matcha AI: Could not parse metadata JSON from API — %s', 'matcha-gallery' ),
					esc_html( mb_substr( $content, 0, 200 ) )
				)
			);
		}

		// Normalize and sanitize.
		return array(
			'alt_text' => sanitize_text_field( $metadata['alt_text'] ?? '' ),
			'title'    => sanitize_text_field( $metadata['title'] ?? '' ),
			'caption'  => sanitize_textarea_field( $metadata['caption'] ?? '' ),
			'keywords' => array_map(
				'sanitize_title',
				array_filter( (array) ( $metadata['keywords'] ?? array() ) )
			),
		);
	}
}
