document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelector('.header-search-wrapper')) return;

  const productIndex = [
    { name: 'Cotton Basic Round Neck T-Shirt', url: 'tshirt1.html', image: 'images/basic plain white 05.jpg.jpeg', category: 'T-Shirts', tags: 'cotton basic round neck' },
    { name: 'Cotton Premium Round Neck T-Shirt (200 GSM)', url: 'tshirt2.html', image: 'images/primeum tshirt black colours 01.jpeg', category: 'T-Shirts', tags: 'cotton premium 200 gsm' },
    { name: 'Cotton Affordable Oversized T-Shirt (200 GSM)', url: 'tshirt3.html', image: 'images/oversized 200gsm tshirt ivory  images colours-01.jpeg', category: 'T-Shirts', tags: 'oversized cotton affordable' },
    { name: 'Cotton Premium Oversized T-Shirt (240 GSM)', url: 'tshirt4.html', image: 'images/240gsm oversize tshirt aqua blue  colours-01.jpeg', category: 'T-Shirts', tags: 'oversized premium 240 gsm' },
    { name: 'Cotton Affordable Polo T-Shirt', url: 'tshirt5.html', image: 'images/Affordable Blue polo tshirts colours-01.jpeg', category: 'T-Shirts', tags: 'polo affordable' },
    { name: 'Cotton Premium Polo T-Shirt', url: 'tshirt6.html', image: 'images/Premium polo tshirts  pink colours-01.jpeg', category: 'T-Shirts', tags: 'polo premium' },
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
    { name: 'ID Cards', url: 'ids.html', image: 'images/idcards.jpeg', category: 'Category', tags: 'id lanyards holders' },
    { name: 'Mugs', url: 'mugs.html', image: 'images/product-item-9.jpg', category: 'Category', tags: 'mug print gift' },
    { name: 'All Categories', url: 'categories.html', image: 'images/tshirts.jpeg', category: 'Category', tags: 'all products browse' }
  ];

  const navbarContainer = document.querySelector('.navbar .container');
  const collapse = navbarContainer ? navbarContainer.querySelector('.navbar-collapse') : null;
  if (!collapse) return;

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
  toggleButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 18a7 7 0 1 1 0-14a7 7 0 0 1 0 14Zm9.71 2.29l-3.4-3.4a1 1 0 1 0-1.42 1.42l3.4 3.4a1 1 0 0 0 1.42-1.42Z"/></svg>';

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

  collapse.appendChild(searchWrapper);

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
        return '<a class="header-search-item" href="' + item.url + '">' +
          '<img src="' + item.image + '" alt="' + item.name + '">' +
          '<span class="header-search-meta">' +
          '<strong>' + item.name + '</strong>' +
          '<small>' + item.category + '</small>' +
          '</span>' +
          '</a>';
      }).join('') + '<a class="header-search-item header-search-empty" href="categories.html"><span>Browse all categories</span></a>';
      dropdown.classList.add('show');
      return;
    }

    dropdown.innerHTML = items.map(function (item) {
      return '<a class="header-search-item" href="' + item.url + '">' +
        '<img src="' + item.image + '" alt="' + item.name + '">' +
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
      window.location.href = results[0].url;
    } else {
      window.location.href = 'categories.html';
    }
  });

  toggleButton.addEventListener('click', function () {
    if (searchWrapper.classList.contains('open')) {
      closeSearch();
      return;
    }
    openSearch();
  });

  document.addEventListener('click', function (event) {
    if (!searchWrapper.contains(event.target)) {
      closeSearch();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSearch();
      input.blur();
    }
  });

  window.addEventListener('resize', function () {
    if (searchWrapper.classList.contains('open')) {
      setPanelPosition();
    }
  });

  window.addEventListener('scroll', function () {
    if (searchWrapper.classList.contains('open')) {
      setPanelPosition();
    }
  }, true);
});
