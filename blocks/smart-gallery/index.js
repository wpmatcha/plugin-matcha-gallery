/**
 * Smart Gallery block registration.
 *
 * @package matcha-gallery
 */

import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import save from './save';
import './editor.css';

/**
 * Custom gallery icon with matcha branding.
 */
const matchaIcon = (
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path
			fill="#4CAF50"
			d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
		/>
	</svg>
);

registerBlockType( metadata.name, {
	icon: matchaIcon,
	edit: Edit,
	save,
} );
