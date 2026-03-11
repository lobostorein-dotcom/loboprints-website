let selectedColor = "white";
let selectedSize = "Multiple Sizes";

const variantImages = {
  white: [
    "images/basic plain white 01.jpg.jpeg",
    "images/basic plain white 02.jpg.jpeg",
    "images/basic plain white 03.jpg.jpeg",
    "images/basic plain white 04.jpg.jpeg",
    "images/basic plain white 05.jpg.jpeg"
  ],
  black: [
    "images/basic plain black 01.jpg.jpeg",
    "images/basic plain black 02.jpg.jpeg",
    "images/basic plain black 03.jpg.jpeg",
    "images/basic plain black 04.jpg.jpeg",
    "images/basic plain black 05.jpg.jpeg"
  ],
  yellow: [
    "images/basic plain yellow 01.jpg.jpeg",
    "images/basic plain yellow 02.jpg.jpeg",
    "images/basic plain yellow 03.jpg.jpeg",
    "images/basic plain yellow 04.jpg.jpeg",
    "images/basic plain yellow 05.jpg.jpeg"
  ],
  blue: [
    "images/basic plain blue 01.jpg.jpeg",
    "images/basic plain blue 02.jpg.jpeg",
    "images/basic plain blue 03.jpg.jpeg",
    "images/basic plain blue 04.jpg.jpeg",
    "images/basic plain blue 05.jpg.jpeg"
  ],
  red: [
    "images/basic plain Red 01.jpg.jpeg",
    "images/basic plain Red 02.jpg.jpeg",
    "images/basic plain Red 03.jpg.jpeg",
    "images/basic plain Red 04.jpg.jpeg",
    "images/basic plain Red 05.jpg.jpeg"
  ]
};

function renderThumbnails(variantKey) {
  const thumbsWrap = document.querySelector(".thumbnails");
  const mainImage = document.getElementById("mainProductImage");
  if (!thumbsWrap || !mainImage || !variantImages[variantKey]) return;

  const images = variantImages[variantKey];
  mainImage.src = images[0];

  thumbsWrap.innerHTML = "";
  images.forEach((imageSrc, index) => {
    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = `${variantKey} view ${index + 1}`;
    img.className = "thumb-img" + (index === 0 ? " active" : "");
    img.loading = "lazy";
    img.addEventListener("click", function () {
      document.querySelectorAll(".thumb-img").forEach(el => el.classList.remove("active"));
      img.classList.add("active");
      mainImage.src = imageSrc;
    });
    thumbsWrap.appendChild(img);
  });
}


// COLOR SELECT
document.querySelectorAll(".variant-thumb").forEach(img => {
  img.addEventListener("click", function(){

    document.querySelectorAll(".variant-thumb").forEach(i=>{
      i.classList.remove("active");
    });

    this.classList.add("active");

    selectedColor = this.dataset.variant;
    renderThumbnails(selectedColor);
  });
});

renderThumbnails("white");


// SIZE SELECT
document.querySelectorAll(".size-btn").forEach(btn=>{
  btn.addEventListener("click", function(){

    document.querySelectorAll(".size-btn").forEach(b=>{
      b.classList.remove("active");
    });

    this.classList.add("active");

    selectedSize = this.innerText;
  });
});


// WHATSAPP BUTTON
document.querySelector(".btn-primary.btn-lg").addEventListener("click", function(e){

  e.preventDefault();

  let quantity = document.getElementById("quantity").value || "Not specified";

  const displayColor = selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1);

  let message =
`Hi Lobo Prints, I want a quote for:

Product: Cotton Basic Round Neck T-Shirt
Color: ${displayColor}
Size: ${selectedSize}
Quantity: ${quantity}

I will attach my design file here if needed.`;

  let url = "https://wa.me/919742998799?text=" + encodeURIComponent(message);

  window.open(url,"_blank");

});

// Quote form functions
function sendViaWhatsApp() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const category = document.getElementById('category').value;
  const quantity = document.getElementById('quantity').value;
  const details = document.getElementById('details').value;

  const message = `Hi Lobo Prints,

I would like a quote for custom apparel.

Name: ${name}
Email: ${email}
Phone: ${phone}
Category: ${category}
Quantity: ${quantity}
Details: ${details}

Please get back to me with a quote.`;

  const whatsappURL = `https://wa.me/919742998799?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank');
}

document.getElementById('quoteForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const category = document.getElementById('category').value;
  const quantity = document.getElementById('quantity').value;
  const details = document.getElementById('details').value;

  const emailBody = `Name: ${name}
Phone: ${phone}
Category: ${category}
Quantity: ${quantity}
Details: ${details}`;

  window.location.href = `mailto:business@loboprints.in?subject=Quote Request - ${category}&body=${encodeURIComponent(emailBody)}`;
});