let selectedColor = "White";
let selectedSize = "Multiple Sizes";


// COLOR SELECT
document.querySelectorAll(".variant-thumb").forEach(img => {
  img.addEventListener("click", function(){

    document.querySelectorAll(".variant-thumb").forEach(i=>{
      i.classList.remove("active");
    });

    this.classList.add("active");

    selectedColor = this.dataset.variant;
  });
});


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

  let message =
`Hi Lobo Prints, I want a quote for:

Product: Classic Cotton T-Shirt
Color: ${selectedColor}
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