/**
 * Matcha Gallery — Hub & Explorer Admin Script
 *
 * Handles tab switching, search filtering, layout filters,
 * 1-click shortcode copying, and deep linking via hash.
 *
 * @package Matcha_AI_Smart_Gallery
 */

(function() {
	'use strict';

	function initMatchaHub() {
		// 1. Copy button with toast feedback
		document.querySelectorAll('.matcha-copy-btn').forEach(function(btn) {
			btn.addEventListener('click', function(e) {
				e.stopPropagation();
				var text = btn.getAttribute('data-copy');
				if (navigator.clipboard && navigator.clipboard.writeText) {
					navigator.clipboard.writeText(text).then(function() {
						var original = btn.textContent;
						btn.textContent = '✓ Copied!';
						btn.style.background = '#22c55e';
						btn.style.color = '#052e16';
						setTimeout(function() {
							btn.textContent = original;
							btn.style.background = '';
							btn.style.color = '';
						}, 1500);
					}).catch(function() {
						fallbackCopy(text, btn);
					});
				} else {
					fallbackCopy(text, btn);
				}
			});
		});

		function fallbackCopy(text, btn) {
			var ta = document.createElement('textarea');
			ta.value = text;
			ta.style.position = 'fixed';
			ta.style.opacity = '0';
			document.body.appendChild(ta);
			ta.select();
			try {
				document.execCommand('copy');
				var orig = btn.textContent;
				btn.textContent = '✓ Copied!';
				setTimeout(function() { btn.textContent = orig; }, 1500);
			} catch (err) {
				console.error('Copy failed', err);
			}
			document.body.removeChild(ta);
		}

		// 2. Hub Tab Navigation
		var tabs = document.querySelectorAll('.matcha-hub-tab');
		var panels = document.querySelectorAll('.matcha-hub-panel');

		function switchTab(targetTab) {
			if (!targetTab) return;
			var matched = false;
			tabs.forEach(function(tab) {
				var tabTarget = tab.getAttribute('data-tab');
				if (tabTarget === targetTab) {
					tab.classList.add('is-active');
					matched = true;
				} else {
					tab.classList.remove('is-active');
				}
			});

			if (matched) {
				panels.forEach(function(panel) {
					if (panel.id === 'matcha-panel-' + targetTab) {
						panel.classList.add('is-active');
					} else {
						panel.classList.remove('is-active');
					}
				});
				if (history && history.replaceState) {
					history.replaceState(null, null, '#' + targetTab);
				}
			}
		}

		tabs.forEach(function(tab) {
			tab.addEventListener('click', function(e) {
				e.preventDefault();
				var target = tab.getAttribute('data-tab');
				switchTab(target);
			});
		});

		// Deep link tab from URL query param or hash if present
		var urlParams = new URLSearchParams(window.location.search);
		var initialTab = urlParams.get('tab') || (window.location.hash ? window.location.hash.replace('#', '') : '');
		if (initialTab) {
			switchTab(initialTab);
		}

		// 3. Search & Layout Filter Pills
		var searchInput = document.getElementById('matcha-hub-search');
		var filterPills = document.querySelectorAll('.matcha-filter-pill');
		var counter = document.getElementById('matcha-visible-count');
		var currentLayout = 'all';

		function filterGalleries() {
			var rows = document.querySelectorAll('#matcha-galleries-table tbody tr, .matcha-gallery-row');
			var term = (searchInput ? searchInput.value : '').toLowerCase().trim();
			var visibleCount = 0;
			rows.forEach(function(row) {
				var title = (row.getAttribute('data-title') || '').toLowerCase();
				var id = (row.getAttribute('data-id') || '').toLowerCase();
				var layout = (row.getAttribute('data-layout') || '').toLowerCase();
				var matchesTerm = !term || title.indexOf(term) !== -1 || id.indexOf(term) !== -1;
				var matchesLayout = currentLayout === 'all' || layout === currentLayout;
				if (matchesTerm && matchesLayout) {
					row.style.display = '';
					visibleCount++;
				} else {
					row.style.display = 'none';
				}
			});
			if (counter) {
				counter.textContent = 'Showing ' + visibleCount + ' ' + (visibleCount === 1 ? 'gallery' : 'galleries');
			}
		}

		if (searchInput) {
			searchInput.addEventListener('input', filterGalleries);
		}

		filterPills.forEach(function(pill) {
			pill.addEventListener('click', function() {
				filterPills.forEach(function(p) { p.classList.remove('is-active'); });
				pill.classList.add('is-active');
				currentLayout = pill.getAttribute('data-layout') || 'all';
				filterGalleries();
			});
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initMatchaHub);
	} else {
		initMatchaHub();
	}
})();
