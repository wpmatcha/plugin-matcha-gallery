/**
 * Matcha Gallery — Modern Frontend Runtime.
 *
 * Handles filtering, lightbox, anti-stacking zero-CLS loading,
 * and progressive pagination (Load More / Infinite Scroll / Pages).
 * Pure vanilla JS — zero jQuery, ultra-fast <15KB footprint.
 *
 * @package matcha-gallery
 */

( function () {
	'use strict';

	const prefersReducedMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches;

	/* =======================================================================
	   Gallery Controller
	   ======================================================================= */

	class MatchaGallery {
		/**
		 * @param {HTMLElement} el Root gallery element.
		 */
		constructor( el ) {
			this.el = el;
			this.grid = el.querySelector( '.matcha-gallery__grid' );
			this.filterBar = el.querySelector( '.matcha-gallery__filters' );
			this.items = Array.from(
				el.querySelectorAll( '.matcha-gallery__item' )
			);
			this.filterButtons = this.filterBar
				? Array.from( this.filterBar.querySelectorAll( '.matcha-filter' ) )
				: [];
			this.lightboxEnabled = el.dataset.lightbox !== 'false';
			this.activeFilter = '*';
			this.activeSection = '*';
			this.activeColor = '';
			this.searchQuery = '';

			this.init();
		}

		init() {
			if ( this.el.dataset.randomize === 'true' ) {
				this.shuffleItems();
			}

			this.bindImageLoading();
			this.buildTagMap();
			this.bindSections();
			this.bindFilters();
			this.bindSearch();
			this.bindColorSwatches();
			this.bindProofing();
			this.bindPagination();

			if ( this.el.dataset.frontendSort === 'true' ) {
				this.bindSort();
			}

			if ( this.lightboxEnabled ) {
				this.bindLightbox();
			}

			// Apply initial filtering and pagination
			this.applyFilters();

			// Staggered entrance animation.
			if ( ! prefersReducedMotion ) {
				this.animateEntrance();
			}
		}

		/* -------------------------------------------------------------------
		   Anti-Stacking & Zero-CLS Image Loader
		   ------------------------------------------------------------------- */

		bindImageLoading() {
			let loadedCount = 0;
			const total = this.items.length;
			const preloader = this.el.querySelector('.matcha-gallery-preloader');
			
			const checkComplete = () => {
				if (loadedCount >= total) {
					if (preloader) preloader.classList.add('is-hidden');
				}
			};

			if (total === 0) checkComplete();

			this.items.forEach( ( item ) => {
				const img = item.querySelector( 'img' );
				if ( ! img ) {
					loadedCount++;
					return;
				}
				if ( img.complete && img.naturalWidth > 0 ) {
					img.classList.add( 'is-loaded' );
					item.classList.add( 'is-loaded' );
					loadedCount++;
				} else {
					const onLoad = () => {
						img.classList.add( 'is-loaded' );
						item.classList.add( 'is-loaded' );
						loadedCount++;
						checkComplete();
					};
					img.addEventListener( 'load', onLoad, { once: true } );
					img.addEventListener( 'error', onLoad, { once: true } );
				}
			} );
			
			checkComplete();
			
			// Failsafe timeout in case images hang
			setTimeout(() => {
				if (preloader) preloader.classList.add('is-hidden');
			}, 3000);
		}

		/* -------------------------------------------------------------------
		   Tag Map
		   ------------------------------------------------------------------- */

		buildTagMap() {
			this.tagMap = {};
			this.items.forEach( ( item ) => {
				const tags = ( item.dataset.tags || '' )
					.split( /\s+/ )
					.filter( Boolean );
				tags.forEach( ( tag ) => {
					if ( ! this.tagMap[ tag ] ) {
						this.tagMap[ tag ] = [];
					}
					this.tagMap[ tag ].push( item );
				} );
			} );
		}

		/* -------------------------------------------------------------------
		   Filtering, Sections, Live Search & Proofing
		   ------------------------------------------------------------------- */

		bindSections() {
			this.sectionTabs = Array.from( this.el.querySelectorAll( '.matcha-section-tab' ) );
			this.sectionTabs.forEach( ( btn ) => {
				btn.addEventListener( 'click', () => {
					this.activeSection = btn.dataset.section;
					this.sectionTabs.forEach( ( b ) => {
						const isActive = b.dataset.section === this.activeSection;
						b.classList.toggle( 'matcha-section-tab--active', isActive );
						b.setAttribute( 'aria-selected', isActive ? 'true' : 'false' );
					} );
					this.currentPage = 1;
					this.applyFilters();
				} );
			} );
		}

		bindFilters() {
			this.filterLogic = this.filterBar ? (this.filterBar.dataset.filterLogic || 'or') : 'or';
			this.isMultiSelect = this.filterBar ? (this.filterBar.dataset.filterMultiselect === 'true') : false;
			this.activeFilters = new Set();
			
			if (!this.isMultiSelect) this.activeFilter = '*';

			this.filterButtons.forEach( ( btn ) => {
				btn.addEventListener( 'click', () => {
					this.setFilter( btn.dataset.filter );
				} );
			} );
		}

		bindSearch() {
			this.searchInput = this.el.querySelector( '.matcha-gallery__search-input' );
			if ( ! this.searchInput ) return;
			this.searchInput.addEventListener( 'input', ( e ) => {
				this.searchQuery = e.target.value.toLowerCase().trim();
				this.currentPage = 1;
				this.applyFilters();
			} );
		}

		bindColorSwatches() {
			this.colorButtons = Array.from( this.el.querySelectorAll( '.matcha-color-dot' ) );
			this.colorButtons.forEach( ( btn ) => {
				btn.addEventListener( 'click', () => {
					const hex = btn.dataset.color;
					if ( this.activeColor === hex ) {
						this.activeColor = '';
						btn.classList.remove( 'is-active' );
					} else {
						this.colorButtons.forEach( ( b ) => b.classList.remove( 'is-active' ) );
						this.activeColor = hex;
						btn.classList.add( 'is-active' );
					}
					this.currentPage = 1;
					this.applyFilters();
				} );
			} );
		}

		bindProofing() {
			this.proofButtons = Array.from( this.el.querySelectorAll( '.matcha-gallery__proof-btn' ) );
			this.favorites = new Set();
			this.tray = this.el.querySelector( '.matcha-gallery__favorites-tray' );
			this.favCount = this.el.querySelector( '.matcha-fav-count' );
			this.exportBtn = this.el.querySelector( '.matcha-gallery__export-btn' );

			this.proofButtons.forEach( ( btn ) => {
				btn.addEventListener( 'click', ( e ) => {
					e.stopPropagation();
					const id = btn.dataset.id;
					const icon = btn.querySelector( '.matcha-heart-icon' );
					if ( this.favorites.has( id ) ) {
						this.favorites.delete( id );
						btn.classList.remove( 'is-favorited' );
					} else {
						this.favorites.add( id );
						btn.classList.add( 'is-favorited' );
					}
					this.updateFavoritesTray();
				} );
			} );

			if ( this.exportBtn ) {
				this.exportBtn.addEventListener( 'click', () => {
					const list = Array.from( this.favorites );
					if ( ! list.length ) return;
					const text = 'Matcha Gallery Client Favorites:\n' + list.map( ( id ) => {
						const item = this.el.querySelector( `.matcha-gallery__item[data-id="${ id }"]` );
						const title = item?.dataset.title || `Attachment #${ id }`;
						return `- #${ id }: ${ title }`;
					} ).join( '\n' );

					navigator.clipboard.writeText( text );
					const orig = this.exportBtn.textContent;
					this.exportBtn.textContent = '✓ Copied!';
					setTimeout( () => { this.exportBtn.textContent = orig; }, 1500 );
				} );
			}
		}

		updateFavoritesTray() {
			if ( ! this.tray ) return;
			const count = this.favorites.size;
			if ( this.favCount ) this.favCount.textContent = count;
			if ( count > 0 ) {
				this.tray.classList.add( 'is-visible' );
			} else {
				this.tray.classList.remove( 'is-visible' );
			}
		}

		/* -------------------------------------------------------------------
		   Pagination Engine (Load More / Infinite Scroll / Pages)
		   ------------------------------------------------------------------- */

		bindPagination() {
			this.paginationType = this.el.dataset.pagination || 'none';
			this.perPage = parseInt( this.el.dataset.perPage || '12', 10 );
			this.currentPage = 1;
			this.loadMoreBtn = this.el.querySelector( '.matcha-gallery__load-more-btn' );
			this.paginationNav = this.el.querySelector( '.matcha-gallery__pagination' );

			if ( this.loadMoreBtn ) {
				this.loadMoreBtn.addEventListener( 'click', () => {
					this.currentPage++;
					this.applyPagination();
				} );
			}

			if ( this.paginationType === 'infinite' && this.loadMoreBtn ) {
				const observer = new IntersectionObserver( ( entries ) => {
					if ( entries[ 0 ].isIntersecting && this.hasMoreItems ) {
						this.currentPage++;
						this.applyPagination();
					}
				}, { rootMargin: '200px' } );
				observer.observe( this.loadMoreBtn );
			}
		}

		/* -------------------------------------------------------------------
		   Client-Side Shuffle (Randomize on Load - PRO)
		   ------------------------------------------------------------------- */

		shuffleItems() {
			if ( ! this.grid || this.items.length <= 1 ) return;
			for ( let i = this.items.length - 1; i > 0; i-- ) {
				const j = Math.floor( Math.random() * ( i + 1 ) );
				[ this.items[ i ], this.items[ j ] ] = [ this.items[ j ], this.items[ i ] ];
			}
			this.items.forEach( ( item ) => this.grid.appendChild( item ) );
		}

		/* -------------------------------------------------------------------
		   Visitor Interactive Sorting (PRO)
		   ------------------------------------------------------------------- */

		bindSort() {
			const sortSelect = this.el.querySelector( '.matcha-gallery__sort-select' );
			if ( ! sortSelect || ! this.grid ) return;

			// Store snapshot of initial DOM items order
			const initialOrder = [ ...this.items ];

			sortSelect.addEventListener( 'change', ( e ) => {
				const val = e.target.value;
				if ( val === 'default' ) {
					this.items = [ ...initialOrder ];
				} else if ( val === 'name-asc' ) {
					this.items.sort( ( a, b ) => {
						const nameA = ( a.dataset.title || '' ).toLowerCase();
						const nameB = ( b.dataset.title || '' ).toLowerCase();
						return nameA.localeCompare( nameB );
					} );
				} else if ( val === 'name-desc' ) {
					this.items.sort( ( a, b ) => {
						const nameA = ( a.dataset.title || '' ).toLowerCase();
						const nameB = ( b.dataset.title || '' ).toLowerCase();
						return nameB.localeCompare( nameA );
					} );
				} else if ( val === 'newest' ) {
					this.items.sort( ( a, b ) => {
						const dateA = parseInt( a.dataset.date || a.dataset.id || '0', 10 );
						const dateB = parseInt( b.dataset.date || b.dataset.id || '0', 10 );
						return dateB - dateA;
					} );
				} else if ( val === 'oldest' ) {
					this.items.sort( ( a, b ) => {
						const dateA = parseInt( a.dataset.date || a.dataset.id || '0', 10 );
						const dateB = parseInt( b.dataset.date || b.dataset.id || '0', 10 );
						return dateA - dateB;
					} );
				} else if ( val === 'random' ) {
					for ( let i = this.items.length - 1; i > 0; i-- ) {
						const j = Math.floor( Math.random() * ( i + 1 ) );
						[ this.items[ i ], this.items[ j ] ] = [ this.items[ j ], this.items[ i ] ];
					}
				}

				this.items.forEach( ( item ) => this.grid.appendChild( item ) );
				this.currentPage = 1;
				this.applyFilters();
			} );
		}

		setFilter( filter ) {
			if (this.isMultiSelect) {
				if (filter === '*') {
					this.activeFilters.clear();
				} else {
					if (this.activeFilters.has(filter)) {
						this.activeFilters.delete(filter);
					} else {
						this.activeFilters.add(filter);
					}
				}
			} else {
				this.activeFilter = filter;
			}
			this.currentPage = 1;

			// Update button states.
			if (this.isMultiSelect) {
				this.filterButtons.forEach( ( btn ) => {
					if (btn.dataset.filter === '*') {
						const isActive = this.activeFilters.size === 0;
						btn.classList.toggle( 'matcha-filter--active', isActive );
						btn.setAttribute( 'aria-pressed', isActive ? 'true' : 'false' );
					} else {
						const isActive = this.activeFilters.has(btn.dataset.filter);
						btn.classList.toggle( 'matcha-filter--active', isActive );
						btn.setAttribute( 'aria-pressed', isActive ? 'true' : 'false' );
					}
				} );
			} else {
				this.filterButtons.forEach( ( btn ) => {
					const isActive = btn.dataset.filter === filter;
					btn.classList.toggle( 'matcha-filter--active', isActive );
					btn.setAttribute( 'aria-pressed', isActive ? 'true' : 'false' );
				} );
			}

			this.applyFilters();
		}

		applyFilters() {
			let delay = 0;
			const q = this.searchQuery || '';
			const f = this.activeFilter || '*';
			const c = ( this.activeColor || '' ).toLowerCase();
			const sec = this.activeSection || '*';

			this.items.forEach( ( item ) => {
				const tags = ( item.dataset.tags || '' )
					.toLowerCase()
					.split( /\s+/ )
					.filter( Boolean );
				const colors = ( item.dataset.colors || '' )
					.toLowerCase()
					.split( ',' )
					.filter( Boolean );
				const sections = ( item.dataset.sections || '' )
					.split( /\s+/ )
					.filter( Boolean );
				const title = ( item.dataset.title || '' ).toLowerCase();
				const caption = ( item.dataset.caption || '' ).toLowerCase();
				const alt = ( item.querySelector( 'img' )?.alt || '' ).toLowerCase();

				const matchesSection = sec === '*' || sections.includes( sec );
				
				let matchesTag = true;
				if (this.isMultiSelect && this.activeFilters.size > 0) {
					if (this.filterLogic === 'and') {
						matchesTag = Array.from(this.activeFilters).every(t => tags.includes(t));
					} else {
						matchesTag = Array.from(this.activeFilters).some(t => tags.includes(t));
					}
				} else if (!this.isMultiSelect) {
					matchesTag = f === '*' || tags.includes( f );
				}
				
				const matchesSearch =
					! q ||
					tags.some( ( t ) => t.includes( q ) ) ||
					title.includes( q ) ||
					caption.includes( q ) ||
					alt.includes( q );
				const matchesColor = ! c || colors.includes( c );

				const isVisible = matchesSection && matchesTag && matchesSearch && matchesColor;

				if ( isVisible ) {
					item.classList.remove( 'matcha-gallery__item--hidden' );
					if ( ! prefersReducedMotion ) {
						item.style.transitionDelay = `${ delay * 25 }ms`;
						delay++;
					}
				} else {
					item.classList.add( 'matcha-gallery__item--hidden' );
					item.style.transitionDelay = '0ms';
				}
			} );

			// Clear transition delays after animation.
			if ( ! prefersReducedMotion ) {
				setTimeout( () => {
					this.items.forEach( ( item ) => {
						item.style.transitionDelay = '0ms';
					} );
				}, delay * 25 + 350 );
			}

			// Apply pagination to visible subset
			this.applyPagination();
		}

		applyPagination() {
			if ( ! this.paginationType || this.paginationType === 'none' ) {
				this.items.forEach( item => item.classList.remove( 'is-paginated-hidden' ) );
				if ( this.loadMoreBtn ) this.loadMoreBtn.parentElement.style.display = 'none';
				return;
			}

			const visibleItems = this.items.filter( ( item ) => ! item.classList.contains( 'matcha-gallery__item--hidden' ) );
			const total = visibleItems.length;

			if ( this.paginationType === 'pages' ) {
				const totalPages = Math.ceil( total / this.perPage ) || 1;
				if ( this.currentPage > totalPages ) this.currentPage = 1;

				const start = ( this.currentPage - 1 ) * this.perPage;
				const end = start + this.perPage;

				visibleItems.forEach( ( item, idx ) => {
					if ( idx >= start && idx < end ) {
						item.classList.remove( 'is-paginated-hidden' );
					} else {
						item.classList.add( 'is-paginated-hidden' );
					}
				} );

				this.renderPaginationNav( totalPages );
			} else if ( this.paginationType === 'load-more' || this.paginationType === 'infinite' ) {
				const limit = this.currentPage * this.perPage;
				this.hasMoreItems = limit < total;

				visibleItems.forEach( ( item, idx ) => {
					if ( idx < limit ) {
						item.classList.remove( 'is-paginated-hidden' );
					} else {
						item.classList.add( 'is-paginated-hidden' );
					}
				} );

				if ( this.loadMoreBtn ) {
					this.loadMoreBtn.parentElement.style.display = this.hasMoreItems ? 'flex' : 'none';
				}
			}
		}

		renderPaginationNav( totalPages ) {
			if ( ! this.paginationNav ) return;
			if ( totalPages <= 1 ) {
				this.paginationNav.innerHTML = '';
				return;
			}

			let html = '';
			for ( let p = 1; p <= totalPages; p++ ) {
				html += `<button type="button" class="matcha-page-btn ${ p === this.currentPage ? 'is-active' : '' }" data-page="${ p }">${ p }</button>`;
			}
			this.paginationNav.innerHTML = html;

			this.paginationNav.querySelectorAll( '.matcha-page-btn' ).forEach( ( btn ) => {
				btn.addEventListener( 'click', () => {
					this.currentPage = parseInt( btn.dataset.page, 10 );
					this.applyPagination();
					this.el.scrollIntoView( { behavior: 'smooth', block: 'start' } );
				} );
			} );
		}

		/* -------------------------------------------------------------------
		   Entrance Animation
		   ------------------------------------------------------------------- */

		animateEntrance() {
			this.items.forEach( ( item, i ) => {
				item.style.opacity = '0';
				item.style.transform = 'translateY(16px)';
				setTimeout( () => {
					item.style.transition =
						'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
					item.style.opacity = '1';
					item.style.transform = 'translateY(0)';
				}, i * 40 );
			} );
		}

		/* -------------------------------------------------------------------
		   Accessible Luxury Lightbox Engine
		   ------------------------------------------------------------------- */

		bindLightbox() {
			this.lightbox = document.querySelector( '.matcha-lightbox' );
			if ( ! this.lightbox ) {
				this.createLightbox();
			}

			this.items.forEach( ( item, index ) => {
				item.addEventListener( 'click', ( e ) => {
					if ( e.target.closest( '.matcha-gallery__proof-btn' ) || e.target.closest( '.matcha-gallery__shop-bar' ) ) {
						return;
					}
					this.openLightbox( index );
				} );

				item.setAttribute( 'tabindex', '0' );
				item.setAttribute( 'role', 'button' );
				item.addEventListener( 'keydown', ( e ) => {
					if ( e.key === 'Enter' || e.key === ' ' ) {
						e.preventDefault();
						this.openLightbox( index );
					}
				} );
			} );
		}

		createLightbox() {
			this.lightbox = document.createElement( 'div' );
			this.lightbox.className = 'matcha-lightbox';
			this.lightbox.setAttribute( 'role', 'dialog' );
			this.lightbox.setAttribute( 'aria-modal', 'true' );
			this.lightbox.setAttribute( 'aria-label', 'Image preview' );
			this.lightbox.setAttribute( 'hidden', '' );

			this.lightbox.innerHTML = `
				<div class="matcha-lightbox__backdrop"></div>

				<!-- Top Header Bar -->
				<header class="matcha-lightbox__header">
					<div class="matcha-lightbox__header-left">
						<span class="matcha-lightbox__counter"></span>
					</div>
					<div class="matcha-lightbox__header-right">
						<button class="matcha-lb-tool matcha-lb-zoom" type="button" aria-label="Toggle Zoom" title="Zoom In/Out (Z)">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
						</button>
						<button class="matcha-lb-tool matcha-lb-fullscreen" type="button" aria-label="Toggle Fullscreen" title="Fullscreen (F)">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
						</button>
						<a class="matcha-lb-tool matcha-lb-download" href="" download target="_blank" aria-label="Download image" title="Download">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
						</a>
						<button class="matcha-lb-tool matcha-lb-close" type="button" aria-label="Close lightbox" title="Close (Esc)">
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
						</button>
					</div>
				</header>

				<!-- Nav Arrows -->
				<button class="matcha-lightbox__nav matcha-lightbox__prev" type="button" aria-label="Previous image" title="Previous (←)">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
				</button>
				<button class="matcha-lightbox__nav matcha-lightbox__next" type="button" aria-label="Next image" title="Next (→)">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
				</button>

				<!-- Center Stage -->
				<main class="matcha-lightbox__stage">
					<div class="matcha-lightbox__image-wrap">
						<img class="matcha-lightbox__img" src="" alt="" />
					</div>
					<div class="matcha-lightbox__caption-bar">
						<div class="matcha-lightbox__title"></div>
						<div class="matcha-lightbox__caption"></div>
					</div>
				</main>

				<!-- Bottom Filmstrip (Borderless & Edge-to-Edge) -->
				<nav class="matcha-lightbox__filmstrip" aria-label="Gallery thumbnails">
					<div class="matcha-lightbox__thumbnails"></div>
				</nav>
			`;

			document.body.appendChild( this.lightbox );

			this.isZoomed = false;

			// Header actions
			this.lightbox
				.querySelector( '.matcha-lb-close' )
				.addEventListener( 'click', () => this.closeLightbox() );
			this.lightbox
				.querySelector( '.matcha-lightbox__backdrop' )
				.addEventListener( 'click', () => this.closeLightbox() );
			this.lightbox
				.querySelector( '.matcha-lightbox__prev' )
				.addEventListener( 'click', ( e ) => {
					e.stopPropagation();
					this.prevImage();
				} );
			this.lightbox
				.querySelector( '.matcha-lightbox__next' )
				.addEventListener( 'click', ( e ) => {
					e.stopPropagation();
					this.nextImage();
				} );

			// Zoom toggle
			const zoomBtn = this.lightbox.querySelector( '.matcha-lb-zoom' );
			const imgWrap = this.lightbox.querySelector( '.matcha-lightbox__image-wrap' );
			zoomBtn.addEventListener( 'click', () => this.toggleZoom() );
			imgWrap.addEventListener( 'click', ( e ) => {
				if ( e.target.tagName === 'IMG' ) {
					this.toggleZoom();
				}
			} );

			// Fullscreen toggle
			const fsBtn = this.lightbox.querySelector( '.matcha-lb-fullscreen' );
			fsBtn.addEventListener( 'click', () => this.toggleFullscreen() );

			// Keyboard shortcuts
			document.addEventListener( 'keydown', ( e ) => {
				if ( this.lightbox.hasAttribute( 'hidden' ) ) return;
				if ( e.key === 'Escape' ) this.closeLightbox();
				if ( e.key === 'ArrowLeft' ) this.prevImage();
				if ( e.key === 'ArrowRight' ) this.nextImage();
				if ( e.key.toLowerCase() === 'z' ) this.toggleZoom();
				if ( e.key.toLowerCase() === 'f' ) this.toggleFullscreen();
			} );

			// Mobile touch swipe gestures
			let touchStartX = 0;
			let touchEndX = 0;
			this.lightbox.addEventListener( 'touchstart', ( e ) => {
				touchStartX = e.changedTouches[ 0 ].screenX;
			}, { passive: true } );

			this.lightbox.addEventListener( 'touchend', ( e ) => {
				touchEndX = e.changedTouches[ 0 ].screenX;
				const diff = touchStartX - touchEndX;
				if ( Math.abs( diff ) > 45 ) {
					if ( diff > 0 ) {
						this.nextImage();
					} else {
						this.prevImage();
					}
				}
			}, { passive: true } );
		}

		toggleZoom() {
			this.isZoomed = ! this.isZoomed;
			const wrap = this.lightbox.querySelector( '.matcha-lightbox__image-wrap' );
			if ( this.isZoomed ) {
				wrap.classList.add( 'is-zoomed' );
			} else {
				wrap.classList.remove( 'is-zoomed' );
			}
		}

		toggleFullscreen() {
			if ( ! document.fullscreenElement ) {
				this.lightbox.requestFullscreen?.().catch( () => {} );
			} else {
				document.exitFullscreen?.().catch( () => {} );
			}
		}

		openLightbox( index ) {
			this.currentIndex = index;
			const item = this.items[ index ];
			if ( ! item ) return;

			this.isZoomed = false;
			this.lightbox.querySelector( '.matcha-lightbox__image-wrap' )?.classList.remove( 'is-zoomed' );

			const fullSrc = item.dataset.fullSrc || item.querySelector( 'img' )?.src;
			const alt = item.querySelector( 'img' )?.alt || '';
			const title = item.dataset.title || '';
			const caption = item.dataset.caption || '';

			const img = this.lightbox.querySelector( '.matcha-lightbox__img' );
			const titleEl = this.lightbox.querySelector( '.matcha-lightbox__title' );
			const captionEl = this.lightbox.querySelector( '.matcha-lightbox__caption' );
			const captionBar = this.lightbox.querySelector( '.matcha-lightbox__caption-bar' );
			const counterEl = this.lightbox.querySelector( '.matcha-lightbox__counter' );
			const downloadLink = this.lightbox.querySelector( '.matcha-lb-download' );

			if ( img ) {
				img.style.opacity = '0';
				img.style.transform = 'scale(0.97)';
				img.src = fullSrc;
				img.alt = alt;
				img.onload = () => {
					img.style.transition = 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
					img.style.opacity = '1';
					img.style.transform = 'scale(1)';
				};
			}

			if ( downloadLink ) {
				downloadLink.href = fullSrc;
			}

			if ( titleEl ) {
				titleEl.textContent = title;
				titleEl.style.display = title ? 'block' : 'none';
			}
			if ( captionEl ) {
				captionEl.textContent = caption;
				captionEl.style.display = caption ? 'block' : 'none';
			}
			if ( captionBar ) {
				captionBar.style.display = ( title || caption ) ? 'block' : 'none';
			}
			if ( counterEl ) {
				counterEl.textContent = `${ index + 1 } / ${ this.items.length }`;
			}

			// Render Bottom Filmstrip
			this.renderFilmstrip( index );

			this.lightbox.removeAttribute( 'hidden' );
			this.lightbox.classList.add( 'matcha-lightbox--open' );
			this.lightbox.classList.add( 'matcha-lightbox--active' );
			document.body.style.overflow = 'hidden';

			this.lightbox.querySelector( '.matcha-lb-close' )?.focus();
		}

		renderFilmstrip( activeIdx ) {
			const strip = this.lightbox.querySelector( '.matcha-lightbox__thumbnails' );
			if ( ! strip ) return;

			if ( this.items.length <= 1 ) {
				strip.parentElement.style.display = 'none';
				return;
			}
			strip.parentElement.style.display = 'flex';

			strip.innerHTML = this.items.map( ( it, i ) => {
				const thumbSrc = it.querySelector( 'img' )?.src || it.dataset.fullSrc;
				const isActive = i === activeIdx;
				return `
					<button type="button" class="matcha-lb-thumb ${ isActive ? 'is-active' : '' }" data-index="${ i }" aria-label="Photo ${ i + 1 }">
						<img src="${ thumbSrc }" alt="" loading="lazy" />
					</button>
				`;
			} ).join( '' );

			strip.querySelectorAll( '.matcha-lb-thumb' ).forEach( ( btn ) => {
				btn.addEventListener( 'click', () => {
					this.openLightbox( parseInt( btn.dataset.index, 10 ) );
				} );
			} );

			// Auto scroll active thumbnail into view
			const activeThumb = strip.querySelector( '.matcha-lb-thumb.is-active' );
			if ( activeThumb ) {
				activeThumb.scrollIntoView( { behavior: 'smooth', inline: 'center', block: 'nearest' } );
			}
		}

		closeLightbox() {
			if ( document.fullscreenElement ) {
				document.exitFullscreen?.().catch( () => {} );
			}
			this.lightbox.setAttribute( 'hidden', '' );
			this.lightbox.classList.remove( 'matcha-lightbox--open' );
			this.lightbox.classList.remove( 'matcha-lightbox--active' );
			document.body.style.overflow = '';
		}

		prevImage() {
			let idx = this.currentIndex - 1;
			while ( idx >= 0 && this.items[ idx ].classList.contains( 'matcha-gallery__item--hidden' ) ) {
				idx--;
			}
			if ( idx >= 0 ) this.openLightbox( idx );
		}

		nextImage() {
			let idx = this.currentIndex + 1;
			while ( idx < this.items.length && this.items[ idx ].classList.contains( 'matcha-gallery__item--hidden' ) ) {
				idx++;
			}
			if ( idx < this.items.length ) this.openLightbox( idx );
		}
	}

	/* =======================================================================
	   Auto-initialize all galleries on DOMContentLoaded
	   ======================================================================= */

	document.addEventListener( 'DOMContentLoaded', () => {
		document.querySelectorAll( '.matcha-gallery' ).forEach( ( el ) => {
			new MatchaGallery( el );
		} );
	} );

	window.MatchaGallery = MatchaGallery;
} )();
