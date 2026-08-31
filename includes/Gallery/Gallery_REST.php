<?php
/**
 * REST controller for matcha_gallery CPT.
 *
 * Routes: /matcha-gallery/v1/galleries
 *
 * @package Matcha_AI_Smart_Gallery\Gallery
 */


namespace Matcha_AI_Smart_Gallery\Gallery;

// Abort if called directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * CRUD controller for galleries.
 */
final class Gallery_REST {

	/**
	 * Register REST routes.
	 */
	public static function register(): void {
		add_action( 'rest_api_init', array( static::class, 'register_routes' ) );
	}

	/**
	 * Register routes.
	 */
	public static function register_routes(): void {
		register_rest_route(
			'matcha-gallery/v1',
			'/galleries',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( static::class, 'list_galleries' ),
					'permission_callback' => array( static::class, 'can_read_galleries' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( static::class, 'create_gallery' ),
					'permission_callback' => array( static::class, 'can_create_gallery' ),
					'args'                => self::schema_args(),
				),
			)
		);

		register_rest_route(
			'matcha-gallery/v1',
			'/galleries/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( static::class, 'get_gallery' ),
					'permission_callback' => array( static::class, 'can_read_gallery' ),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( static::class, 'update_gallery' ),
					'permission_callback' => array( static::class, 'can_edit_gallery' ),
					'args'                => self::schema_args(),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( static::class, 'delete_gallery' ),
					'permission_callback' => array( static::class, 'can_delete_gallery' ),
				),
			)
		);
	}

	/**
	 * Check capability to list galleries.
	 *
	 * @return bool
	 */
	public static function can_read_galleries(): bool {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Check capability to create a new gallery.
	 *
	 * @return bool
	 */
	public static function can_create_gallery(): bool {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Check capability to read a specific gallery post.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return bool
	 */
	public static function can_read_gallery( WP_REST_Request $request ): bool {
		$id = (int) $request->get_param( 'id' );
		if ( ! $id ) {
			return false;
		}
		return current_user_can( 'read_post', $id ) || current_user_can( 'edit_post', $id );
	}

	/**
	 * Check capability to edit a specific gallery post.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return bool
	 */
	public static function can_edit_gallery( WP_REST_Request $request ): bool {
		$id = (int) $request->get_param( 'id' );
		if ( ! $id ) {
			return false;
		}
		return current_user_can( 'edit_post', $id );
	}

	/**
	 * Check capability to delete a specific gallery post.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return bool
	 */
	public static function can_delete_gallery( WP_REST_Request $request ): bool {
		$id = (int) $request->get_param( 'id' );
		if ( ! $id ) {
			return false;
		}
		return current_user_can( 'delete_post', $id );
	}

	/**
	 * Schema args for write.
	 *
	 * @return array<string,mixed>
	 */
	private static function schema_args(): array {
		return array(
			'title'  => array(
				'type'              => 'string',
				'required'          => false,
				'sanitize_callback' => 'sanitize_text_field',
			),
			'config' => array(
				'type'     => 'object',
				'required' => false,
			),
		);
	}

	/**
	 * List galleries.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function list_galleries( WP_REST_Request $request ): WP_REST_Response {
		$per_page = min( 100, max( 1, (int) $request->get_param( 'per_page' ) ?: 20 ) );
		$paged    = max( 1, (int) $request->get_param( 'page' ) ?: 1 );
		$search   = sanitize_text_field( $request->get_param( 'search' ) ?? '' );

		$args = array(
			'post_type'      => Gallery_CPT::POST_TYPE,
			'post_status'    => array( 'publish', 'draft', 'pending' ),
			'posts_per_page' => $per_page,
			'paged'          => $paged,
			's'              => $search,
			'orderby'        => 'modified',
			'order'          => 'DESC',
			'no_found_rows'  => false,
		);

		$query = new \WP_Query( $args );

		$data = array_map( array( static::class, 'prepare_item' ), $query->posts );

		$resp = new WP_REST_Response( $data, 200 );
		$resp->header( 'X-WP-Total', (int) $query->found_posts );
		$resp->header( 'X-WP-TotalPages', (int) $query->max_num_pages );
		return $resp;
	}

	/**
	 * Get single gallery.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_gallery( WP_REST_Request $request ) {
		$id   = (int) $request->get_param( 'id' );
		$post = get_post( $id );

		if ( ! $post || Gallery_CPT::POST_TYPE !== $post->post_type ) {
			return new WP_Error( 'not_found', __( 'Gallery not found.', 'matcha-gallery' ), array( 'status' => 404 ) );
		}

		return new WP_REST_Response( self::prepare_item( $post ), 200 );
	}

	/**
	 * Create gallery.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function create_gallery( WP_REST_Request $request ) {
		$title  = sanitize_text_field( $request->get_param( 'title' ) ?? __( 'Untitled Gallery', 'matcha-gallery' ) );
		$config = $request->get_param( 'config' );
		if ( ! is_array( $config ) ) {
			$config = Gallery_CPT::default_config();
		}

		$post_id = wp_insert_post(
			array(
				'post_type'   => Gallery_CPT::POST_TYPE,
				'post_title'  => $title ?: __( 'Untitled Gallery', 'matcha-gallery' ),
				'post_status' => 'publish',
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		Gallery_CPT::save_config( (int) $post_id, $config );

		$post = get_post( $post_id );
		return new WP_REST_Response( self::prepare_item( $post ), 201 );
	}

	/**
	 * Update gallery.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function update_gallery( WP_REST_Request $request ) {
		$id   = (int) $request->get_param( 'id' );
		$post = get_post( $id );

		if ( ! $post || Gallery_CPT::POST_TYPE !== $post->post_type ) {
			return new WP_Error( 'not_found', __( 'Gallery not found.', 'matcha-gallery' ), array( 'status' => 404 ) );
		}

		$updates = array( 'ID' => $id );
		$title   = $request->get_param( 'title' );
		if ( null !== $title ) {
			$updates['post_title'] = sanitize_text_field( $title );
		}

		if ( isset( $updates['post_title'] ) ) {
			$res = wp_update_post( $updates, true );
			if ( is_wp_error( $res ) ) {
				return $res;
			}
		}

		$config = $request->get_param( 'config' );
		if ( is_array( $config ) ) {
			// Merge with existing to allow partial PATCH
			$existing = Gallery_CPT::get_config( $id );
			$merged   = array_merge( $existing, $config );
			Gallery_CPT::save_config( $id, $merged );
		}

		$post = get_post( $id );
		return new WP_REST_Response( self::prepare_item( $post ), 200 );
	}

	/**
	 * Delete gallery.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function delete_gallery( WP_REST_Request $request ) {
		$id   = (int) $request->get_param( 'id' );
		$post = get_post( $id );

		if ( ! $post || Gallery_CPT::POST_TYPE !== $post->post_type ) {
			return new WP_Error( 'not_found', __( 'Gallery not found.', 'matcha-gallery' ), array( 'status' => 404 ) );
		}

		$deleted = wp_trash_post( $id );
		if ( ! $deleted ) {
			return new WP_Error( 'delete_failed', __( 'Could not delete gallery.', 'matcha-gallery' ), array( 'status' => 500 ) );
		}

		return new WP_REST_Response( array( 'deleted' => true, 'id' => $id ), 200 );
	}

	/**
	 * Prepare item for response.
	 *
	 * @param \WP_Post $post Post object.
	 * @return array<string,mixed>
	 */
	private static function prepare_item( \WP_Post $post ): array {
		$config = Gallery_CPT::get_config( (int) $post->ID );
		// Compute derived fields
		$count = count( $config['imageIds'] ?? array() );

		return array(
			'id'         => (int) $post->ID,
			'title'      => $post->post_title,
			'slug'       => $post->post_name,
			'status'     => $post->post_status,
			'modified'   => $post->post_modified_gmt,
			'config'     => $config,
			'imageCount' => $count,
			'shortcode'  => sprintf( '[matcha_gallery id="%d"]', (int) $post->ID ),
		);
	}
}
