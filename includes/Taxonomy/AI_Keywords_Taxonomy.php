<?php
/**
 * AI Keywords taxonomy registration.
 *
 * @package Matcha_AI_Smart_Gallery\Taxonomy
 */


namespace Matcha_AI_Smart_Gallery\Taxonomy;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


/**
 * Registers the matcha_ai_keywords taxonomy for attachments.
 */
class AI_Keywords_Taxonomy {

	/**
	 * Taxonomy slug.
	 */
	public const TAXONOMY = 'matcha_ai_keywords';

	/**
	 * Register the taxonomy on the init hook.
	 */
	public static function register(): void {
		add_action( 'init', array( static::class, 'register_taxonomy' ), 5 );
	}

	/**
	 * Register the AI Keywords taxonomy.
	 */
	public static function register_taxonomy(): void {
		$labels = array(
			'name'                       => _x( 'AI Keywords', 'taxonomy general name', 'matcha-gallery' ),
			'singular_name'              => _x( 'AI Keyword', 'taxonomy singular name', 'matcha-gallery' ),
			'search_items'               => __( 'Search AI Keywords', 'matcha-gallery' ),
			'popular_items'              => __( 'Popular AI Keywords', 'matcha-gallery' ),
			'all_items'                  => __( 'All AI Keywords', 'matcha-gallery' ),
			'parent_item'                => null,
			'parent_item_colon'          => null,
			'edit_item'                  => __( 'Edit AI Keyword', 'matcha-gallery' ),
			'update_item'                => __( 'Update AI Keyword', 'matcha-gallery' ),
			'add_new_item'               => __( 'Add New AI Keyword', 'matcha-gallery' ),
			'new_item_name'              => __( 'New AI Keyword Name', 'matcha-gallery' ),
			'separate_items_with_commas' => __( 'Separate AI keywords with commas', 'matcha-gallery' ),
			'add_or_remove_items'        => __( 'Add or remove AI keywords', 'matcha-gallery' ),
			'choose_from_most_used'      => __( 'Choose from the most used AI keywords', 'matcha-gallery' ),
			'not_found'                  => __( 'No AI keywords found.', 'matcha-gallery' ),
			'menu_name'                  => __( 'AI Keywords', 'matcha-gallery' ),
			'back_to_items'              => __( '← Go to AI Keywords', 'matcha-gallery' ),
		);

		$args = array(
			'labels'            => $labels,
			'hierarchical'      => false,
			'public'            => false,
			'show_ui'           => true,
			'show_admin_column' => true,
			'show_in_nav_menus' => false,
			'show_in_rest'      => true,
			'show_tagcloud'     => false,
			'query_var'         => false,
			'rewrite'           => false,
		);

		/**
		 * Filters the AI Keywords taxonomy arguments.
		 *
		 * Pro add-ons can extend the object types or modify args.
		 *
		 * @param array<string, mixed> $args Taxonomy arguments.
		 */
		$args = apply_filters( 'matcha_gallery_taxonomy_args', $args );

		/**
		 * Filters the post types the AI Keywords taxonomy is registered on.
		 *
		 * @param list<string> $post_types Post types. Default: ['attachment'].
		 */
		$post_types = apply_filters( 'matcha_gallery_taxonomy_post_types', array( 'attachment' ) );

		register_taxonomy( self::TAXONOMY, $post_types, $args );
	}

	/**
	 * Get all terms for the AI Keywords taxonomy.
	 *
	 * @param array<string, mixed> $args Optional. Additional get_terms arguments.
	 * @return \WP_Term[]
	 */
	public static function get_all_terms( array $args = array() ): array {
		$defaults = array(
			'taxonomy'   => self::TAXONOMY,
			'hide_empty' => false,
			'orderby'    => 'name',
			'order'      => 'ASC',
		);

		$terms = get_terms( array_merge( $defaults, $args ) );

		return is_wp_error( $terms ) ? array() : $terms;
	}

	/**
	 * Get terms that are actually in use (have at least one attachment).
	 *
	 * @return \WP_Term[]
	 */
	public static function get_used_terms(): array {
		return self::get_all_terms( array( 'hide_empty' => true ) );
	}
}
