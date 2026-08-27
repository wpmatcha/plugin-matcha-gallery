<?php
/**
 * Gallery query abstraction.
 *
 * @package Matcha_AI_Smart_Gallery\Query
 */


namespace Matcha_AI_Smart_Gallery\Query;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


use Matcha_AI_Smart_Gallery\Media\Attachment_Metadata;
use Matcha_AI_Smart_Gallery\Taxonomy\AI_Keywords_Taxonomy;

/**
 * Queries attachment posts for gallery display.
 *
 * Supports both "selected IDs" and "dynamic by AI tags" query modes.
 */
class Gallery_Query {

	/**
	 * Query configuration.
	 *
	 * @var array<string, mixed>
	 */
	private array $config;

	/**
	 * Constructor.
	 *
	 * @param array<string, mixed> $config Query configuration:
	 *   - 'source_type' (string) 'selected' or 'dynamic'.
	 *   - 'image_ids'   (int[])  Attachment IDs (for selected mode).
	 *   - 'ai_tags'     (array)  AI keyword term slugs/IDs (for dynamic mode).
	 *   - 'limit'       (int)    Max items to return. Default -1 (all).
	 *   - 'orderby'     (string) Order by. Default 'date'.
	 *   - 'order'       (string) Order direction. Default 'DESC'.
	 */
	public function __construct( array $config = array() ) {
		$this->config = wp_parse_args(
			$config,
			array(
				'source_type' => 'selected',
				'image_ids'   => array(),
				'ai_tags'     => array(),
				'limit'       => -1,
				'orderby'     => 'date',
				'order'       => 'DESC',
			)
		);
	}

	/**
	 * Execute the query and return gallery items.
	 *
	 * @return array<int, array{
	 *   id: int,
	 *   url: string,
	 *   full_url: string,
	 *   alt: string,
	 *   title: string,
	 *   caption: string,
	 *   keywords: list<string>,
	 *   width: int,
	 *   height: int,
	 * }>
	 */
	public function get_items(): array {
		$query_args = $this->build_query_args();

		if ( empty( $query_args ) ) {
			return array();
		}

		// Enforce 150 cap for v1 (decision: <150 standard DOM).
		if ( isset( $query_args['posts_per_page'] ) && ( -1 === $query_args['posts_per_page'] || $query_args['posts_per_page'] > 150 ) ) {
			$query_args['posts_per_page'] = 150;
		}

		$query = new \WP_Query( $query_args );
		$items = array();

		// Prime caches to fix N+1: postmeta + term cache in one query each.
		if ( ! empty( $query->posts ) ) {
			$ids = array_map( static fn( $p ) => (int) $p->ID, $query->posts );
			update_postmeta_cache( $ids );
			update_object_term_cache( $ids, 'attachment' );
		}

		foreach ( $query->posts as $post ) {
			$item = $this->build_item( $post );
			if ( $item ) {
				$items[] = $item;
			}
		}

		/**
		 * Filters the gallery items after querying.
		 *
		 * @param array               $items  Gallery items.
		 * @param array<string,mixed> $config Query configuration.
		 */
		return apply_filters( 'matcha_gallery_query_items', $items, $this->config );
	}

	/**
	 * Get the AI keyword terms used by the queried items.
	 *
	 * @return \WP_Term[]
	 */
	public function get_item_terms(): array {
		$items = $this->get_items();

		if ( empty( $items ) ) {
			return array();
		}

		$post_ids = array_column( $items, 'id' );

		$terms = wp_get_object_terms(
			$post_ids,
			AI_Keywords_Taxonomy::TAXONOMY,
			array(
				'orderby' => 'name',
				'order'   => 'ASC',
			)
		);

		return is_wp_error( $terms ) ? array() : $terms;
	}

	/**
	 * Build WP_Query arguments based on the config.
	 *
	 * @return array<string, mixed>|array{} Empty array if query is invalid.
	 */
	private function build_query_args(): array {
		$base = array(
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'post_mime_type' => 'image',
			'posts_per_page' => (int) $this->config['limit'],
			'orderby'        => sanitize_key( $this->config['orderby'] ),
			'order'          => strtoupper( $this->config['order'] ) === 'ASC' ? 'ASC' : 'DESC',
			'no_found_rows'  => true,
		);

		if ( 'selected' === $this->config['source_type'] ) {
			$ids = array_filter( array_map( 'intval', (array) $this->config['image_ids'] ) );

			if ( empty( $ids ) ) {
				return array();
			}

			$base['post__in'] = $ids;
			$base['orderby']  = 'post__in';
			unset( $base['order'] );
		} elseif ( 'dynamic' === $this->config['source_type'] ) {
			$tags = array_filter( (array) $this->config['ai_tags'] );

			if ( ! empty( $tags ) ) {
				$base['tax_query'] = array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
					array(
						'taxonomy' => AI_Keywords_Taxonomy::TAXONOMY,
						'field'    => is_numeric( $tags[0] ) ? 'term_id' : 'slug',
						'terms'    => $tags,
						'operator' => 'IN',
					),
				);
			}
		}

		/**
		 * Filters the WP_Query arguments for a gallery query.
		 *
		 * Pro can extend this to support posts, products, etc.
		 *
		 * @param array<string, mixed> $base   Query args.
		 * @param array<string, mixed> $config Gallery config.
		 */
		return apply_filters( 'matcha_gallery_query_args', $base, $this->config );
	}

	/**
	 * Build a single gallery item from a post object.
	 *
	 * @param \WP_Post $post Attachment post.
	 * @return array<string, mixed>|null
	 */
	private function build_item( \WP_Post $post ): ?array {
		$thumb = wp_get_attachment_image_src( $post->ID, 'large' );
		$full  = wp_get_attachment_image_src( $post->ID, 'full' );

		if ( ! $thumb || ! $full ) {
			return null;
		}

		$metadata = Attachment_Metadata::get_metadata( $post->ID );

		return array(
			'id'           => $post->ID,
			'url'          => $thumb[0],
			'full_url'     => $full[0],
			'alt'          => $metadata['alt_text'],
			'title'        => $metadata['title'],
			'caption'      => $metadata['caption'],
			'keywords'     => $metadata['keywords'],
			'colors'       => $metadata['colors'] ?? array(),
			'focal_point'  => $metadata['focal_point'] ?? array( 'x' => 50, 'y' => 50 ),
			'ai_generated' => $metadata['ai_generated'],
			'width'        => $full[1],
			'height'       => $full[2],
		);
	}
}
