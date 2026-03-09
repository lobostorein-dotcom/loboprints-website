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