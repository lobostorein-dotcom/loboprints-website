// customizer.js - Product logic for Lobo Prints Customizer Tool
// This file was recreated to enable product selection and mockup logic, including jacket support.

// Product configuration: add new products here
const PRODUCTS = {
  roundneck: {
    name: "Round Neck T-Shirt",
    baseImages: {
      front: "assets/mockups/round neck tshirt white front base.png",
      back: "assets/mockups/round neck tshirt white back base.png"
    }
  },
  polo: {
    name: "Polo T-Shirt",
    baseImages: {
      front: "assets/mockups/white polo tshirt front base.png",
      back: "assets/mockups/white polo tshirt  back base.png"
    }
  },
  oversized: {
    name: "Oversized T-Shirt",
    baseImages: {
      front: "assets/mockups/OVERSIZED TSHIRT front base.png",
      back: "assets/mockups/OVERSIZED TSHIRT back base.png"
    }
  },
  hoodie: {
    name: "Hoodie",
    baseImages: {
      front: "assets/mockups/white hoodie front base.png",
      back: "assets/mockups/white hoodie back base.png"
    }
  },
  jersey: {
    name: "Sports Jersey",
    baseImages: {
      front: "assets/mockups/jersey front base.png",
      back: "assets/mockups/jersey back base.png"
    }
  },
  sweatshirt: {
    name: "Sweatshirt",
    baseImages: {
      front: "assets/mockups/sweatshirt front base.png",
      back: "assets/mockups/sweatshirt back base.png"
    }
  },
  mug: {
    name: "Mug",
    baseImages: {
      front: "assets/mockups/white mug base .png",
      back: "assets/mockups/white mug base .png"
    }
  },
  badge: {
    name: "Badge",
    baseImages: {
      front: "assets/mockups/white badge base .png",
      back: "assets/mockups/white badge base .png"
    }
  },
  jacket: {
    name: "Jacket",
    baseImages: {
      front: "assets/mockups/jacket front base.png",
      back: "assets/mockups/jacket back base.png"
    }
  }
};

// Get product from URL
function getSelectedProduct() {
  const params = new URLSearchParams(window.location.search);
  const product = params.get("product");
  return PRODUCTS[product] ? product : "roundneck";
}

// Set up workspace for selected product
function setupProductWorkspace() {
  const productKey = getSelectedProduct();
  const product = PRODUCTS[productKey];
  document.getElementById("productTitle").textContent = `Customize ${product.name}`;
  // Set base images for front/back
  document.getElementById("shirtBaseLayer").src = product.baseImages.front;
  document.getElementById("shirtBaseLayer").setAttribute("data-front", product.baseImages.front);
  document.getElementById("shirtBaseLayer").setAttribute("data-back", product.baseImages.back);
}

// Side switch logic
function setupSideSwitch() {
  const frontBtn = document.getElementById("frontSideBtn");
  const backBtn = document.getElementById("backSideBtn");
  const shirtBase = document.getElementById("shirtBaseLayer");
  const canvasFront = document.getElementById("designCanvasFront");
  const canvasBack = document.getElementById("designCanvasBack");
  const indicator = document.getElementById("activeSideIndicator");

  function showFront() {
    shirtBase.src = shirtBase.getAttribute("data-front");
    canvasFront.classList.remove("hidden");
    canvasBack.classList.add("hidden");
    indicator.textContent = "Front View";
    frontBtn.classList.add("active");
    backBtn.classList.remove("active");
  }
  function showBack() {
    shirtBase.src = shirtBase.getAttribute("data-back");
    canvasFront.classList.add("hidden");
    canvasBack.classList.remove("hidden");
    indicator.textContent = "Back View";
    frontBtn.classList.remove("active");
    backBtn.classList.add("active");
  }
  frontBtn.addEventListener("click", showFront);
  backBtn.addEventListener("click", showBack);
  // Default to front
  showFront();
}

document.addEventListener("DOMContentLoaded", function() {
  setupProductWorkspace();
  setupSideSwitch();
});
