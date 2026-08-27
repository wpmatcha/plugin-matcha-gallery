<?php
/**
 * Uninstall handler for Matcha Gallery.
 *
 * Runs when the plugin is deleted via the admin UI.
 * Cleans up plugin options and optionally removes AI keyword taxonomy terms.
 *
 * @package Matcha_Gallery
 */

// Abort if not called by WordPress.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Delete plugin options.
delete_option( 'matcha_gallery_settings' );

// Remove all terms from the AI keywords taxonomy.
$matcha_terms = get_terms(
	array(
		'taxonomy'   => 'matcha_ai_keywords',
		'hide_empty' => false,
		'fields'     => 'ids',
	)
);

if ( ! is_wp_error( $matcha_terms ) && is_array( $matcha_terms ) ) {
	foreach ( $matcha_terms as $matcha_term_id ) {
		wp_delete_term( (int) $matcha_term_id, 'matcha_ai_keywords' );
	}
}

// Clean up any post meta the plugin may have added.
global $wpdb;

// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.SlowDBQuery.slow_db_query_meta_key
$wpdb->delete(
	$wpdb->postmeta,
	array( 'meta_key' => '_matcha_ai_generated' ), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
	array( '%s' )
);
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.SlowDBQuery.slow_db_query_meta_key
$wpdb->delete( $wpdb->postmeta, array( 'meta_key' => '_matcha_gallery_config' ), array( '%s' ) );
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.SlowDBQuery.slow_db_query_meta_key
$wpdb->delete( $wpdb->postmeta, array( 'meta_key' => '_matcha_gallery_image_ids' ), array( '%s' ) );

// Delete all matcha_gallery CPT posts.
$matcha_gallery_ids = get_posts(
	array(
		'post_type'   => 'matcha_gallery',
		'numberposts' => -1,
		'post_status' => 'any',
		'fields'      => 'ids',
	)
);
if ( is_array( $matcha_gallery_ids ) ) {
	foreach ( $matcha_gallery_ids as $matcha_gid ) {
		wp_delete_post( (int) $matcha_gid, true );
	}
}
