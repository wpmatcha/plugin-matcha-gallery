/**
 * Inspector Controls for the Smart Gallery block.
 *
 * Sidebar panel with all gallery configuration options.
 *
 * @package matcha-gallery
 */

import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ToggleControl,
	SelectControl,
	TextControl,
	FormTokenField,
	RadioControl,
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * Inspector controls for the gallery block sidebar.
 *
 * @param {Object}   props                Component props.
 * @param {Object}   props.attributes     Block attributes.
 * @param {Function} props.setAttributes  Attribute setter.
 * @return {JSX.Element} Inspector panels.
 */
export default function GalleryInspectorControls( { attributes, setAttributes } ) {
	const {
		sourceType,
		aiTags,
		layout,
		columns,
		columnsTablet,
		columnsMobile,
		gutterSize,
		filtersEnabled,
		showAllFilter,
		showTitle,
		showCaption,
		lightboxEnabled,
		galleryId,
	} = attributes;

	// State for available AI keywords & Studio galleries.
	const [ availableKeywords, setAvailableKeywords ] = useState( [] );
	const [ keywordsLoading, setKeywordsLoading ] = useState( false );
	const [ studioGalleries, setStudioGalleries ] = useState( [] );

	// Fetch AI keywords from REST API.
	useEffect( () => {
		setKeywordsLoading( true );
		apiFetch( { path: '/matcha-gallery/v1/ai-keywords' } )
			.then( ( data ) => {
				setAvailableKeywords(
					data.map( ( term ) => term.name )
				);
			} )
			.catch( () => {
				setAvailableKeywords( [] );
			} )
			.finally( () => {
				setKeywordsLoading( false );
			} );

		// Fetch available Studio Galleries
		apiFetch( { path: '/matcha-gallery/v1/galleries' } )
			.then( ( data ) => {
				if ( Array.isArray( data ) ) {
					setStudioGalleries( data );
				}
			} )
			.catch( () => {
				setStudioGalleries( [] );
			} );
	}, [] );

	const galleryOptions = [
		{ label: __( 'None (Custom Block Settings)', 'matcha-gallery' ), value: 0 },
		...studioGalleries.map( ( g ) => ( {
			label: `#${ g.id } — ${ g.title || 'Untitled Gallery' } (${ ( g.config?.imageIds || [] ).length } photos)`,
			value: g.id,
		} ) ),
	];

	const selectedGallery = studioGalleries.find( ( g ) => g.id === galleryId );

	return (
		<InspectorControls>
			{ /* Studio Gallery Connection Panel */ }
			<PanelBody
				title={ __( 'Matcha Studio Gallery', 'matcha-gallery' ) }
				initialOpen={ true }
			>
				<SelectControl
					label={ __( 'Select Gallery', 'matcha-gallery' ) }
					value={ galleryId || 0 }
					options={ galleryOptions }
					help={ __( 'Link this block to a master gallery designed in Matcha Studio.', 'matcha-gallery' ) }
					onChange={ ( val ) => {
						const numId = parseInt( val );
						setAttributes( { galleryId: numId } );
					} }
				/>

				{ galleryId > 0 ? (
					<div style={ { marginTop: '12px', padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' } }>
						<div style={ { fontWeight: 700, color: '#166534', fontSize: '12px', marginBottom: '4px' } }>
							✓ Connected to #{ galleryId } ({ selectedGallery?.title || 'Gallery' })
						</div>
						<p style={ { fontSize: '11px', color: '#15803d', margin: '0 0 8px 0' } }>
							Layouts, frames, tags, search bar, and accent colors are managed in Studio.
						</p>
						<a
							href={ `admin.php?page=matcha-studio&post=${ galleryId }` }
							target="_blank"
							rel="noreferrer"
							style={ {
								display: 'inline-block',
								padding: '5px 10px',
								background: '#16a34a',
								color: '#fff',
								borderRadius: '4px',
								textDecoration: 'none',
								fontSize: '11px',
								fontWeight: 700,
							} }
						>
							Open in Matcha Studio ↗
						</a>
					</div>
				) : (
					<div style={ { marginTop: '8px' } }>
						<a
							href="admin.php?page=matcha-studio"
							target="_blank"
							rel="noreferrer"
							style={ { fontSize: '11px', color: '#16a34a', fontWeight: 600 } }
						>
							+ Create New Gallery in Studio ↗
						</a>
					</div>
				) }
			</PanelBody>

			{ /* Curated Style Preset (Skin) Panel */ }
			<PanelBody
				title={ __( 'Curated Style Preset (Skin)', 'matcha-gallery' ) }
				initialOpen={ true }
			>
				<SelectControl
					label={ __( 'Style Preset', 'matcha-gallery' ) }
					value={ attributes.stylePreset || 'custom' }
					options={ [
						{ label: __( 'Custom (Manual Adjustments)', 'matcha-gallery' ), value: 'custom' },
						{ label: __( 'Exhibition Hairline Frame (The Grid: Brasilia)', 'matcha-gallery' ), value: 'exhibition-frame' },
						{ label: __( 'Architectural Curtain (The Grid: Sofia)', 'matcha-gallery' ), value: 'architectural-curtain' },
						{ label: __( 'Cinematic Pullback (The Grid: Bogota)', 'matcha-gallery' ), value: 'cinematic-pullback' },
						{ label: __( 'Minimalist Drawer (The Grid: Lome)', 'matcha-gallery' ), value: 'minimalist-drawer' },
					] }
					help={ __( 'Curated preset that harmonizes layout, hover effects, and framing.', 'matcha-gallery' ) }
					onChange={ ( val ) => {
						const patch = { stylePreset: val, contentPlacement: 'overlay' };
						if ( val === 'exhibition-frame' ) {
							patch.hoverEffect = 'frame';
							patch.layout = 'grid';
						} else if ( val === 'architectural-curtain' ) {
							patch.hoverEffect = 'curtain';
							patch.layout = 'justified';
						} else if ( val === 'cinematic-pullback' ) {
							patch.hoverEffect = 'pullback';
							patch.layout = 'masonry';
						} else if ( val === 'minimalist-drawer' ) {
							patch.hoverEffect = 'drawer';
							patch.layout = 'grid';
						}
						setAttributes( patch );
					} }
				/>
			</PanelBody>

			{ /* Content Panel */ }
			{ ( ! galleryId || galleryId === 0 ) && (
			<PanelBody
				title={ __( 'Content Source', 'matcha-gallery' ) }
				initialOpen={ false }
			>
				<RadioControl
					label={ __( 'Source', 'matcha-gallery' ) }
					selected={ sourceType }
					options={ [
						{
							label: __( 'Selected images', 'matcha-gallery' ),
							value: 'selected',
						},
						{
							label: __( 'Dynamic (by AI tags)', 'matcha-gallery' ),
							value: 'dynamic',
						},
					] }
					onChange={ ( value ) => setAttributes( { sourceType: value } ) }
				/>

				{ sourceType === 'dynamic' && (
					<FormTokenField
						label={ __( 'AI Keywords', 'matcha-gallery' ) }
						value={ aiTags }
						suggestions={ availableKeywords }
						onChange={ ( tokens ) => setAttributes( { aiTags: tokens } ) }
						placeholder={
							keywordsLoading
								? __( 'Loading…', 'matcha-gallery' )
								: __( 'Type to search AI keywords', 'matcha-gallery' )
						}
						__experimentalExpandOnFocus
					/>
				) }
			</PanelBody>
			) }

			{ /* Layout Panel */ }
			<PanelBody
				title={ __( 'Layout', 'matcha-gallery' ) }
				initialOpen={ false }
			>
				<SelectControl
					label={ __( 'Layout Type', 'matcha-gallery' ) }
					value={ layout }
					options={ [
						{ label: __( 'Classic Grid', 'matcha-gallery' ), value: 'grid' },
						{ label: __( 'Pinterest Masonry', 'matcha-gallery' ), value: 'masonry' },
						{ label: __( 'Flickr Justified Rows', 'matcha-gallery' ), value: 'justified' },
						{ label: __( 'PhotoBlocks Mosaic', 'matcha-gallery' ), value: 'mosaic' },
						{ label: __( 'Bento Showcase (PRO)', 'matcha-gallery' ), value: 'bento' },
						{ label: __( 'Pinwheel Spiral (PRO)', 'matcha-gallery' ), value: 'pinwheel' },
					] }
					onChange={ ( value ) => setAttributes( { layout: value } ) }
				/>

				{ layout === 'justified' ? (
					<RangeControl
						label={ __( 'Row Height (px)', 'matcha-gallery' ) }
						value={ attributes.rowHeight || 240 }
						onChange={ ( value ) => setAttributes( { rowHeight: value } ) }
						min={ 120 }
						max={ 400 }
						step={ 10 }
					/>
				) : (
					<RangeControl
						label={ __( 'Columns (Desktop)', 'matcha-gallery' ) }
						value={ columns }
						onChange={ ( value ) => setAttributes( { columns: value } ) }
						min={ 1 }
						max={ 6 }
					/>
				) }

				<RangeControl
					label={ __( 'Columns (Tablet)', 'matcha-gallery' ) }
					value={ columnsTablet }
					onChange={ ( value ) => setAttributes( { columnsTablet: value } ) }
					min={ 1 }
					max={ 4 }
				/>

				<RangeControl
					label={ __( 'Columns (Mobile)', 'matcha-gallery' ) }
					value={ columnsMobile }
					onChange={ ( value ) => setAttributes( { columnsMobile: value } ) }
					min={ 1 }
					max={ 3 }
				/>

				<RangeControl
					label={ __( 'Gutter Size (px)', 'matcha-gallery' ) }
					value={ gutterSize }
					onChange={ ( value ) => setAttributes( { gutterSize: value } ) }
					min={ 0 }
					max={ 48 }
					step={ 4 }
				/>
			</PanelBody>

			{ /* Filters & Toolbar Panel */ }
			<PanelBody
				title={ __( 'Toolbar & Filters', 'matcha-gallery' ) }
				initialOpen={ false }
			>
				<ToggleControl
					label={ __( 'Enable filters', 'matcha-gallery' ) }
					help={ __(
						'Show filter buttons above the gallery based on AI keywords.',
						'matcha-gallery'
					) }
					checked={ filtersEnabled }
					onChange={ ( value ) =>
						setAttributes( { filtersEnabled: value } )
					}
				/>

				<SelectControl
					label={ __( 'Toolbar & Controls Skin', 'matcha-gallery' ) }
					value={ attributes.toolbarSkin || 'capsule' }
					options={ [
						{ label: __( 'Modern Capsule (Clean Pill)', 'matcha-gallery' ), value: 'capsule' },
						{ label: __( 'Minimalist Hairline (Fine Art Underline)', 'matcha-gallery' ), value: 'underline' },
						{ label: __( 'Obsidian Dark (Charcoal Pro)', 'matcha-gallery' ), value: 'obsidian' },
						{ label: __( 'Frosted Glass (Glassmorphism Pro)', 'matcha-gallery' ), value: 'glass' },
					] }
					help={ __(
						'Harmonizes search bar, filter buttons, sort dropdown, and swatches in a unified design language.',
						'matcha-gallery'
					) }
					onChange={ ( value ) =>
						setAttributes( { toolbarSkin: value } )
					}
				/>

				{ filtersEnabled && (
					<ToggleControl
						label={ __( 'Show "All" filter', 'matcha-gallery' ) }
						checked={ showAllFilter }
						onChange={ ( value ) =>
							setAttributes( { showAllFilter: value } )
						}
					/>
				) }
			</PanelBody>

			{ /* Display Panel */ }
			<PanelBody
				title={ __( 'Display', 'matcha-gallery' ) }
				initialOpen={ false }
			>
				<ToggleControl
					label={ __( 'Show title', 'matcha-gallery' ) }
					checked={ showTitle }
					onChange={ ( value ) =>
						setAttributes( { showTitle: value } )
					}
				/>

				<ToggleControl
					label={ __( 'Show caption', 'matcha-gallery' ) }
					checked={ showCaption }
					onChange={ ( value ) =>
						setAttributes( { showCaption: value } )
					}
				/>

				<ToggleControl
					label={ __( 'Enable lightbox', 'matcha-gallery' ) }
					help={ __(
						'Allow clicking images to view them in a larger overlay.',
						'matcha-gallery'
					) }
					checked={ lightboxEnabled }
					onChange={ ( value ) =>
						setAttributes( { lightboxEnabled: value } )
					}
				/>

				<SelectControl
					label={ __( 'Hover Animation', 'matcha-gallery' ) }
					value={ attributes.hoverEffect || 'zoom' }
					options={ [
						{ label: __( 'Smooth Zoom (The Grid Malabo)', 'matcha-gallery' ), value: 'zoom' },
						{ label: __( 'Cinematic Pullback (The Grid Bogota)', 'matcha-gallery' ), value: 'pullback' },
						{ label: __( 'Editorial Hairline Frame (The Grid Brasilia)', 'matcha-gallery' ), value: 'frame' },
						{ label: __( 'Architectural Slide Curtain (The Grid Sofia)', 'matcha-gallery' ), value: 'curtain' },
						{ label: __( 'Minimalist Bottom Drawer (The Grid Lome)', 'matcha-gallery' ), value: 'drawer' },
						{ label: __( 'Monochrome to Vivid Color', 'matcha-gallery' ), value: 'grayscale' },
						{ label: __( 'Clean Static (No Effect)', 'matcha-gallery' ), value: 'none' },
					] }
					onChange={ ( value ) => setAttributes( { hoverEffect: value } ) }
				/>

				{ attributes.hoverEffect === 'frame' && (
					<TextControl
						label={ __( 'Hairline Frame Color', 'matcha-gallery' ) }
						value={ attributes.hoverFrameColor || '' }
						placeholder="rgba(255, 255, 255, 0.45) or #ffffff"
						onChange={ ( value ) => setAttributes( { hoverFrameColor: value } ) }
						help={ __( 'Custom border color for Brasilia hairline frame.', 'matcha-gallery' ) }
					/>
				) }

				<SelectControl
					label={ __( 'Mobile Touch Action', 'matcha-gallery' ) }
					value={ attributes.hoverMobileTap || 'lightbox' }
					options={ [
						{ label: __( 'Direct Lightbox Open (Fast)', 'matcha-gallery' ), value: 'lightbox' },
						{ label: __( 'Tap to Reveal Overlay (Captions & Links)', 'matcha-gallery' ), value: 'reveal' },
					] }
					onChange={ ( value ) => setAttributes( { hoverMobileTap: value } ) }
					help={ __( 'Determine how touch devices handle tapping photos.', 'matcha-gallery' ) }
				/>
			</PanelBody>
		</InspectorControls>
	);
}
