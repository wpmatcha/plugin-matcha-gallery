/**
 * Gallery Preview component.
 *
 * Renders a live preview of the gallery in the editor.
 *
 * @package matcha-gallery
 */

import { __ } from '@wordpress/i18n';
import { Button, Spinner } from '@wordpress/components';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';

/**
 * Gallery preview in the block editor.
 *
 * @param {Object}   props               Component props.
 * @param {Array}    props.images        Image data from WP data store.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter.
 * @return {JSX.Element} Gallery preview.
 */
export default function GalleryPreview( { images, attributes, setAttributes } ) {
	const {
		sourceType,
		imageIds,
		layout,
		columns,
		gutterSize,
		showTitle,
		showCaption,
	} = attributes;

	if ( ! images || images.length === 0 ) {
		return (
			<div className="matcha-gallery-preview matcha-gallery-preview--loading">
				<Spinner />
				<p>{ __( 'Loading gallery preview…', 'matcha-gallery' ) }</p>
			</div>
		);
	}

	const gridStyle = {
		display: 'grid',
		gridTemplateColumns: `repeat(${ columns }, 1fr)`,
		gap: `${ gutterSize }px`,
	};

	const masonryStyle = {
		columnCount: columns,
		columnGap: `${ gutterSize }px`,
	};

	const onSelectImages = ( media ) => {
		setAttributes( {
			imageIds: media.map( ( img ) => img.id ),
		} );
	};

	/**
	 * Get the best available image URL for editor preview.
	 *
	 * @param {Object} image WP media object.
	 * @return {string} Image URL.
	 */
	const getPreviewUrl = ( image ) => {
		if ( image.media_details?.sizes?.medium_large?.source_url ) {
			return image.media_details.sizes.medium_large.source_url;
		}
		if ( image.media_details?.sizes?.medium?.source_url ) {
			return image.media_details.sizes.medium.source_url;
		}
		return image.source_url || '';
	};

	/**
	 * Get the alt text for an image.
	 *
	 * @param {Object} image WP media object.
	 * @return {string} Alt text.
	 */
	const getAlt = ( image ) => {
		return image.alt_text || image.title?.rendered || '';
	};

	return (
		<div className="matcha-gallery-preview">
			<div className="matcha-gallery-preview__toolbar">
				<span className="matcha-gallery-preview__count">
					{ images.length }{ ' ' }
					{ images.length === 1
						? __( 'image', 'matcha-gallery' )
						: __( 'images', 'matcha-gallery' ) }
				</span>

				{ sourceType === 'selected' && (
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ onSelectImages }
							allowedTypes={ [ 'image' ] }
							multiple
							gallery
							value={ imageIds }
							render={ ( { open } ) => (
								<Button
									variant="secondary"
									onClick={ open }
									size="small"
								>
									{ __( 'Edit Selection', 'matcha-gallery' ) }
								</Button>
							) }
						/>
					</MediaUploadCheck>
				) }
			</div>

			<div
				className={ `matcha-gallery-preview__grid matcha-gallery-preview__grid--${ layout }` }
				style={ layout === 'masonry' ? masonryStyle : gridStyle }
			>
				{ images.map( ( image ) => (
					<div
						key={ image.id }
						className="matcha-gallery-preview__item"
						style={
							layout === 'masonry'
								? { breakInside: 'avoid', marginBottom: `${ gutterSize }px` }
								: {}
						}
					>
						<img
							src={ getPreviewUrl( image ) }
							alt={ getAlt( image ) }
							className="matcha-gallery-preview__img"
						/>

						{ ( showTitle || showCaption ) && (
							<div className="matcha-gallery-preview__info">
								{ showTitle && image.title?.rendered && (
									<span className="matcha-gallery-preview__title">
										{ image.title.rendered }
									</span>
								) }
								{ showCaption && image.caption?.rendered && (
									<span
										className="matcha-gallery-preview__caption"
										dangerouslySetInnerHTML={ {
											__html: image.caption.rendered,
										} }
									/>
								) }
							</div>
						) }
					</div>
				) ) }
			</div>
		</div>
	);
}
