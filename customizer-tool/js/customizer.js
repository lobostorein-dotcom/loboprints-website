(function () {
  const STAGE_WIDTH = 700;
  const STAGE_HEIGHT = 760;
  const MODEL_BG_SRC = 'assets/mockups/model-bg.svg';
  const APPS_SCRIPT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwbjy2QLckaOkMBpctSK-f0vKYFEBTbIRnZvJV9eV0SuZLY9StKlJb29YRqHaxKPJey_g/exec';
  const SUBMISSION_IMAGE_TYPE = 'image/png';
  const PRINT_AREA = { left: 235, top: 270, width: 230, height: 260 };
  const ROUNDNECK_BASE_SOURCES = {
    front: 'assets/mockups/roundneck-front-base.png',
    back: 'assets/mockups/roundneck-back-base.png'
  };

  const PRODUCT_CONFIG = {
    roundneck: { name: 'Round Neck T-Shirt' },
    polo: { name: 'Polo T-Shirt' },
    oversized: { name: 'Oversized T-Shirt' },
    hoodie: { name: 'Hoodie' },
    jersey: { name: 'Sports Jersey' }
  };

  const SHIRT_COLORS = [
    { name: 'White', value: '#ffffff', stroke: '#cbd5e1' },
    { name: 'Black', value: '#111827', stroke: '#374151' },
    { name: 'Navy', value: '#1e3a8a', stroke: '#172554' },
    { name: 'Red', value: '#b91c1c', stroke: '#7f1d1d' },
    { name: 'Green', value: '#15803d', stroke: '#14532d' }
  ];

  const state = {
    activeSide: 'front',
    activeColor: SHIRT_COLORS[0],
    previewRenderToken: 0,
    sources: {
      front: { base: '', overlay: '' },
      back: { base: '', overlay: '' }
    }
  };

  const params = new URLSearchParams(window.location.search);
  const productKey = params.get('product') || 'roundneck';
  const product = PRODUCT_CONFIG[productKey] || PRODUCT_CONFIG.roundneck;

  const productTitle = document.getElementById('productTitle');
  const shirtBaseLayer = document.getElementById('shirtBaseLayer');
  const shirtOverlayLayer = document.getElementById('shirtOverlayLayer');
  const activeSideIndicator = document.getElementById('activeSideIndicator');
  const colorSelect = document.getElementById('colorSelect');
  const imageUploadInput = document.getElementById('imageUploadInput');
  const addImageBtn = document.getElementById('addImageBtn');
  const addTextBtn = document.getElementById('addTextBtn');
  const leftUploadBtn = document.getElementById('leftUploadBtn');
  const leftTextBtn = document.getElementById('leftTextBtn');
  const deleteObjectBtn = document.getElementById('deleteObjectBtn');
  const fontSelect = document.getElementById('fontSelect');
  const textColor = document.getElementById('textColor');
  const exportDesignBtn = document.getElementById('exportDesignBtn');
  const designPreview = document.getElementById('designPreview');
  const frontPlacementPreview = document.getElementById('frontPlacementPreview');
  const backPlacementPreview = document.getElementById('backPlacementPreview');
  const designFrontData = document.getElementById('designFrontData');
  const designBackData = document.getElementById('designBackData');
  const designImageData = document.getElementById('designImageData');
  const quoteForm = document.getElementById('quoteForm');
  const formStatus = document.getElementById('formStatus');
  const frontSideBtn = document.getElementById('frontSideBtn');
  const backSideBtn = document.getElementById('backSideBtn');

  const canvases = {
    front: new fabric.Canvas('designCanvasFront', { preserveObjectStacking: true, selection: true }),
    back: new fabric.Canvas('designCanvasBack', { preserveObjectStacking: true, selection: true })
  };

  const canvasElements = {
    front: document.getElementById('designCanvasFront'),
    back: document.getElementById('designCanvasBack')
  };

  const canvasContainers = {
    front: null,
    back: null
  };

  const imageCache = new Map();
  let modelBgImage = null;
  let previewTimer = null;

  function svgDataUri(markup) {
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(markup);
  }

  function loadImage(src) {
    if (imageCache.has(src)) {
      return Promise.resolve(imageCache.get(src));
    }

    return new Promise(function (resolve, reject) {
      const image = new Image();
      // Do not force CORS mode for local/data/blob sources; that can break preview composition.
      if (/^https?:\/\//i.test(src)) {
        image.crossOrigin = 'anonymous';
      }
      image.onload = function () {
        imageCache.set(src, image);
        resolve(image);
      };
      image.onerror = reject;
      image.src = src;
    });
  }

  function ensureStaticPreviewLayersLoaded() {
    if (modelBgImage) {
      return Promise.resolve();
    }

    return loadImage(MODEL_BG_SRC).then(function (image) {
      modelBgImage = image;
    });
  }

  function getBaseMarkup(kind, side, color) {
    const fill = color.value;
    const stroke = color.stroke;

    const templates = {
      roundneck: {
        front: '<path d="M190 300l66-72c18-18 42-28 68-28h52c26 0 50 10 68 28l66 72v292H190V300z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="4"/><circle cx="350" cy="230" r="34" fill="none" stroke="' + stroke + '" stroke-width="10"/>',
        back: '<path d="M190 300l66-72c18-18 42-28 68-28h52c26 0 50 10 68 28l66 72v292H190V300z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="4"/><path d="M308 218c14 12 70 12 84 0" fill="none" stroke="' + stroke + '" stroke-width="8" stroke-linecap="round"/>'
      },
      polo: {
        front: '<path d="M192 300l64-74c18-18 42-28 68-28h52c26 0 50 10 68 28l64 74v292H192V300z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="4"/><path d="M305 200l45 38 45-38" fill="#f8fafc" stroke="' + stroke + '" stroke-width="4"/><line x1="350" y1="238" x2="350" y2="306" stroke="' + stroke + '" stroke-width="4"/>',
        back: '<path d="M192 300l64-74c18-18 42-28 68-28h52c26 0 50 10 68 28l64 74v292H192V300z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="4"/><path d="M300 212c18 10 82 10 100 0" fill="none" stroke="' + stroke + '" stroke-width="8" stroke-linecap="round"/>'
      },
      oversized: {
        front: '<path d="M160 318l74-88c22-22 50-34 82-34h68c32 0 60 12 82 34l74 88v288H160V318z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="4"/><circle cx="350" cy="236" r="36" fill="none" stroke="' + stroke + '" stroke-width="10"/>',
        back: '<path d="M160 318l74-88c22-22 50-34 82-34h68c32 0 60 12 82 34l74 88v288H160V318z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="4"/><path d="M300 224c18 10 82 10 100 0" fill="none" stroke="' + stroke + '" stroke-width="8" stroke-linecap="round"/>'
      },
      hoodie: {
        front: '<path d="M188 318l70-90c18-20 44-32 72-32h40c28 0 54 12 72 32l70 90v288H188V318z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="4"/><path d="M292 214c0-28 26-50 58-50s58 22 58 50v40h-116v-40z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="4"/><rect x="300" y="454" width="100" height="72" rx="16" fill="none" stroke="' + stroke + '" stroke-width="4"/>',
        back: '<path d="M188 318l70-90c18-20 44-32 72-32h40c28 0 54 12 72 32l70 90v288H188V318z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="4"/><path d="M292 214c0-28 26-50 58-50s58 22 58 50v40h-116v-40z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="4"/>'
      },
      jersey: {
        front: '<path d="M190 306l66-74c18-18 42-28 68-28h52c26 0 50 10 68 28l66 74v286H190V306z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="4"/><circle cx="350" cy="232" r="34" fill="none" stroke="' + stroke + '" stroke-width="10"/><path d="M250 300h200" stroke="' + stroke + '" stroke-width="8" opacity="0.65"/>',
        back: '<path d="M190 306l66-74c18-18 42-28 68-28h52c26 0 50 10 68 28l66 74v286H190V306z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="4"/><path d="M308 218c14 12 70 12 84 0" fill="none" stroke="' + stroke + '" stroke-width="8" stroke-linecap="round"/><path d="M250 300h200" stroke="' + stroke + '" stroke-width="8" opacity="0.65"/>'
      }
    };

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 760">' + templates[kind][side] + '</svg>';
  }

  function getOverlayMarkup(kind, side) {
    const radial = '<defs><radialGradient id="shade" cx="50%" cy="35%" r="58%"><stop offset="0%" stop-color="#0f172a" stop-opacity="0"/><stop offset="100%" stop-color="#0f172a" stop-opacity="0.24"/></radialGradient></defs>';
    const overlays = {
      roundneck: {
        front: '<path d="M190 300l66-72c18-18 42-28 68-28h52c26 0 50 10 68 28l66 72v292H190V300z" fill="url(#shade)" opacity="0.3"/><path d="M220 330c52 26 208 26 260 0" stroke="#0f172a" stroke-opacity="0.16" stroke-width="6" fill="none"/><path d="M230 462c46 20 192 20 238 0" stroke="#0f172a" stroke-opacity="0.13" stroke-width="5" fill="none"/>',
        back: '<path d="M190 300l66-72c18-18 42-28 68-28h52c26 0 50 10 68 28l66 72v292H190V300z" fill="url(#shade)" opacity="0.26"/><path d="M220 350c52 22 208 22 260 0" stroke="#0f172a" stroke-opacity="0.14" stroke-width="6" fill="none"/>'
      },
      polo: {
        front: '<path d="M192 300l64-74c18-18 42-28 68-28h52c26 0 50 10 68 28l64 74v292H192V300z" fill="url(#shade)" opacity="0.3"/><path d="M222 338c50 24 206 24 256 0" stroke="#0f172a" stroke-opacity="0.15" stroke-width="6" fill="none"/>',
        back: '<path d="M192 300l64-74c18-18 42-28 68-28h52c26 0 50 10 68 28l64 74v292H192V300z" fill="url(#shade)" opacity="0.26"/><path d="M222 352c50 18 206 18 256 0" stroke="#0f172a" stroke-opacity="0.12" stroke-width="6" fill="none"/>'
      },
      oversized: {
        front: '<path d="M160 318l74-88c22-22 50-34 82-34h68c32 0 60 12 82 34l74 88v288H160V318z" fill="url(#shade)" opacity="0.32"/><path d="M210 352c58 22 222 22 280 0" stroke="#0f172a" stroke-opacity="0.17" stroke-width="6" fill="none"/>',
        back: '<path d="M160 318l74-88c22-22 50-34 82-34h68c32 0 60 12 82 34l74 88v288H160V318z" fill="url(#shade)" opacity="0.28"/><path d="M212 368c56 18 220 18 276 0" stroke="#0f172a" stroke-opacity="0.14" stroke-width="6" fill="none"/>'
      },
      hoodie: {
        front: '<path d="M188 318l70-90c18-20 44-32 72-32h40c28 0 54 12 72 32l70 90v288H188V318z" fill="url(#shade)" opacity="0.34"/><path d="M236 366c54 24 174 24 228 0" stroke="#0f172a" stroke-opacity="0.17" stroke-width="6" fill="none"/>',
        back: '<path d="M188 318l70-90c18-20 44-32 72-32h40c28 0 54 12 72 32l70 90v288H188V318z" fill="url(#shade)" opacity="0.3"/><path d="M236 382c54 18 174 18 228 0" stroke="#0f172a" stroke-opacity="0.13" stroke-width="6" fill="none"/>'
      },
      jersey: {
        front: '<path d="M190 306l66-74c18-18 42-28 68-28h52c26 0 50 10 68 28l66 74v286H190V306z" fill="url(#shade)" opacity="0.3"/><path d="M220 336c52 22 208 22 260 0" stroke="#0f172a" stroke-opacity="0.16" stroke-width="6" fill="none"/>',
        back: '<path d="M190 306l66-74c18-18 42-28 68-28h52c26 0 50 10 68 28l66 74v286H190V306z" fill="url(#shade)" opacity="0.27"/><path d="M220 350c52 18 208 18 260 0" stroke="#0f172a" stroke-opacity="0.13" stroke-width="6" fill="none"/>'
      }
    };

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 760">' + radial + overlays[kind][side] + '</svg>';
  }

  function getBaseSource(kind, side, color) {
    if (kind === 'roundneck') {
      return Promise.resolve(ROUNDNECK_BASE_SOURCES[side]);
    }

    return Promise.resolve(svgDataUri(getBaseMarkup(kind, side, color)));
  }

  function getCurrentCanvas() {
    return canvases[state.activeSide];
  }

  function applyClip(canvas) {
    canvas.clipPath = new fabric.Rect({
      left: PRINT_AREA.left,
      top: PRINT_AREA.top,
      width: PRINT_AREA.width,
      height: PRINT_AREA.height,
      absolutePositioned: true
    });
  }

  function clampObjectToPrintArea(obj) {
    if (!obj) return;

    // Use canvas-space bounds so clamping remains correct after viewport scaling.
    const bounds = obj.getBoundingRect(false, true);
    if (bounds.width > PRINT_AREA.width || bounds.height > PRINT_AREA.height) {
      const ratio = Math.min(PRINT_AREA.width / bounds.width, PRINT_AREA.height / bounds.height, 1);
      obj.scaleX *= ratio;
      obj.scaleY *= ratio;
      obj.setCoords();
    }

    const next = obj.getBoundingRect(false, true);
    let dx = 0;
    let dy = 0;

    if (next.left < PRINT_AREA.left) dx = PRINT_AREA.left - next.left;
    if (next.top < PRINT_AREA.top) dy = PRINT_AREA.top - next.top;
    if (next.left + next.width > PRINT_AREA.left + PRINT_AREA.width) dx = (PRINT_AREA.left + PRINT_AREA.width) - (next.left + next.width);
    if (next.top + next.height > PRINT_AREA.top + PRINT_AREA.height) dy = (PRINT_AREA.top + PRINT_AREA.height) - (next.top + next.height);

    obj.left += dx;
    obj.top += dy;
    obj.setCoords();
  }

  function setSideButtonState() {
    frontSideBtn.classList.toggle('active', state.activeSide === 'front');
    backSideBtn.classList.toggle('active', state.activeSide === 'back');

    ['front', 'back'].forEach(function (side) {
      const isActive = side === state.activeSide;
      const container = canvasContainers[side];
      const baseCanvas = canvasElements[side];
      const canvas = canvases[side];

      if (container) {
        container.classList.toggle('is-hidden', !isActive);
        container.style.pointerEvents = isActive ? 'auto' : 'none';
      }

      if (canvas && canvas.upperCanvasEl) {
        canvas.upperCanvasEl.style.pointerEvents = isActive ? 'auto' : 'none';
      }

      if (canvas) {
        canvas.skipTargetFind = !isActive;
        canvas.selection = isActive;
        canvas.defaultCursor = isActive ? 'move' : 'default';
      }

      baseCanvas.classList.toggle('hidden', !isActive);
    });

    activeSideIndicator.textContent = state.activeSide === 'front' ? 'Front View' : 'Back View';
  }

  function updateLayerSources() {
    const color = state.activeColor;

    return Promise.all(['front', 'back'].map(function (side) {
      return getBaseSource(productKey, side, color).then(function (baseSource) {
        state.sources[side].base = baseSource;
        state.sources[side].overlay = svgDataUri(getOverlayMarkup(productKey, side));
      });
    })).then(function () {
      return Promise.all([
        loadImage(state.sources.front.base),
        loadImage(state.sources.front.overlay),
        loadImage(state.sources.back.base),
        loadImage(state.sources.back.overlay)
      ]);
    }).then(function () {
      shirtBaseLayer.src = state.sources[state.activeSide].base;
      shirtOverlayLayer.src = state.sources[state.activeSide].overlay;
    });
  }

  function switchSide(side) {
    state.activeSide = side;

    Object.keys(canvases).forEach(function (key) {
      canvases[key].discardActiveObject();
      canvases[key].requestRenderAll();
    });

    setSideButtonState();
    shirtBaseLayer.src = state.sources[side].base;
    shirtOverlayLayer.src = state.sources[side].overlay;
    canvases[side].calcOffset();
    syncSelectedTextControls();
    schedulePlacementPreviewUpdate();
  }

  function populateColorOptions() {
    colorSelect.innerHTML = SHIRT_COLORS.map(function (color) {
      return '<option value="' + color.value + '">' + color.name + '</option>';
    }).join('');

    colorSelect.addEventListener('change', function () {
      state.activeColor = SHIRT_COLORS.find(function (item) {
        return item.value === colorSelect.value;
      }) || SHIRT_COLORS[0];
      updateLayerSources().then(function () {
        schedulePlacementPreviewUpdate();
      });
    });
  }

  function addText() {
    const canvas = getCurrentCanvas();
    const textObj = new fabric.IText('Your Text', {
      left: PRINT_AREA.left + 20,
      top: PRINT_AREA.top + 20,
      fontSize: 32,
      fill: textColor.value,
      fontFamily: fontSelect.value,
      cornerColor: '#2563eb',
      borderColor: '#2563eb',
      cornerSize: 10,
      transparentCorners: false
    });

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    clampObjectToPrintArea(textObj);
    canvas.requestRenderAll();
    schedulePlacementPreviewUpdate();
  }

  function addImage(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      fabric.Image.fromURL(event.target.result, function (img) {
        const maxWidth = PRINT_AREA.width * 0.75;
        if (img.width > maxWidth) {
          img.scaleToWidth(maxWidth);
        }

        img.set({
          left: PRINT_AREA.left + 22,
          top: PRINT_AREA.top + 24,
          cornerColor: '#2563eb',
          borderColor: '#2563eb',
          cornerSize: 10,
          transparentCorners: false
        });

        const canvas = getCurrentCanvas();
        canvas.add(img);
        canvas.setActiveObject(img);
        clampObjectToPrintArea(img);
        canvas.requestRenderAll();
        schedulePlacementPreviewUpdate();
      }, { crossOrigin: 'anonymous' });
    };
    reader.readAsDataURL(file);
  }

  function splitDataUrlImage(dataUrl) {
    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || '');
    if (!match) {
      throw new Error('Invalid image data URL');
    }

    return {
      mimeType: match[1],
      base64: match[2]
    };
  }

  function deleteSelection() {
    const canvas = getCurrentCanvas();
    const active = canvas.getActiveObject();
    if (!active) return;

    if (active.type === 'activeSelection') {
      active.forEachObject(function (obj) {
        canvas.remove(obj);
      });
    } else {
      canvas.remove(active);
    }

    canvas.discardActiveObject();
    canvas.requestRenderAll();
    schedulePlacementPreviewUpdate();
  }

  function syncSelectedTextControls() {
    const active = getCurrentCanvas().getActiveObject();
    if (active && active.type === 'i-text') {
      fontSelect.value = active.fontFamily || fontSelect.value;
      textColor.value = active.fill || textColor.value;
    }
  }

  function bindCanvasEvents(canvas) {
    canvas.on('object:moving', function (event) { clampObjectToPrintArea(event.target); });
    canvas.on('object:scaling', function (event) { clampObjectToPrintArea(event.target); });
    canvas.on('object:rotating', function (event) { clampObjectToPrintArea(event.target); });
    canvas.on('object:modified', schedulePlacementPreviewUpdate);
    canvas.on('object:added', schedulePlacementPreviewUpdate);
    canvas.on('object:removed', schedulePlacementPreviewUpdate);
    canvas.on('selection:created', syncSelectedTextControls);
    canvas.on('selection:updated', syncSelectedTextControls);
  }

  function composeSidePreview(side) {
    return ensureStaticPreviewLayersLoaded().then(function () {
      return Promise.all([
      Promise.resolve(modelBgImage),
      loadImage(state.sources[side].base),
      loadImage(state.sources[side].overlay),
      loadImage(canvases[side].toDataURL({ format: 'png', multiplier: 1, enableRetinaScaling: true }))
    ]);
    }).then(function (images) {
      const offscreen = document.createElement('canvas');
      offscreen.width = STAGE_WIDTH;
      offscreen.height = STAGE_HEIGHT;
      const ctx = offscreen.getContext('2d');

      images.forEach(function (image) {
        ctx.drawImage(image, 0, 0, STAGE_WIDTH, STAGE_HEIGHT);
      });

      return offscreen.toDataURL('image/png');
    });
  }

  function exportCombinedPreview() {
    return Promise.all([composeSidePreview('front'), composeSidePreview('back')]).then(function (sources) {
      const combined = document.createElement('canvas');
      combined.width = STAGE_WIDTH * 2;
      combined.height = STAGE_HEIGHT;
      const ctx = combined.getContext('2d');

      return Promise.all(sources.map(loadImage)).then(function (images) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, combined.width, combined.height);
        ctx.drawImage(images[0], 0, 0, STAGE_WIDTH, STAGE_HEIGHT);
        ctx.drawImage(images[1], STAGE_WIDTH, 0, STAGE_WIDTH, STAGE_HEIGHT);
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 28px Segoe UI';
        ctx.fillText('Front', 28, 42);
        ctx.fillText('Back', STAGE_WIDTH + 28, 42);

        return {
          front: sources[0],
          back: sources[1],
          combined: combined.toDataURL('image/png')
        };
      });
    });
  }

  function schedulePlacementPreviewUpdate() {
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(updatePlacementPreviews, 80);
  }

  function updatePlacementPreviews() {
    const token = ++state.previewRenderToken;
    Promise.all([composeSidePreview('front'), composeSidePreview('back')]).then(function (sources) {
      if (token !== state.previewRenderToken) return;
      frontPlacementPreview.src = sources[0];
      backPlacementPreview.src = sources[1];
      designFrontData.value = sources[0];
      designBackData.value = sources[1];
    }).catch(function () {
      formStatus.textContent = 'Preview generation failed because a required base/overlay layer did not load.';
    });
  }

  function wireControls() {
    addTextBtn.addEventListener('click', addText);
    leftTextBtn.addEventListener('click', addText);

    addImageBtn.addEventListener('click', function () { imageUploadInput.click(); });
    leftUploadBtn.addEventListener('click', function () { imageUploadInput.click(); });
    imageUploadInput.addEventListener('change', function () {
      if (imageUploadInput.files && imageUploadInput.files[0]) {
        const file = imageUploadInput.files[0];
        if (!file.type || file.type.indexOf('image/') !== 0) {
          formStatus.textContent = 'Please upload a valid image file.';
          imageUploadInput.value = '';
          return;
        }

        addImage(file);
        imageUploadInput.value = '';
      }
    });

    deleteObjectBtn.addEventListener('click', deleteSelection);

    fontSelect.addEventListener('change', function () {
      const active = getCurrentCanvas().getActiveObject();
      if (active && active.type === 'i-text') {
        active.set('fontFamily', fontSelect.value);
        getCurrentCanvas().requestRenderAll();
        schedulePlacementPreviewUpdate();
      }
    });

    textColor.addEventListener('change', function () {
      const active = getCurrentCanvas().getActiveObject();
      if (active && active.type === 'i-text') {
        active.set('fill', textColor.value);
        getCurrentCanvas().requestRenderAll();
        schedulePlacementPreviewUpdate();
      }
    });

    frontSideBtn.addEventListener('click', function () { switchSide('front'); });
    backSideBtn.addEventListener('click', function () { switchSide('back'); });

    exportDesignBtn.addEventListener('click', function () {
      exportCombinedPreview().then(function (data) {
        designPreview.src = data.combined;
        designPreview.hidden = false;
        designFrontData.value = data.front;
        designBackData.value = data.back;
        designImageData.value = data.combined;
        formStatus.textContent = 'Front and back previews generated. Submit the form to send your quote request.';
      });
    });

    quoteForm.addEventListener('submit', function (event) {
      event.preventDefault();
      formStatus.textContent = 'Composing previews\u2026';

      var formFields = {
        name:  document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        email: document.getElementById('customerEmail').value,
        notes: document.getElementById('customerNotes').value
      };

      exportCombinedPreview()
        .then(function (preview) {
          var frontData, backData;
          try {
            frontData = splitDataUrlImage(preview.front);
            backData  = splitDataUrlImage(preview.back);
          } catch (e) {
            console.error('splitDataUrlImage failed:', e);
            formStatus.textContent = 'Could not prepare design images: ' + e.message;
            return;
          }

          formStatus.textContent = 'Sending your request\u2026';

          var data = {
            name:          formFields.name,
            phone:         formFields.phone,
            email:         formFields.email,
            notes:         formFields.notes,
            frontImage:    frontData.base64,
            backImage:     backData.base64,
            frontMimeType: frontData.mimeType,
            backMimeType:  backData.mimeType
          };

          var body = JSON.stringify(data);

          fetch(APPS_SCRIPT_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: body
          })
            .then(function (res) {
              if (!res.ok) {
                throw new Error('Server responded with status ' + res.status);
              }
              formStatus.textContent = 'Quote request sent successfully. We will contact you soon.';
              quoteForm.reset();
            })
            .catch(function (err) {
              console.warn('fetch failed, trying sendBeacon:', err);
              if (navigator.sendBeacon) {
                var sent = navigator.sendBeacon(APPS_SCRIPT_ENDPOINT, body);
                if (sent) {
                  formStatus.textContent = 'Quote request sent successfully. We will contact you soon.';
                  quoteForm.reset();
                  return;
                }
              }
              formStatus.textContent = 'Submission failed: ' + (err && err.message ? err.message : 'network error') + '. Please try again.';
            });
        })
        .catch(function (err) {
          console.error('exportCombinedPreview failed:', err);
          formStatus.textContent = 'Could not compose shirt preview: ' + (err && err.message ? err.message : String(err));
        });
    });
  }

  function resizeCanvases() {
    const wrapper = document.getElementById('canvasWrapper');
    const rect = wrapper.getBoundingClientRect();
    const scaleX = rect.width / STAGE_WIDTH;
    const scaleY = rect.height / STAGE_HEIGHT;

    Object.keys(canvases).forEach(function (side) {
      canvases[side].setDimensions({ width: rect.width, height: rect.height });
      canvases[side].setViewportTransform([scaleX, 0, 0, scaleY, 0, 0]);
      canvases[side].calcOffset();
      canvases[side].requestRenderAll();
    });
  }

  productTitle.textContent = 'Customize ' + product.name;
  populateColorOptions();
  colorSelect.value = state.activeColor.value;
  Object.keys(canvases).forEach(function (side) {
    applyClip(canvases[side]);
    bindCanvasEvents(canvases[side]);
    canvasContainers[side] =
      canvases[side].wrapperEl ||
      (canvases[side].upperCanvasEl && canvases[side].upperCanvasEl.parentElement) ||
      (canvases[side].lowerCanvasEl && canvases[side].lowerCanvasEl.parentElement) ||
      null;
  });
  setSideButtonState();
  wireControls();
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();
  updateLayerSources().then(function () {
    updatePlacementPreviews();
  });
})();
