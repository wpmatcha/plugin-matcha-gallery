/**
 * Edit component for the Smart Gallery block.
 *
 * Manages the editor experience: placeholder → configured state with live preview.
 *
 * @package matcha-gallery
 */

import { useBlockProps, BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';

import GalleryPlaceholder from './components/GalleryPlaceholder';
import GalleryPreview from './components/GalleryPreview';
import GalleryInspectorControls from './components/InspectorControls';
import apiFetch from '@wordpress/api-fetch';

/**
 * Editor component.
 *
 * @param {Object} props               Block props.
 * @param {Object} props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter.
 * @return {JSX.Element} Editor UI.
 */
export default function Edit( { attributes, setAttributes } ) {
	const {
		sourceType,
		imageIds,
		aiTags,
		layout,
		columns,
		gutterSize,
		showTitle,
		showCaption,
		galleryId,
	} = attributes;

	// If galleryId set, show linked state notice
	const studioUrl = galleryId ? `admin.php?page=matcha-studio&post=${galleryId}` : 'admin.php?page=matcha-studio';

	const [ studioConfig, setStudioConfig ] = useState( null );

	useEffect( () => {
		if ( galleryId > 0 ) {
			apiFetch( { path: `/matcha-gallery/v1/galleries/${ galleryId }` } )
				.then( ( data ) => {
					if ( data?.config ) {
						setStudioConfig( data.config );
					}
				} )
				.catch( () => setStudioConfig( null ) );
		} else {
			setStudioConfig( null );
		}
	}, [ galleryId ] );

	const effectiveImageIds = ( galleryId > 0 && studioConfig?.imageIds ) ? studioConfig.imageIds : imageIds;
	const effectiveLayout = ( galleryId > 0 && studioConfig?.layout ) ? studioConfig.layout : layout;

	const blockProps = useBlockProps( {
		className: `matcha-gallery-editor matcha-gallery-editor--${ effectiveLayout }`,
	} );

	// Fetch image data for selected IDs.
	const images = useSelect(
		( select ) => {
			if ( ( sourceType !== 'selected' && ! galleryId ) || ! effectiveImageIds?.length ) {
				return [];
			}
			const media = select( 'core' ).getEntityRecords( 'postType', 'attachment', {
				include: effectiveImageIds,
				per_page: Math.min( 100, effectiveImageIds.length ),
				orderby: 'include',
			} );
			return media || [];
		},
		[ sourceType, effectiveImageIds, galleryId ]
	);

	// Fetch images by AI tags (dynamic mode).
	const dynamicImages = useSelect(
		( select ) => {
			if ( sourceType !== 'dynamic' || ! aiTags.length || galleryId > 0 ) {
				return [];
			}
			const media = select( 'core' ).getEntityRecords( 'postType', 'attachment', {
				matcha_ai_keywords: aiTags.join( ',' ),
				per_page: 50,
				status: 'inherit',
			} );
			return media || [];
		},
		[ sourceType, aiTags, galleryId ]
	);

	const displayImages = ( galleryId > 0 || sourceType === 'selected' ) ? images : dynamicImages;
	const hasImages =
		( effectiveImageIds && effectiveImageIds.length > 0 ) ||
		( sourceType === 'dynamic' && aiTags.length > 0 );

	// Convert legacy inline block to CPT gallery
	const convertToGallery = async () => {
		try{
			const res = await apiFetch({ path:'/matcha-gallery/v1/galleries', method:'POST', data:{ title: 'Converted Gallery', config:{ sourceType, imageIds, aiTags, layout, columns, gutterSize } } });
			if(res?.id){ setAttributes({ galleryId: res.id }); }
		}catch(e){ console.error(e); }
	};

	return (
		<div { ...blockProps }>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon="art"
						label={ galleryId > 0 ? 'Edit Gallery in Matcha Studio' : 'Open Matcha Studio Builder' }
						onClick={ () => window.open( studioUrl, '_blank' ) }
					>
						{ galleryId > 0 ? 'Edit in Studio ↗' : 'Studio Builder ↗' }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<GalleryInspectorControls
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>
			{ galleryId > 0 ? (
				<div style={{padding:'10px 14px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'8px',marginBottom:'12px',fontSize:'12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
					<div>
						<strong style={{color:'#166534'}}>Matcha Studio Gallery #{galleryId}</strong>
						<span style={{marginLeft:'8px',color:'#15803d',fontSize:'11px'}}>({effectiveImageIds.length} photos)</span>
					</div>
					<a href={studioUrl} target="_blank" rel="noreferrer" style={{padding:'4px 10px',background:'#16a34a',color:'#fff',borderRadius:'4px',textDecoration:'none',fontWeight:700,fontSize:'11px'}}>Edit in Studio ↗</a>
				</div>
			) : ( imageIds.length>0 && <div style={{padding:'8px 10px',background:'#fff8e1',border:'1px solid #ffe082',borderRadius:'6px',marginBottom:'8px',fontSize:'12px'}}>
				Legacy inline block — <button type="button" className="button button-small" onClick={convertToGallery}>Convert to Matcha Studio Gallery</button>
			</div> ) }
			{ ! hasImages ? (
				<GalleryPlaceholder
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			) : (
				<GalleryPreview
					images={ displayImages }
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			) }
		</div>
	);
}
