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
					this.applyPagination( true );
				} );
			}

			if ( this.paginationType === 'infinite' && this.loadMoreBtn ) {
				const observer = new IntersectionObserver( ( entries ) => {
					if ( entries[ 0 ].isIntersecting && this.hasMoreItems ) {
						this.currentPage++;
						this.applyPagination( true );
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
			// 1. FIRST: Capture starting layout rects of all visible items
			const firstRects = new Map();
			if ( ! prefersReducedMotion ) {
				this.items.forEach( ( item ) => {
					if ( ! item.classList.contains( 'matcha-gallery__item--hidden' ) &&
					     ! item.classList.contains( 'is-paginated-hidden' ) ) {
						firstRects.set( item, item.getBoundingClientRect() );
					}
				} );
			}

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
				} else {
					item.classList.add( 'matcha-gallery__item--hidden' );
				}
			} );

			// Apply pagination to visible subset
			this.applyPagination( false );

			// 2. LAST & INVERT & PLAY: Smooth FLIP transition for surviving and repositioned items
			if ( ! prefersReducedMotion && firstRects.size > 0 ) {
				const lastRects = new Map();
				this.items.forEach( ( item ) => {
					if ( ! item.classList.contains( 'matcha-gallery__item--hidden' ) &&
					     ! item.classList.contains( 'is-paginated-hidden' ) ) {
						lastRects.set( item, item.getBoundingClientRect() );
					}
				} );

				// INVERT: Calculate deltas and apply inverse translations
				lastRects.forEach( ( lastRect, item ) => {
					const firstRect = firstRects.get( item );
					if ( firstRect ) {
						const dx = firstRect.left - lastRect.left;
						const dy = firstRect.top - lastRect.top;
						if ( Math.abs( dx ) > 0.5 || Math.abs( dy ) > 0.5 ) {
							item.style.transition = 'none';
							item.style.transform = `translate3d(${ dx }px, ${ dy }px, 0)`;
						}
					} else {
						// Newly revealed item entering
						item.style.transition = 'none';
						item.style.transform = 'translate3d(0, 16px, 0) scale(0.95)';
						item.style.opacity = '0';
					}
				} );

				// PLAY: Animate smoothly to natural position
				requestAnimationFrame( () => {
					requestAnimationFrame( () => {
						lastRects.forEach( ( _, item ) => {
							item.style.transition = 'transform 0.4s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.35s ease';
							item.style.transform = '';
							item.style.opacity = '1';
						} );
					} );
				} );

				clearTimeout( this.flipResetTimer );
				this.flipResetTimer = setTimeout( () => {
					this.items.forEach( ( item ) => {
						item.style.transition = '';
						item.style.transform = '';
					} );
				}, 450 );
			}
		}

		applyPagination( isLoadMore = false ) {
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

				let staggerIdx = 0;

				visibleItems.forEach( ( item, idx ) => {
					if ( idx < limit ) {
						const wasHidden = item.classList.contains( 'is-paginated-hidden' );
						item.classList.remove( 'is-paginated-hidden' );

						// Staggered cascade entrance for newly revealed items
						if ( isLoadMore && wasHidden && ! prefersReducedMotion ) {
							item.classList.add( 'matcha-gallery__item--entering' );
							item.style.transitionDelay = `${ staggerIdx * 45 }ms`;
							staggerIdx++;

							requestAnimationFrame( () => {
								requestAnimationFrame( () => {
									item.classList.remove( 'matcha-gallery__item--entering' );
								} );
							} );
						}
					} else {
						item.classList.add( 'is-paginated-hidden' );
					}
				} );

				if ( isLoadMore && staggerIdx > 0 ) {
					setTimeout( () => {
						visibleItems.forEach( ( item ) => {
							item.style.transitionDelay = '';
						} );
					}, staggerIdx * 45 + 400 );
				}

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
				const handleItemAction = ( e ) => {
					if (
						e.target.closest( '.matcha-gallery__proof-btn' ) ||
						e.target.closest( '.matcha-gallery__bar-btn' ) ||
						e.target.closest( '.matcha-gallery__corner-badge' ) ||
						e.target.closest( '.matcha-gallery__action-btn--link' ) ||
						e.target.closest( '.matcha-gallery__action-btn--shop' ) ||
						e.target.closest( '.matcha-action-btn--link' )
					) {
						return;
					}

					const clickedMedia = !! e.target.closest( '.matcha-action-btn--media' );

					// Mobile Tap to Reveal: on touch screens, first tap reveals the overlay/caption/actions
					if ( this.el.dataset.mobileTap === 'reveal' && ! clickedMedia ) {
						const isTouch = window.matchMedia( '(pointer: coarse)' ).matches || 'ontouchstart' in window;
						if ( isTouch && ! item.classList.contains( 'is-touch-revealed' ) ) {
							this.items.forEach( ( it ) => it.classList.remove( 'is-touch-revealed' ) );
							item.classList.add( 'is-touch-revealed' );

							const onDocTap = ( docEvt ) => {
								if ( ! item.contains( docEvt.target ) ) {
									item.classList.remove( 'is-touch-revealed' );
									document.removeEventListener( 'click', onDocTap );
									document.removeEventListener( 'touchend', onDocTap );
								}
							};
							setTimeout( () => {
								document.addEventListener( 'click', onDocTap );
								document.addEventListener( 'touchend', onDocTap );
							}, 60 );
							return;
						}
					}

					// Direct URL click action bypasses lightbox (unless media button was explicitly clicked)
					if ( ! clickedMedia && item.dataset.clickAction === 'direct' && item.dataset.shopUrl ) {
						const target = item.dataset.shopTarget || '_self';
						if ( target === '_blank' ) {
							window.open( item.dataset.shopUrl, '_blank', 'noopener,noreferrer' );
						} else {
							window.location.href = item.dataset.shopUrl;
						}
						return;
					}

					this.openLightbox( index );
				};

				item.addEventListener( 'click', handleItemAction );

				item.setAttribute( 'tabindex', '0' );
				item.setAttribute( 'role', 'button' );
				item.addEventListener( 'keydown', ( e ) => {
					if ( e.key === 'Enter' || e.key === ' ' ) {
						e.preventDefault();
						handleItemAction( e );
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
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
						</button>
						<button class="matcha-lb-tool matcha-lb-fullscreen" type="button" aria-label="Toggle Fullscreen" title="Fullscreen (F)">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
						</button>
						<a class="matcha-lb-tool matcha-lb-download" href="" download target="_blank" aria-label="Download image" title="Download">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
						</a>
						<button class="matcha-lb-tool matcha-lb-close" type="button" aria-label="Close lightbox" title="Close (Esc)">
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
						</button>
					</div>
				</header>

				<!-- Nav Arrows -->
				<button class="matcha-lightbox__nav matcha-lightbox__prev" type="button" aria-label="Previous image" title="Previous (←)">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
				</button>
				<button class="matcha-lightbox__nav matcha-lightbox__next" type="button" aria-label="Next image" title="Next (→)">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
				</button>

				<!-- Center Stage -->
				<main class="matcha-lightbox__stage">
					<div class="matcha-lightbox__image-wrap">
						<img class="matcha-lightbox__img" src="" alt="" />
					</div>
					<div class="matcha-lightbox__caption-bar">
						<div class="matcha-lightbox__title"></div>
						<div class="matcha-lightbox__caption"></div>
						<div class="matcha-lightbox__shop"></div>
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
				.addEventListener( 'click', () => {
					const inst = MatchaGallery.activeInstance || this;
					inst.closeLightbox();
				} );
			this.lightbox
				.querySelector( '.matcha-lightbox__backdrop' )
				.addEventListener( 'click', () => {
					const inst = MatchaGallery.activeInstance || this;
					inst.closeLightbox();
				} );
			this.lightbox
				.querySelector( '.matcha-lightbox__prev' )
				.addEventListener( 'click', ( e ) => {
					e.stopPropagation();
					const inst = MatchaGallery.activeInstance || this;
					inst.prevImage();
				} );
			this.lightbox
				.querySelector( '.matcha-lightbox__next' )
				.addEventListener( 'click', ( e ) => {
					e.stopPropagation();
					const inst = MatchaGallery.activeInstance || this;
					inst.nextImage();
				} );

			// Zoom toggle
			const zoomBtn = this.lightbox.querySelector( '.matcha-lb-zoom' );
			const imgWrap = this.lightbox.querySelector( '.matcha-lightbox__image-wrap' );
			zoomBtn.addEventListener( 'click', () => {
				const inst = MatchaGallery.activeInstance || this;
				inst.toggleZoom();
			} );
			imgWrap.addEventListener( 'click', ( e ) => {
				if ( e.target.tagName === 'IMG' ) {
					const inst = MatchaGallery.activeInstance || this;
					inst.toggleZoom();
				}
			} );

			// Fullscreen toggle
			const fsBtn = this.lightbox.querySelector( '.matcha-lb-fullscreen' );
			fsBtn.addEventListener( 'click', () => {
				const inst = MatchaGallery.activeInstance || this;
				inst.toggleFullscreen();
			} );

			// Keyboard shortcuts
			document.addEventListener( 'keydown', ( e ) => {
				if ( this.lightbox.hasAttribute( 'hidden' ) ) return;
				const inst = MatchaGallery.activeInstance || this;
				if ( e.key === 'Escape' ) inst.closeLightbox();
				if ( e.key === 'ArrowLeft' ) inst.prevImage();
				if ( e.key === 'ArrowRight' ) inst.nextImage();
				if ( e.key.toLowerCase() === 'z' ) inst.toggleZoom();
				if ( e.key.toLowerCase() === 'f' ) inst.toggleFullscreen();
			} );

			// Mobile touch swipe gestures (with vertical guard & zoom guard)
			let touchStartX = 0;
			let touchStartY = 0;
			this.lightbox.addEventListener( 'touchstart', ( e ) => {
				const inst = MatchaGallery.activeInstance || this;
				if ( inst.isZoomed ) return;
				touchStartX = e.changedTouches[ 0 ].screenX;
				touchStartY = e.changedTouches[ 0 ].screenY;
			}, { passive: true } );

			this.lightbox.addEventListener( 'touchend', ( e ) => {
				const inst = MatchaGallery.activeInstance || this;
				if ( inst.isZoomed ) return;
				const touchEndX = e.changedTouches[ 0 ].screenX;
				const touchEndY = e.changedTouches[ 0 ].screenY;
				const diffX = touchStartX - touchEndX;
				const diffY = touchStartY - touchEndY;
				if ( Math.abs( diffX ) > 45 && Math.abs( diffX ) > Math.abs( diffY ) * 1.5 ) {
					if ( diffX > 0 ) {
						inst.nextImage();
					} else {
						inst.prevImage();
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

		lockScroll() {
			if ( MatchaGallery.isScrollLocked ) {
				return;
			}
			MatchaGallery.isScrollLocked = true;

			const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
			this.bodyOriginalPaddingRight = document.body.style.paddingRight || '';
			this.bodyOriginalOverflow = document.body.style.overflow || '';

			if ( scrollbarWidth > 0 ) {
				document.body.style.paddingRight = `${ scrollbarWidth }px`;
				document.documentElement.style.setProperty( '--matcha-scrollbar-width', `${ scrollbarWidth }px` );
			}
			document.body.style.overflow = 'hidden';
			document.documentElement.classList.add( 'matcha-lightbox-open' );
		}

		unlockScroll() {
			MatchaGallery.isScrollLocked = false;

			if ( this.bodyOriginalOverflow && this.bodyOriginalOverflow !== 'hidden' ) {
				document.body.style.overflow = this.bodyOriginalOverflow;
			} else {
				document.body.style.removeProperty( 'overflow' );
			}

			if ( this.bodyOriginalPaddingRight ) {
				document.body.style.paddingRight = this.bodyOriginalPaddingRight;
			} else {
				document.body.style.removeProperty( 'padding-right' );
			}

			document.documentElement.style.removeProperty( '--matcha-scrollbar-width' );
			document.documentElement.classList.remove( 'matcha-lightbox-open' );
		}

		preloadAdjacent( currentIndex ) {
			const toPreload = [ currentIndex - 1, currentIndex + 1 ];
			toPreload.forEach( ( idx ) => {
				if ( idx >= 0 && idx < this.items.length ) {
					const it = this.items[ idx ];
					const src = it.dataset.fullSrc || it.querySelector( 'img' )?.src;
					if ( src ) {
						const img = new Image();
						img.src = src;
					}
				}
			} );
		}

		parseVideoUrl( url ) {
			if ( ! url || typeof url !== 'string' ) return null;
			const trimmed = url.trim();

			// YouTube (watch, embed, youtu.be, shorts)
			const ytMatch = trimmed.match( /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i );
			if ( ytMatch && ytMatch[ 1 ] ) {
				return {
					type: 'youtube',
					embedUrl: `https://www.youtube-nocookie.com/embed/${ ytMatch[ 1 ] }?autoplay=1&rel=0&modestbranding=1`,
				};
			}

			// Vimeo (vimeo.com/ID)
			const vmMatch = trimmed.match( /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|))(\d+)/i );
			if ( vmMatch && vmMatch[ 1 ] ) {
				return {
					type: 'vimeo',
					embedUrl: `https://player.vimeo.com/video/${ vmMatch[ 1 ] }?autoplay=1&badge=0&autopause=0`,
				};
			}

			// Direct MP4 / WebM video
			if ( /\.(mp4|webm|ogg)(\?.*)?$/i.test( trimmed ) ) {
				return {
					type: 'video',
					src: trimmed,
				};
			}

			return null;
		}

		openLightbox( index, direction = 0 ) {
			MatchaGallery.activeInstance = this;
			this.currentIndex = index;
			const item = this.items[ index ];
			if ( ! item ) return;

			this.isZoomed = false;
			const imgWrap = this.lightbox.querySelector( '.matcha-lightbox__image-wrap' );
			imgWrap?.classList.remove( 'is-zoomed' );

			const fullSrc = item.dataset.fullSrc || item.querySelector( 'img' )?.src;
			const alt = item.querySelector( 'img' )?.alt || '';
			const title = item.dataset.title || '';
			const caption = item.dataset.caption || '';
			const shopUrl = item.dataset.shopUrl || '';
			const shopLabel = item.dataset.shopLabel || 'Shop Now';
			const shopPrice = item.dataset.shopPrice || '';
			const shopTarget = item.dataset.shopTarget || '_blank';
			const videoUrl = item.dataset.videoUrl || '';
			const videoParsed = videoUrl ? this.parseVideoUrl( videoUrl ) : null;

			const titleEl = this.lightbox.querySelector( '.matcha-lightbox__title' );
			const captionEl = this.lightbox.querySelector( '.matcha-lightbox__caption' );
			const shopEl = this.lightbox.querySelector( '.matcha-lightbox__shop' );
			const captionBar = this.lightbox.querySelector( '.matcha-lightbox__caption-bar' );
			const counterEl = this.lightbox.querySelector( '.matcha-lightbox__counter' );
			const downloadLink = this.lightbox.querySelector( '.matcha-lb-download' );
			const zoomBtn = this.lightbox.querySelector( '.matcha-lb-zoom' );

			if ( zoomBtn ) {
				zoomBtn.style.display = videoParsed ? 'none' : '';
			}

			const renderCaptionContent = () => {
				if ( titleEl ) {
					titleEl.textContent = title;
					titleEl.style.display = title ? 'block' : 'none';
				}
				if ( captionEl ) {
					captionEl.textContent = caption;
					captionEl.style.display = caption ? 'block' : 'none';
				}
				if ( shopEl ) {
					if ( shopUrl ) {
						const iconSvg = shopPrice
							? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>'
							: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>';
						shopEl.innerHTML = `
							<a href="${shopUrl}" target="${shopTarget}" rel="noopener noreferrer" class="matcha-lb-shop-btn">
								${iconSvg}
								<span>${shopLabel || (shopPrice ? 'Shop Now' : 'Visit Link')}</span>
								${shopPrice ? `<span class="matcha-lb-shop-price">${shopPrice}</span>` : ''}
							</a>
						`;
						shopEl.style.display = 'block';
					} else {
						shopEl.innerHTML = '';
						shopEl.style.display = 'none';
					}
				}
			};

			if ( imgWrap ) {
				if ( videoParsed ) {
					// Stop and purge previous media immediately
					imgWrap.innerHTML = '';
					const vContainer = document.createElement( 'div' );
					vContainer.className = 'matcha-lightbox__video-container';

					if ( videoParsed.type === 'youtube' || videoParsed.type === 'vimeo' ) {
						vContainer.innerHTML = `
							<iframe
								class="matcha-lightbox__video-iframe"
								src="${ videoParsed.embedUrl }"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								allowfullscreen
							></iframe>
						`;
					} else if ( videoParsed.type === 'video' ) {
						vContainer.innerHTML = `
							<video
								class="matcha-lightbox__video-player"
								src="${ videoParsed.src }"
								controls
								autoplay
								playsinline
							></video>
						`;
					}
					imgWrap.appendChild( vContainer );
				} else {
					// Photo Mode: Luxury zero-shift cross-dissolve transition
					const oldImgs = Array.from( imgWrap.querySelectorAll( '.matcha-lightbox__img, .matcha-lightbox__video-container' ) );

					if ( direction !== 0 && oldImgs.length > 0 ) {
						const newImg = document.createElement( 'img' );
						newImg.className = 'matcha-lightbox__img matcha-lightbox__img--incoming';
						newImg.alt = alt;
						newImg.style.transition = 'none';
						newImg.style.opacity = '0';
						newImg.style.transform = `translateX(${ direction * 16 }px)`;
						newImg.src = fullSrc;
						imgWrap.appendChild( newImg );

						const performTransition = () => {
							requestAnimationFrame( () => {
								requestAnimationFrame( () => {
									oldImgs.forEach( ( oldEl ) => {
										oldEl.classList.add( 'matcha-lightbox__img--exiting' );
										oldEl.style.pointerEvents = 'none';
										oldEl.style.transition = 'opacity 0.22s cubic-bezier(0.25, 1, 0.5, 1), transform 0.22s cubic-bezier(0.25, 1, 0.5, 1)';
										oldEl.style.opacity = '0';
										oldEl.style.transform = `translateX(${ -direction * 16 }px)`;
										setTimeout( () => {
											if ( oldEl.parentNode ) oldEl.remove();
										}, 240 );
									} );

									newImg.style.transition = 'opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)';
									newImg.style.opacity = '1';
									newImg.style.transform = 'none';
									newImg.classList.remove( 'matcha-lightbox__img--incoming' );
								} );
							} );
						};

						if ( newImg.complete && newImg.naturalWidth > 0 ) {
							performTransition();
						} else {
							newImg.onload = performTransition;
							newImg.onerror = () => {
								newImg.style.opacity = '1';
								newImg.style.transform = 'none';
								oldImgs.forEach( ( oldEl ) => oldEl.remove() );
							};
						}
					} else {
						imgWrap.innerHTML = '';
						const img = document.createElement( 'img' );
						img.className = 'matcha-lightbox__img';
						img.alt = alt;
						img.style.transition = 'none';
						img.style.opacity = '0';
						img.style.transform = 'none';
						img.src = fullSrc;
						imgWrap.appendChild( img );

						const onInitialReady = () => {
							requestAnimationFrame( () => {
								requestAnimationFrame( () => {
									img.style.transition = 'opacity 0.22s ease';
									img.style.opacity = '1';
								} );
							} );
						};

						if ( img.complete && img.naturalWidth > 0 ) {
							onInitialReady();
						} else {
							img.onload = onInitialReady;
						}
					}
				}
			}

			// Preload adjacent photos for instant response
			this.preloadAdjacent( index );

			// Smooth, instant caption cross-fade
			if ( captionBar ) {
				const hasContent = Boolean( title || caption || shopUrl );
				if ( ! hasContent ) {
					captionBar.style.opacity = '0';
					captionBar.style.display = 'none';
				} else {
					if ( direction !== 0 ) {
						captionBar.style.transition = 'opacity 0.15s ease';
						captionBar.style.opacity = '0';
						setTimeout( () => {
							renderCaptionContent();
							captionBar.style.display = 'block';
							requestAnimationFrame( () => {
								captionBar.style.opacity = '1';
							} );
						}, 150 );
					} else {
						renderCaptionContent();
						captionBar.style.display = 'block';
						captionBar.style.opacity = '1';
					}
				}
			}

			if ( downloadLink ) {
				downloadLink.href = fullSrc;
			}

			if ( counterEl ) {
				counterEl.textContent = `${ index + 1 } / ${ this.items.length }`;
			}

			// Render Bottom Filmstrip
			this.renderFilmstrip( index );

			this.lightbox.removeAttribute( 'hidden' );
			this.lightbox.classList.add( 'matcha-lightbox--open' );
			this.lightbox.classList.add( 'matcha-lightbox--active' );
			this.lockScroll();

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
					const targetIdx = parseInt( btn.dataset.index, 10 );
					if ( targetIdx === this.currentIndex ) return;
					const dir = targetIdx > this.currentIndex ? 1 : -1;
					this.openLightbox( targetIdx, dir );
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
			const lb = this.lightbox || document.querySelector( '.matcha-lightbox' );
			if ( lb ) {
				const imgWrap = lb.querySelector( '.matcha-lightbox__image-wrap' );
				if ( imgWrap ) {
					imgWrap.innerHTML = '';
				}
				lb.setAttribute( 'hidden', '' );
				lb.classList.remove( 'matcha-lightbox--open' );
				lb.classList.remove( 'matcha-lightbox--active' );
			}
			this.unlockScroll();
		}

		prevImage() {
			let idx = this.currentIndex - 1;
			while ( idx >= 0 && this.items[ idx ].classList.contains( 'matcha-gallery__item--hidden' ) ) {
				idx--;
			}
			if ( idx >= 0 ) this.openLightbox( idx, -1 );
		}

		nextImage() {
			let idx = this.currentIndex + 1;
			while ( idx < this.items.length && this.items[ idx ].classList.contains( 'matcha-gallery__item--hidden' ) ) {
				idx++;
			}
			if ( idx < this.items.length ) this.openLightbox( idx, 1 );
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
