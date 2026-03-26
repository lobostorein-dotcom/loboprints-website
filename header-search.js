document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelector('.header-search-wrapper')) return;

  if (!document.getElementById('mobileUniformGridStyles')) {
    const gridStyle = document.createElement('style');
    gridStyle.id = 'mobileUniformGridStyles';
    gridStyle.textContent = `
      @media (max-width: 767.98px) {
        .uniform-card-grid {
          --bs-gutter-x: 0.75rem;
          --bs-gutter-y: 0.75rem;
        }

        .uniform-card-grid.row > * {
          width: 50%;
          max-width: 50%;
          flex: 0 0 50%;
        }

        .uniform-card-grid .card {
          border-radius: 0.85rem;
        }

        .uniform-card-grid .card-img-top {
          aspect-ratio: 1 / 1;
        }

        .uniform-card-grid .card-body {
          padding: 0.65rem 0.55rem 0.75rem;
        }

        .uniform-card-grid .card-title,
        .uniform-card-grid .card-title-button {
          font-size: 0.8rem;
          line-height: 1.25;
          min-height: calc(1.25em * 2);
        }

        .uniform-card-grid .btn,
        .uniform-card-grid .btn-outline-primary,
        .uniform-card-grid .card-title-button {
          font-size: 0.72rem;
          padding: 0.3rem 0.55rem;
          min-height: 30px;
        }
      }
    `;
    document.head.appendChild(gridStyle);
  }

  const productIndex = [
    { name: 'Cotton Basic Round Neck T-Shirt', url: 'tshirt1.html', image: 'images/basic plain white 05.jpg.jpeg', category: 'T-Shirts', tags: 'cotton basic round neck' },
    { name: 'Cotton Premium Round Neck T-Shirt (200 GSM)', url: 'tshirt2.html', image: 'images/primeum tshirt black colours 01.jpeg', category: 'T-Shirts', tags: 'cotton premium 200 gsm' },
    { name: 'Cotton Affordable Oversized T-Shirt (200 GSM)', url: 'tshirt3.html', image: 'images/oversized 200gsm tshirt ivory  images colours-01.jpeg', category: 'T-Shirts', tags: 'oversized cotton affordable' },
    { name: 'Cotton Premium Oversized T-Shirt (240 GSM)', url: 'tshirt4.html', image: 'images/240gsm oversize tshirt aqua blue  colours-01.jpeg', category: 'T-Shirts', tags: 'oversized premium 240 gsm' },
    { name: 'Cotton Affordable Polo T-Shirt', url: 'tshirt5.html', image: 'images/product-item-9.jpg', category: 'T-Shirts', tags: 'polo affordable' },
    { name: 'Cotton Premium Polo T-Shirt', url: 'tshirt6.html', image: 'images/product-item-10.jpg', category: 'T-Shirts', tags: 'polo premium' },
    { name: 'Polyester Basic Round Neck T-Shirt', url: 'tshirt7.html', image: 'images/product-item-7.jpg', category: 'T-Shirts', tags: 'polyester basic round neck' },
    { name: 'Polyester Premium Round Neck T-Shirt', url: 'tshirt8.html', image: 'images/product-item-8.jpg', category: 'T-Shirts', tags: 'polyester premium round neck' },
    { name: 'Polyester Basic Polo T-Shirt', url: 'tshirt9.html', image: 'images/product-item-9.jpg', category: 'T-Shirts', tags: 'polyester basic polo' },
    { name: 'Polyester Premium Polo T-Shirt', url: 'tshirt10.html', image: 'images/product-item-10.jpg', category: 'T-Shirts', tags: 'polyester premium polo' },
    { name: 'Hoodies', url: 'hoodies.html', image: 'images/Hoodies.jpeg', category: 'Category', tags: 'hoodie sweatshirt zipper' },
    { name: 'Trackpants', url: 'trackpants.html', image: 'images/Trackpants.jpeg', category: 'Category', tags: 'track pant lower' },
    { name: 'Shorts', url: 'shorts.html', image: 'images/Shorts.jpeg', category: 'Category', tags: 'sports shorts' },
    { name: 'Badges', url: 'badges.html', image: 'images/badges.jpeg', category: 'Category', tags: 'badges pins' },
    { name: 'Jerseys', url: 'jerseys.html', image: 'images/tshirts.jpeg', category: 'Category', tags: 'sports jersey sublimation' },
    { name: 'Jackets', url: 'jackets.html', image: 'images/Hoodies.jpeg', category: 'Category', tags: 'jacket zipper' },
      { name: 'Zipper Jacket with Mesh', url: 'jacket2.html', image: 'images/zipper jacket with mesh orange 01.jpg', category: 'Jackets', tags: 'zipper jacket mesh orange black sky blue' },
      { name: 'Caps', url: 'caps.html', image: 'images/Caps.jpeg', category: 'Category', tags: 'caps baseball dad mesh trucker' },
      { name: 'Baseball Cap', url: 'cap1.html', image: 'images/baseball cap.jpg', category: 'Caps', tags: 'baseball cap adjustable' },
      { name: 'Dad Cap', url: 'cap2.html', image: 'images/dad cap.jpg', category: 'Caps', tags: 'dad cap unstructured' },
      { name: 'Mesh Cap', url: 'cap3.html', image: 'images/mesh cap.jpg', category: 'Caps', tags: 'mesh cap breathable' },
      { name: 'Trucker Cap', url: 'cap4.html', image: 'images/Trucker cap.jpg', category: 'Caps', tags: 'trucker cap snapback foam' },
    { name: 'ID Cards', url: 'ids.html', image: 'images/idcards.jpeg', category: 'Category', tags: 'id lanyards holders' },
    { name: 'Mugs', url: 'mugs.html', image: 'images/product-item-9.jpg', category: 'Category', tags: 'mug print gift' },
    { name: 'All Categories', url: 'categories.html', image: 'images/tshirts.jpeg', category: 'Category', tags: 'all products browse' }
  ];

  const pathPrefix = window.location.pathname.indexOf('/customizer-tool/') !== -1 ? '../' : '';
  const resolveLocalUrl = function (url) {
    if (!url) return url;
    if (/^(https?:|mailto:|tel:|#|\/)/i.test(url)) return url;
    if (url.indexOf('../') === 0 || url.indexOf('./') === 0) return url;
    return pathPrefix + url;
  };

  const navbarContainer = document.querySelector('.navbar .container');
  const collapse = navbarContainer ? navbarContainer.querySelector('.navbar-collapse') : null;
  const toggler = navbarContainer ? navbarContainer.querySelector('.navbar-toggler') : null;
  if (!collapse) return;

  const findBreadcrumbList = function (node) {
    if (!node || typeof node !== 'object') return null;

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i += 1) {
        const found = findBreadcrumbList(node[i]);
        if (found) return found;
      }
      return null;
    }

    if (node['@type'] === 'BreadcrumbList' && Array.isArray(node.itemListElement)) {
      return node;
    }

    const keys = Object.keys(node);
    for (let i = 0; i < keys.length; i += 1) {
      const found = findBreadcrumbList(node[keys[i]]);
      if (found) return found;
    }

    return null;
  };

  const renderVisibleBreadcrumbs = function () {
    if (document.querySelector('.site-breadcrumb')) return;

    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    let breadcrumbData = null;

    jsonLdScripts.forEach(function (script) {
      if (breadcrumbData) return;
      try {
        const parsed = JSON.parse(script.textContent || '{}');
        const found = findBreadcrumbList(parsed);
        if (found) breadcrumbData = found;
      } catch (e) {
        // Ignore malformed JSON-LD blocks and keep scanning.
      }
    });

    if (!breadcrumbData || !breadcrumbData.itemListElement || breadcrumbData.itemListElement.length < 2) {
      return;
    }

    const nav = document.createElement('nav');
    nav.className = 'site-breadcrumb';
    nav.setAttribute('aria-label', 'breadcrumb');

    const container = document.createElement('div');
    container.className = 'container';

    const list = document.createElement('ol');
    list.className = 'site-breadcrumb-list';

    breadcrumbData.itemListElement.forEach(function (entry, index) {
      const item = document.createElement('li');
      const isLast = index === breadcrumbData.itemListElement.length - 1;
      const label = String(entry.name || '').trim();
      const entryUrl = entry.item;

      item.className = 'site-breadcrumb-item' + (isLast ? ' active' : '');

      if (!isLast && entryUrl) {
        const link = document.createElement('a');
        try {
          // Strip site domain to get the relative path (e.g. 'categories.html')
          var siteBase = 'https://loboprints.in/';
          var relPath = entryUrl;
          if (entryUrl.indexOf(siteBase) === 0) {
            relPath = entryUrl.substring(siteBase.length);
          }
          if (!relPath) relPath = 'index.html';
          // Detect subdirectory depth from the navbar brand link
          var brandEl = document.querySelector('.navbar-brand');
          var prefix = '';
          if (brandEl) {
            var brandHref = brandEl.getAttribute('href') || '';
            var ups = (brandHref.match(/\.\.\//g) || []).length;
            for (var i = 0; i < ups; i++) prefix += '../';
          }
          link.href = prefix + relPath;
        } catch (e) {
          link.href = entryUrl;
        }
        link.textContent = label;
        item.appendChild(link);
      } else {
        item.textContent = label;
        item.setAttribute('aria-current', 'page');
      }

      list.appendChild(item);
    });

    container.appendChild(list);
    nav.appendChild(container);

    const navbar = document.querySelector('.navbar');
    if (navbar && navbar.parentNode) {
      navbar.parentNode.insertBefore(nav, navbar.nextSibling);
      var navbarHeight = navbar.offsetHeight;
      var bodyPaddingTop = parseInt(getComputedStyle(document.body).paddingTop, 10) || 0;
      nav.style.marginTop = Math.max(0, navbarHeight - bodyPaddingTop) + 'px';
      // The next sibling after the breadcrumb had an inline margin-top to clear
      // the fixed navbar. Now that the breadcrumb handles that offset, remove it.
      var nextEl = nav.nextElementSibling;
      if (nextEl && nextEl.style.marginTop) {
        nextEl.style.marginTop = '';
      }
    }
  };

  const originalToggleAttr = toggler ? toggler.getAttribute('data-bs-toggle') : null;
  const originalTargetAttr = toggler ? toggler.getAttribute('data-bs-target') : null;
  const originalControlsAttr = toggler ? toggler.getAttribute('aria-controls') : null;

  const isMobileDrawerViewport = function () {
    return window.matchMedia('(max-width: 768px)').matches;
  };

  const normalizeText = function (value) {
    return (value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const searchWrapper = document.createElement('div');
  searchWrapper.className = 'header-search-wrapper';

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'header-search-toggle';
  toggleButton.setAttribute('aria-label', 'Search products');
  toggleButton.setAttribute('aria-expanded', 'false');
  toggleButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="16.65" y1="16.65" x2="21" y2="21"></line></svg>';

  const panel = document.createElement('div');
  panel.className = 'header-search-panel';

  const form = document.createElement('form');
  form.className = 'header-product-search';
  form.setAttribute('role', 'search');
  form.setAttribute('autocomplete', 'off');

  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'header-search-input';
  input.placeholder = 'Search products...';
  input.setAttribute('aria-label', 'Search products');

  const dropdown = document.createElement('div');
  dropdown.className = 'header-search-dropdown';

  form.appendChild(input);
  panel.appendChild(form);
  panel.appendChild(dropdown);
  searchWrapper.appendChild(toggleButton);
  searchWrapper.appendChild(panel);

  navbarContainer.appendChild(searchWrapper);

  const drawerOverlay = document.createElement('div');
  drawerOverlay.className = 'mobile-drawer-overlay';
  document.body.appendChild(drawerOverlay);

  const drawerCloseButton = document.createElement('button');
  drawerCloseButton.type = 'button';
  drawerCloseButton.className = 'mobile-drawer-close';
  drawerCloseButton.setAttribute('aria-label', 'Close menu');
  drawerCloseButton.innerHTML = '&times;';
  collapse.insertBefore(drawerCloseButton, collapse.firstChild);

  const openDrawer = function () {
    if (!isMobileDrawerViewport()) return;
    collapse.classList.add('mobile-drawer-enabled', 'mobile-drawer-active');
    document.body.classList.add('mobile-drawer-open');
    if (toggler) {
      toggler.setAttribute('aria-expanded', 'true');
    }
  };

  const closeDrawer = function () {
    collapse.classList.remove('mobile-drawer-active');
    document.body.classList.remove('mobile-drawer-open');
    if (toggler) {
      toggler.setAttribute('aria-expanded', 'false');
    }
  };

  const syncDrawerMode = function () {
    if (isMobileDrawerViewport()) {
      collapse.classList.add('mobile-drawer-enabled');
      if (toggler) {
        toggler.removeAttribute('data-bs-toggle');
        toggler.removeAttribute('data-bs-target');
      }
    } else {
      collapse.classList.remove('mobile-drawer-enabled', 'mobile-drawer-active');
      document.body.classList.remove('mobile-drawer-open');
      if (toggler) {
        if (originalToggleAttr !== null) {
          toggler.setAttribute('data-bs-toggle', originalToggleAttr);
        }
        if (originalTargetAttr !== null) {
          toggler.setAttribute('data-bs-target', originalTargetAttr);
        }
        if (originalControlsAttr !== null) {
          toggler.setAttribute('aria-controls', originalControlsAttr);
        }
      }
    }
  };

  const setPanelPosition = function () {
    const rect = toggleButton.getBoundingClientRect();
    const panelWidth = window.innerWidth < 992 ? Math.min(window.innerWidth - 24, 380) : 360;
    const left = Math.min(Math.max(12, rect.right - panelWidth), window.innerWidth - panelWidth - 12);
    const top = rect.bottom + 8;

    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    panel.style.width = panelWidth + 'px';
  };

  const openSearch = function () {
    setPanelPosition();
    searchWrapper.classList.add('open');
    toggleButton.setAttribute('aria-expanded', 'true');
    input.focus();
    if (input.value.trim()) {
      searchItems(input.value);
    }
  };

  const closeSearch = function () {
    searchWrapper.classList.remove('open');
    toggleButton.setAttribute('aria-expanded', 'false');
    hideDropdown();
  };

  const hideDropdown = function () {
    dropdown.classList.remove('show');
    dropdown.innerHTML = '';
  };

  const renderResults = function (items) {
    if (!items.length) {
      const fallbackItems = productIndex.slice(0, 6);
      dropdown.innerHTML = fallbackItems.map(function (item) {
        return '<a class="header-search-item" href="' + resolveLocalUrl(item.url) + '">' +
          '<img src="' + resolveLocalUrl(item.image) + '" alt="' + item.name + '">' +
          '<span class="header-search-meta">' +
          '<strong>' + item.name + '</strong>' +
          '<small>' + item.category + '</small>' +
          '</span>' +
          '</a>';
      }).join('') + '<a class="header-search-item header-search-empty" href="' + resolveLocalUrl('categories.html') + '"><span>Browse all categories</span></a>';
      dropdown.classList.add('show');
      return;
    }

    dropdown.innerHTML = items.map(function (item) {
      return '<a class="header-search-item" href="' + resolveLocalUrl(item.url) + '">' +
        '<img src="' + resolveLocalUrl(item.image) + '" alt="' + item.name + '">' +
        '<span class="header-search-meta">' +
        '<strong>' + item.name + '</strong>' +
        '<small>' + item.category + '</small>' +
        '</span>' +
        '</a>';
    }).join('');

    dropdown.classList.add('show');
  };

  const searchItems = function (query) {
    const q = normalizeText(query);
    if (!q) {
      hideDropdown();
      return [];
    }

    const tokens = q.split(' ').filter(Boolean);

    const ranked = productIndex.map(function (item) {
      const blob = normalizeText(item.name + ' ' + item.category + ' ' + item.tags);
      const nameBlob = normalizeText(item.name);
      const words = blob.split(' ');

      let matchedTokens = 0;
      let score = 0;

      tokens.forEach(function (token) {
        if (words.some(function (word) { return word === token; })) {
          matchedTokens += 1;
          score += 8;
          return;
        }

        if (words.some(function (word) { return word.startsWith(token); })) {
          matchedTokens += 1;
          score += 6;
          return;
        }

        if (blob.includes(token)) {
          matchedTokens += 1;
          score += 4;
        }
      });

      if (blob.includes(q)) score += 7;
      if (nameBlob.startsWith(q)) score += 6;
      if (nameBlob.includes(q)) score += 4;

      const isMatch = matchedTokens > 0;

      return {
        item: item,
        score: score,
        matchedTokens: matchedTokens,
        isMatch: isMatch
      };
    });

    const results = ranked
      .filter(function (entry) { return entry.isMatch; })
      .sort(function (a, b) {
        if (b.matchedTokens !== a.matchedTokens) return b.matchedTokens - a.matchedTokens;
        return b.score - a.score;
      })
      .slice(0, 7)
      .map(function (entry) { return entry.item; });

    renderResults(results);
    return results;
  };

  input.addEventListener('input', function () {
    searchItems(input.value);
  });

  input.addEventListener('focus', function () {
    if (!searchWrapper.classList.contains('open')) {
      openSearch();
      return;
    }

    if (input.value.trim()) {
      searchItems(input.value);
    }
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const results = searchItems(input.value);
    if (results.length) {
      window.location.href = resolveLocalUrl(results[0].url);
    } else {
      window.location.href = resolveLocalUrl('categories.html');
    }
  });

  toggleButton.addEventListener('click', function () {
    if (searchWrapper.classList.contains('open')) {
      closeSearch();
      return;
    }
    openSearch();
  });

  if (toggler) {
    toggler.addEventListener('click', function (event) {
      if (!isMobileDrawerViewport()) return;

      event.preventDefault();
      event.stopPropagation();

      if (collapse.classList.contains('mobile-drawer-active')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  drawerOverlay.addEventListener('click', function () {
    closeDrawer();
  });

  drawerOverlay.addEventListener('touchend', function (event) {
    if (!isMobileDrawerViewport()) return;
    event.preventDefault();
    closeDrawer();
  }, { passive: false });

  drawerCloseButton.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    closeDrawer();
  });

  ['touchstart', 'touchend', 'click'].forEach(function (eventName) {
    collapse.addEventListener(eventName, function (event) {
      if (!isMobileDrawerViewport()) return;
      event.stopPropagation();
    }, { passive: false });
  });

  const handleDrawerLinkNavigation = function (event) {
    if (!isMobileDrawerViewport()) return;

    const tappedLink = event.target.closest('a[href]');
    if (!tappedLink) return;

    const href = tappedLink.getAttribute('href');
    if (!href || href === '#') return;

    event.preventDefault();
    event.stopPropagation();
    window.location.assign(tappedLink.href);
  };

  collapse.addEventListener('click', handleDrawerLinkNavigation);
  collapse.addEventListener('touchend', handleDrawerLinkNavigation, { passive: false });

  document.addEventListener('click', function (event) {
    if (!searchWrapper.contains(event.target)) {
      closeSearch();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSearch();
      closeDrawer();
      input.blur();
    }
  });

  window.addEventListener('resize', function () {
    syncDrawerMode();
    if (searchWrapper.classList.contains('open')) {
      setPanelPosition();
    }
  });

  window.addEventListener('scroll', function () {
    if (searchWrapper.classList.contains('open')) {
      setPanelPosition();
    }
  }, true);

  syncDrawerMode();
  renderVisibleBreadcrumbs();
});

document.addEventListener('DOMContentLoaded', function () {
  var WEBAPP_URL = 'https://script.google.com/macros/s/REMOVED_KEY_UPLOAD/exec';
  var MAX_FILE_SIZE = 10 * 1024 * 1024;

  if (document.querySelector('.upload-quote-modal')) {
    return;
  }

  var style = document.createElement('style');
  style.textContent = `
.upload-quote-overlay{position:fixed;inset:0;background:rgba(2,6,23,.62);backdrop-filter:blur(7px);z-index:12000;display:none;opacity:0;transition:opacity .25s ease}
.upload-quote-overlay.is-open{display:block;opacity:1}
.upload-quote-modal{position:fixed;left:50%;top:50%;transform:translate(-50%,-48%);width:min(820px,calc(100vw - 28px));max-height:calc(100vh - 28px);overflow:auto;background:linear-gradient(165deg,#ffffff 0%,#f8fbff 60%,#eef6ff 100%);border:1px solid rgba(148,163,184,.28);border-radius:22px;box-shadow:0 28px 72px rgba(2,6,23,.36);z-index:12001;display:none;opacity:0;transition:transform .24s ease,opacity .24s ease}
.upload-quote-modal.is-open{display:block;opacity:1;transform:translate(-50%,-50%)}
.upload-quote-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:24px 24px 10px}
.upload-quote-title-wrap h3{margin:0;font-size:1.56rem;letter-spacing:.01em;color:#0f172a}
.upload-quote-title-wrap p{margin:6px 0 0;color:#475569;font-size:.95rem}
.upload-quote-close{border:1px solid rgba(148,163,184,.45);background:#fff;color:#0f172a;border-radius:12px;padding:8px 12px;line-height:1;cursor:pointer}
.upload-quote-body{padding:0 24px 22px}
.upload-quote-guide{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0 14px}
.upload-quote-guide-card{border:1px solid rgba(148,163,184,.35);border-radius:14px;padding:11px 12px;background:rgba(255,255,255,.92)}
.upload-quote-guide-card strong{display:block;color:#0f172a;font-size:.9rem;margin-bottom:3px}
.upload-quote-guide-card span{font-size:.82rem;color:#475569;line-height:1.35}
.upload-quote-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.upload-quote-field{display:flex;flex-direction:column;gap:6px}
.upload-quote-field.full{grid-column:1 / -1}
.upload-quote-label{font-size:.86rem;font-weight:700;color:#334155}
.upload-quote-input,.upload-quote-textarea{border:1px solid rgba(148,163,184,.45);background:#fff;border-radius:12px;padding:11px 12px;color:#0f172a;outline:none;transition:border-color .2s ease,box-shadow .2s ease}
.upload-quote-input:focus,.upload-quote-textarea:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(59,130,246,.14)}
.upload-quote-textarea{min-height:112px;resize:vertical}
.upload-quote-help{font-size:.78rem;color:#64748b}
.upload-quote-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-top:16px}
.upload-quote-submit{border:1px solid #1e3a8a;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 52%,#2563eb 100%);color:#fff;padding:11px 18px;border-radius:12px;font-weight:700;letter-spacing:.01em;cursor:pointer}
.upload-quote-submit[disabled]{opacity:.65;cursor:not-allowed}
.upload-quote-status{margin-top:12px;font-size:.9rem;font-weight:600;display:none}
.upload-quote-status.is-visible{display:block}
.upload-quote-status.is-error{color:#b91c1c}
.upload-quote-status.is-success{color:#166534}
.upload-flow-note{margin-top:8px;font-size:.83rem;line-height:1.5;color:#475569;background:#f8fafc;border:1px solid rgba(148,163,184,.35);border-radius:10px;padding:10px 12px}
.upload-flow-note strong{color:#0f172a}
@media (max-width:768px){.upload-quote-grid,.upload-quote-guide{grid-template-columns:1fr}.upload-quote-modal{width:calc(100vw - 14px);max-height:calc(100vh - 14px)}.upload-quote-header,.upload-quote-body{padding-left:14px;padding-right:14px}}
`;
  document.head.appendChild(style);

  var overlay = document.createElement('div');
  overlay.className = 'upload-quote-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  var modal = document.createElement('div');
  modal.className = 'upload-quote-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'uploadQuoteTitle');
  modal.innerHTML = `
    <div class="upload-quote-header">
      <div class="upload-quote-title-wrap">
        <h3 id="uploadQuoteTitle">Upload Design and Request Quote</h3>
        <p>Fast quote flow for teams and bulk orders.</p>
      </div>
      <button type="button" class="upload-quote-close" aria-label="Close">Close</button>
    </div>
    <div class="upload-quote-body">
      <div class="upload-quote-guide">
        <div class="upload-quote-guide-card">
          <strong>Use Upload Files when you already have artwork</strong>
          <span>Submit logo, print-ready design, or reference files. We quote from your uploaded files.</span>
        </div>
        <div class="upload-quote-guide-card">
          <strong>Use Create Your Design for fresh designs</strong>
          <span>Open the design tool, build your artwork, then share the final design and we quote from it.</span>
        </div>
      </div>
      <form class="upload-quote-form" novalidate>
        <div class="upload-quote-grid">
          <div class="upload-quote-field"><label class="upload-quote-label" for="uqName">Name</label><input class="upload-quote-input" id="uqName" name="name" type="text" required></div>
          <div class="upload-quote-field"><label class="upload-quote-label" for="uqPhone">Phone Number</label><input class="upload-quote-input" id="uqPhone" name="phone" type="tel" required></div>
          <div class="upload-quote-field"><label class="upload-quote-label" for="uqProduct">Product</label><input class="upload-quote-input" id="uqProduct" name="product" type="text" required></div>
          <div class="upload-quote-field"><label class="upload-quote-label" for="uqQuantity">Quantity</label><input class="upload-quote-input" id="uqQuantity" name="quantity" type="number" min="1" step="1" required></div>
          <div class="upload-quote-field full"><label class="upload-quote-label" for="uqDetails">Details</label><textarea class="upload-quote-textarea" id="uqDetails" name="details" placeholder="Add print type, color count, sizes, and timeline." required></textarea></div>
          <div class="upload-quote-field full"><label class="upload-quote-label" for="uqFile">File Upload</label><input class="upload-quote-input" id="uqFile" name="file" type="file" accept="image/*,.pdf,.doc,.docx" required><span class="upload-quote-help">Accepted: image files, PDF, DOC, DOCX. Max 10MB.</span></div>
        </div>
        <div class="upload-quote-actions"><button class="upload-quote-submit" type="submit">Submit Request</button></div>
        <div class="upload-quote-status" aria-live="polite"></div>
      </form>
    </div>`;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  var form = modal.querySelector('.upload-quote-form');
  var closeBtn = modal.querySelector('.upload-quote-close');
  var submitBtn = modal.querySelector('.upload-quote-submit');
  var statusEl = modal.querySelector('.upload-quote-status');
  var fileInput = modal.querySelector('#uqFile');
  var productInput = modal.querySelector('#uqProduct');
  var lastFocused = null;

  var normalize = function (value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  };

  var inferProductName = function (trigger) {
    if (trigger && trigger.getAttribute('data-product')) {
      return trigger.getAttribute('data-product');
    }

    var heading = trigger ? trigger.closest('section,article,div') : null;
    if (heading) {
      var titleEl = heading.querySelector('h1,h2,h3,h4,.product-title,.card-title');
      if (titleEl && titleEl.textContent.trim()) {
        return titleEl.textContent.trim();
      }
    }

    var docTitle = document.title || '';
    return docTitle.split('|')[0].trim() || 'General Enquiry';
  };

  var setStatus = function (message, isError, isSuccess) {
    statusEl.textContent = message || '';
    statusEl.className = 'upload-quote-status is-visible' + (isError ? ' is-error' : '') + (isSuccess ? ' is-success' : '');
  };

  var clearStatus = function () {
    statusEl.textContent = '';
    statusEl.className = 'upload-quote-status';
  };

  var closeModal = function () {
    overlay.classList.remove('is-open');
    modal.classList.remove('is-open');
    document.body.classList.remove('upload-quote-open');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  };

  var openModal = function (trigger) {
    lastFocused = trigger || document.activeElement;
    clearStatus();
    form.reset();
    productInput.value = inferProductName(trigger);
    overlay.classList.add('is-open');
    modal.classList.add('is-open');
    document.body.classList.add('upload-quote-open');
    modal.querySelector('#uqName').focus();
  };

  var fileToBase64 = function (file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = String(reader.result || '');
        var parts = result.split(',');
        resolve(parts.length > 1 ? parts[1] : '');
      };
      reader.onerror = function () {
        reject(new Error('Unable to read file.'));
      };
      reader.readAsDataURL(file);
    });
  };

  var uploadKeywords = [
    'upload your files',
    'upload files',
    'upload design & request quote',
    'upload design and request quote'
  ];

  var isUploadTrigger = function (el) {
    if (!el) return false;
    if (el.hasAttribute('data-open-upload-form')) {
      return true;
    }
    var text = normalize(el.textContent);
    return uploadKeywords.some(function (keyword) { return text.indexOf(keyword) !== -1; });
  };

  var bindTrigger = function (el) {
    if (!isUploadTrigger(el)) return;
    if (el.dataset.uploadQuoteBound === '1') return;
    el.dataset.uploadQuoteBound = '1';
    if (el.tagName.toLowerCase() === 'a') {
      el.setAttribute('href', '#');
      el.removeAttribute('target');
      el.removeAttribute('rel');
    }
    el.setAttribute('data-open-upload-form', 'true');
    el.addEventListener('click', function (event) {
      event.preventDefault();
      openModal(el);
    });
  };

  Array.prototype.forEach.call(document.querySelectorAll('a,button'), bindTrigger);

  Array.prototype.forEach.call(document.querySelectorAll('a[href*="customizer-tool/customizer.html"]'), function (link) {
    link.setAttribute('title', 'Open the design tool to create your artwork first.');
    if (link.dataset.createDesignBound === '1') {
      return;
    }
    link.dataset.createDesignBound = '1';
    var actionWrap = link.parentElement;
    if (!actionWrap) {
      return;
    }
    // Find if there is an upload button in the same container
    var hasUpload = !!actionWrap.querySelector('[data-open-upload-form="true"]') ||
      (actionWrap.parentElement && actionWrap.parentElement.querySelector('[data-open-upload-form="true"]'));
    // Only add note if not already present
    if (actionWrap.nextElementSibling && actionWrap.nextElementSibling.classList.contains('upload-flow-note')) {
      return;
    }
    if (hasUpload || link.classList.contains('btn-outline-dark')) {
      var note = document.createElement('div');
      note.className = 'upload-flow-note';
      note.innerHTML = '<strong>How to use:</strong> Use <strong>Upload Your Files</strong> when you already have artwork. Use <strong>Create Your Design</strong> to design first, then share that final output for quote and production.';
      actionWrap.insertAdjacentElement('afterend', note);
    }
  });

  fileInput.addEventListener('change', function () {
    clearStatus();
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setStatus('File is too large. Maximum size is 10MB.', true, false);
      fileInput.value = '';
    }
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearStatus();

    var file = fileInput.files && fileInput.files[0];
    if (!file) {
      setStatus('Please upload a file before submitting.', true, false);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setStatus('File is too large. Maximum size is 10MB.', true, false);
      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';

    try {
      var base64 = await fileToBase64(file);
      var payload = {
        timestamp: new Date().toISOString(),
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        product: form.product.value.trim(),
        quantity: form.quantity.value.trim(),
        details: form.details.value.trim(),
        file: 'data:' + (file.type || 'application/octet-stream') + ';base64,' + base64,
        mimeType: file.type || 'application/octet-stream',
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        fileBase64: base64
      };

      var response;
      try {
        response = await fetch(WEBAPP_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });
      } catch (networkError) {
        // Fallback for restrictive CORS responses on some Apps Script deployments.
        response = await fetch(WEBAPP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });
      }

      if (response.type !== 'opaque' && !response.ok) {
        throw new Error('Submission failed. Please try again.');
      }

      setStatus('Thanks! Your request was submitted successfully.', false, true);
      form.reset();
    } catch (error) {
      setStatus(error && error.message ? error.message : 'Something went wrong while submitting.', true, false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Request';
    }
  });

  closeBtn.addEventListener('click', function () {
    closeModal();
  });

  overlay.addEventListener('click', function () {
    closeModal();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
});
