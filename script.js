document.addEventListener('DOMContentLoaded', () => {
  // gallery variants structure
  const variants = {
    white: [
      "images/product-item-1.jpg",
      "images/product-item-2.jpg",
      "images/product-item-3.jpg",
      "images/product-item-4.jpg"
    ],
    black: [
      "images/product-item-2.jpg",
      "images/product-item-3.jpg",
      "images/product-item-4.jpg",
      "images/product-item-5.jpg"
    ],
    yellow: [
      "images/product-item-3.jpg",
      "images/product-item-4.jpg",
      "images/product-item-5.jpg",
      "images/product-item-1.jpg"
    ],
    blue: [
      "images/product-item-4.jpg",
      "images/product-item-5.jpg",
      "images/product-item-1.jpg",
      "images/product-item-2.jpg"
    ],
    red: [
      "images/product-item-5.jpg",
      "images/product-item-1.jpg",
      "images/product-item-2.jpg",
      "images/product-item-3.jpg"
    ]
  };

  const mainImage = document.getElementById('mainProductImage');
  const thumbnails = document.querySelectorAll('.thumbnails .thumbnail');
  const variantThumbs = document.querySelectorAll('.variant-thumb');

  let currentVariant = 'white';
  let currentIndex = 0;

  function loadVariant(variant) {
    currentVariant = variant;
    currentIndex = 0;

    // update main image
    mainImage.src = variants[variant][0];

    // thumbnails
    thumbnails.forEach((thumb, idx) => {
      thumb.src = variants[variant][idx];
      thumb.classList.toggle('active', idx === 0);
    });

    // update variant-thumb active
    variantThumbs.forEach(vt => vt.classList.toggle('active', vt.getAttribute('data-variant') === variant));
  }

  // click handlers
  variantThumbs.forEach(vt => {
    vt.addEventListener('click', () => {
      const v = vt.getAttribute('data-variant');
      loadVariant(v);
    });
  });

  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.getAttribute('data-index'));
      currentIndex = idx;
      mainImage.src = variants[currentVariant][idx];

      thumbnails.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  // default load
  loadVariant(currentVariant);

  // quote form handler
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const quantity = document.getElementById('quantity').value;
      const message = document.getElementById('message').value;

      const whatsappMessage = `Hi Lobo Prints, I want a quote for Classic Cotton T-Shirt. Name: ${name}, Email: ${email}, Phone: ${phone}, Quantity: ${quantity}, Message: ${message}`;
      const whatsappUrl = `https://wa.me/919742998799?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
    });
  }
});