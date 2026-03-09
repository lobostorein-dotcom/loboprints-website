document.addEventListener('DOMContentLoaded', () => {
  // Variant image galleries
  const variantImages = {
    white: [
      "images/white1.jpg",
      "images/white2.jpg",
      "images/white3.jpg",
      "images/white4.jpg"
    ],
    black: [
      "images/black1.jpg",
      "images/black2.jpg",
      "images/black3.jpg",
      "images/black4.jpg"
    ],
    yellow: [
      "images/yellow1.jpg",
      "images/yellow2.jpg",
      "images/yellow3.jpg",
      "images/yellow4.jpg"
    ],
    blue: [
      "images/blue1.jpg",
      "images/blue2.jpg",
      "images/blue3.jpg",
      "images/blue4.jpg"
    ],
    red: [
      "images/red1.jpg",
      "images/red2.jpg",
      "images/red3.jpg",
      "images/red4.jpg"
    ]
  };

  const mainImage = document.getElementById("mainProductImage");
  const thumbnailContainer = document.querySelector(".thumbnails");
  const variantThumbs = document.querySelectorAll(".variant-thumb");

  function loadVariant(variantName) {
    const images = variantImages[variantName];

    mainImage.src = images[0];
    thumbnailContainer.innerHTML = "";

    images.forEach((img, index) => {
      const thumb = document.createElement("img");
      thumb.src = img;
      thumb.classList.add("thumbnail");
      thumb.dataset.index = index;

      if (index === 0) thumb.classList.add("active");

      thumb.addEventListener("click", () => {
        mainImage.src = img;
        document.querySelectorAll(".thumbnail").forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
      });

      thumbnailContainer.appendChild(thumb);
    });
  }

  variantThumbs.forEach(variant => {
    variant.addEventListener("click", () => {
      const selectedVariant = variant.dataset.variant;

      document.querySelectorAll(".variant-thumb").forEach(v => v.classList.remove("active"));
      variant.classList.add("active");

      loadVariant(selectedVariant);
    });
  });

  loadVariant("white");
});