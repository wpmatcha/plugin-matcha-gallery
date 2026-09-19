import { __ } from '@wordpress/i18n';
import { Placeholder, Button, ToggleControl, SelectControl } from '@wordpress/components';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { gallery as galleryIcon } from '@wordpress/icons';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * Placeholder state for the gallery block.
 *
 * @param {Object}   props                Block props.
 * @param {Object}   props.attributes     Block attributes.
 * @param {Function} props.setAttributes  Attribute setter.
 * @return {JSX.Element} Placeholder UI.
 */
export default function GalleryPlaceholder( { attributes, setAttributes } ) {
	const { sourceType, galleryId } = attributes;
	const [ studioGalleries, setStudioGalleries ] = useState( [] );

	useEffect( () => {
		apiFetch( { path: '/matcha-gallery/v1/galleries' } )
			.then( ( data ) => {
				if ( Array.isArray( data ) ) {
					setStudioGalleries( data );
				}
			} )
			.catch( () => setStudioGalleries( [] ) );
	}, [] );

	const onSelectImages = ( media ) => {
		const ids = media.map( ( img ) => img.id );
		setAttributes( {
			sourceType: 'selected',
			imageIds: ids,
			galleryId: 0,
		} );
	};

	const galleryOptions = [
		{ label: __( '-- Or Choose a Studio Gallery --', 'matcha-gallery' ), value: 0 },
		...studioGalleries.map( ( g ) => ( {
			label: `#${ g.id } — ${ g.title || 'Untitled Gallery' } (${ ( g.config?.imageIds || [] ).length } photos)`,
			value: g.id,
		} ) ),
	];

	return (
		<Placeholder
			icon={ galleryIcon }
			label={ __( 'Matcha AI Smart Gallery', 'matcha-gallery' ) }
			instructions={ __(
				'Link to a master gallery designed in Matcha Studio, select photos from your Media Library, or use dynamic AI tag-based sourcing.',
				'matcha-gallery'
			) }
			className="matcha-gallery-placeholder"
		>
			<div className="matcha-gallery-placeholder__actions" style={ { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '420px' } }>
				{ studioGalleries.length > 0 && (
					<div style={ { width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' } }>
						<SelectControl
							label={ __( 'Select Studio Gallery', 'matcha-gallery' ) }
							value={ galleryId || 0 }
							options={ galleryOptions }
							onChange={ ( val ) => {
								const numId = parseInt( val );
								if ( numId > 0 ) {
									setAttributes( { galleryId: numId } );
								}
							} }
						/>
					</div>
				) }

				<div style={ { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' } }>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ onSelectImages }
							allowedTypes={ [ 'image' ] }
							multiple
							gallery
							render={ ( { open } ) => (
								<Button
									variant="primary"
									onClick={ open }
									className="matcha-gallery-placeholder__btn"
								>
									{ __( 'Select Images', 'matcha-gallery' ) }
								</Button>
							) }
						/>
					</MediaUploadCheck>

					<a
						href="admin.php?page=matcha-studio"
						target="_blank"
						rel="noreferrer"
						className="components-button is-secondary"
						style={ { textDecoration: 'none' } }
					>
						{ __( 'Open Matcha Studio ↗', 'matcha-gallery' ) }
					</a>
				</div>

				<div className="matcha-gallery-placeholder__divider">
					<span>{ __( 'or dynamic mode', 'matcha-gallery' ) }</span>
				</div>

				<ToggleControl
					label={ __( 'Use dynamic source (AI tags)', 'matcha-gallery' ) }
					help={ __(
						'Automatically populate the gallery with images matching specific AI keywords.',
						'matcha-gallery'
					) }
					checked={ sourceType === 'dynamic' }
					onChange={ ( isDynamic ) =>
						setAttributes( {
							sourceType: isDynamic ? 'dynamic' : 'selected',
							galleryId: 0,
						} )
					}
				/>
			</div>
		</Placeholder>
	);
}
