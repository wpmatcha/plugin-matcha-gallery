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
							patch.frameStyle = 'black-metal';
							patch.mattingSize = 18;
							patch.skin = 'skin-exhibition';
						} else if ( val === 'architectural-curtain' ) {
							patch.hoverEffect = 'curtain';
							patch.layout = 'justified';
							patch.frameStyle = 'none';
							patch.mattingSize = 0;
							patch.skin = 'skin-pure-minimalist';
						} else if ( val === 'cinematic-pullback' ) {
							patch.hoverEffect = 'pullback';
							patch.layout = 'masonry';
							patch.frameStyle = 'none';
							patch.mattingSize = 0;
							patch.skin = 'skin-pure-minimalist';
						} else if ( val === 'minimalist-drawer' ) {
							patch.hoverEffect = 'drawer';
							patch.layout = 'grid';
							patch.frameStyle = 'none';
							patch.mattingSize = 0;
							patch.skin = 'skin-pure-minimalist';
						} else if ( val === 'custom' ) {
							patch.frameStyle = 'none';
							patch.mattingSize = 0;
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
						{ label: __( 'Lookbook Duet (2026 Editorial)', 'matcha-gallery' ), value: 'lookbook-duet' },
						{ label: __( 'Cinema Reel (Horizontal Runway)', 'matcha-gallery' ), value: 'cinema-reel' },
						{ label: __( 'Bento Showcase (PhotoBlocks)', 'matcha-gallery' ), value: 'bento' },
						{ label: __( 'Curated Art Wall (Hero Triptych - PRO)', 'matcha-gallery' ), value: 'art-wall' },
						{ label: __( 'Curator Specimen (Swiss Archive - PRO)', 'matcha-gallery' ), value: 'curator-specimen' },
						{ label: __( 'Pinwheel Spiral (PRO)', 'matcha-gallery' ), value: 'pinwheel' },
					] }
					onChange={ ( value ) => {
						const isPro = window.matchaGalleryBlockData?.isPro || window.MatchaStudio?.isPro;
						if ( [ 'art-wall', 'curator-specimen', 'pinwheel' ].includes( value ) && ! isPro ) {
							setAttributes( { layout: 'cinema-reel' } );
							alert( __( 'Curated Art Wall, Curator Specimen & Pinwheel are Pro layouts. Please upgrade to Matcha Gallery Pro to unlock them.', 'matcha-gallery' ) );
							return;
						}
						setAttributes( { layout: value } );
					} }
				/>

				{ layout === 'art-wall' ? (
					<div style={ { marginTop: '12px', padding: '12px', background: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b' } }>
						<div style={ { fontSize: '11px', fontWeight: 700, color: '#5ec27f', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' } }>
							🏛️ Museum Exhibition Preset
						</div>
						<p style={ { fontSize: '12px', color: '#cbd5e1', margin: '0 0 10px 0', lineHeight: 1.4 } }>
							<strong>Hero Triptych</strong> renders 3 museum-matted frames along the 57″ gallery eye-level line with classic Matte Black molding. Surplus photos open seamlessly in the interactive viewer.
						</p>
						{ ( window.matchaGalleryBlockData?.isPro || window.MatchaStudio?.isPro ) ? (
							<>
								<SelectControl
									label={ __( 'Wall Layout Preset', 'matcha-gallery' ) }
									value={ attributes.wallPreset || 'triptych' }
									options={ [
										{ label: __( 'Hero Triptych (3 Frames)', 'matcha-gallery' ), value: 'triptych' },
										{ label: __( 'Salon Exhibition (6 Frames)', 'matcha-gallery' ), value: 'salon' },
										{ label: __( 'Staircase Ascending (6 Frames)', 'matcha-gallery' ), value: 'staircase' },
										{ label: __( 'Symmetric Quad (6 Frames)', 'matcha-gallery' ), value: 'symmetric' },
									] }
									onChange={ ( val ) => setAttributes( { wallPreset: val } ) }
								/>
								<SelectControl
									label={ __( 'Frame Molding', 'matcha-gallery' ) }
									value={ attributes.wallMolding || 'mold-black' }
									options={ [
										{ label: __( 'Classic Matte Black', 'matcha-gallery' ), value: 'mold-black' },
										{ label: __( 'Natural Oak', 'matcha-gallery' ), value: 'mold-oak' },
										{ label: __( 'Nordic White', 'matcha-gallery' ), value: 'mold-white' },
										{ label: __( 'Gold Brass', 'matcha-gallery' ), value: 'mold-brass' },
										{ label: __( 'Floating Glass', 'matcha-gallery' ), value: 'mold-float' },
									] }
									onChange={ ( val ) => setAttributes( { wallMolding: val } ) }
								/>
							</>
						) : (
							<div style={ { padding: '8px 10px', background: 'rgba(94, 194, 127, 0.1)', borderRadius: '6px', border: '1px solid rgba(94, 194, 127, 0.25)' } }>
								<div style={ { fontSize: '11px', color: '#86efac', fontWeight: 600 } }>
									★ Unlock Art Wall Studio (PRO)
								</div>
								<div style={ { fontSize: '10.5px', color: '#94a3b8', marginTop: '3px', lineHeight: 1.35 } }>
									Drag-and-drop frame positioning, 90° orientation flip, Salon & Staircase presets, and luxury moldings (Oak, White, Brass, Floating Glass).
								</div>
							</div>
						) }
					</div>
				) : (
					<>
						{ layout === 'justified' ? (
							<RangeControl
								label={ __( 'Row Height (px)', 'matcha-gallery' ) }
								value={ attributes.rowHeight || 240 }
								onChange={ ( value ) => setAttributes( { rowHeight: value } ) }
								min={ 120 }
								max={ 400 }
								step={ 10 }
							/>
						) : ( [ 'cinema-reel', 'curator-specimen', 'lookbook-duet' ].includes( layout ) ? (
							<div style={ { marginTop: '8px', padding: '10px', background: '#0f172a', borderRadius: '6px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 } }>
								{ layout === 'lookbook-duet' && __( 'Lookbook Duet auto-arranges photos in an editorial 3-column staggered rhythm with alternating aspect ratios.', 'matcha-gallery' ) }
								{ layout === 'cinema-reel' && __( 'Cinema Reel displays a 16:9 widescreen horizontal runway with smooth touch & trackpad scroll-snap momentum.', 'matcha-gallery' ) }
								{ layout === 'curator-specimen' && __( 'Curator Specimen displays an architectural 2-column museum archive with generous 40px negative space.', 'matcha-gallery' ) }
							</div>
						) : (
							<RangeControl
								label={ __( 'Columns (Desktop)', 'matcha-gallery' ) }
								value={ columns }
								onChange={ ( value ) => setAttributes( { columns: value } ) }
								min={ 1 }
								max={ 6 }
							/>
						) ) }

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
					</>
				) }
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
