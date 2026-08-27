<?php
/**
 * AI client interface.
 *
 * All AI providers must implement this interface.
 *
 * @package Matcha_AI_Smart_Gallery\AI
 */


namespace Matcha_AI_Smart_Gallery\AI;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


/**
 * Contract for AI image analysis providers.
 */
interface Client_Interface {

	/**
	 * Analyze an image and return structured metadata.
	 *
	 * @param string               $image_source Base64-encoded image data or a publicly accessible URL.
	 * @param array<string, mixed> $options      Options for analysis:
	 *   - 'locale'   (string) Target language/locale for generated text (default: 'en').
	 *   - 'fields'   (array)  Which fields to generate: 'alt_text', 'title', 'caption', 'keywords'.
	 *   - 'context'  (string) Optional additional context about the image or site.
	 *
	 * @return array{
	 *   alt_text: string,
	 *   title: string,
	 *   caption: string,
	 *   keywords: list<string>,
	 * }
	 *
	 * @throws \RuntimeException If the API call fails or returns invalid data.
	 */
	public function analyze_image( string $image_source, array $options = array() ): array;
}
