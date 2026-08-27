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
				title={ __( '🍵 Matcha Studio Gallery', 'matcha-gallery' ) }
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
						{ label: __( 'Grid', 'matcha-gallery' ), value: 'grid' },
						{ label: __( 'Masonry', 'matcha-gallery' ), value: 'masonry' },
					] }
					onChange={ ( value ) => setAttributes( { layout: value } ) }
				/>

				<RangeControl
					label={ __( 'Columns (Desktop)', 'matcha-gallery' ) }
					value={ columns }
					onChange={ ( value ) => setAttributes( { columns: value } ) }
					min={ 1 }
					max={ 6 }
				/>

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

			{ /* Filters Panel */ }
			<PanelBody
				title={ __( 'Filters', 'matcha-gallery' ) }
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
			</PanelBody>
		</InspectorControls>
	);
}
