(function () {
  const STAGE_WIDTH = 700;
  const STAGE_HEIGHT = 760;
  const MODEL_BG_SRC = 'assets/mockups/model-bg.svg';
  const APPS_SCRIPT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxFAOyYxTchKlBAMBMuiZuB4nWOECaCGyx62C5OSocjJWG7BvCc26EVs-uDaREA5V04/exec';
  const SUBMISSION_IMAGE_TYPE = 'image/png';
  const DEFAULT_PRINT_AREA = { left: 235, top: 270, width: 230, height: 260 };
  const MIN_PRINT_AREA = { width: 120, height: 120 };
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
    { name: 'Royal Blue', value: '#2563eb', stroke: '#1e3a8a' },
    { name: 'Sky Blue', value: '#38bdf8', stroke: '#0284c7' },
    { name: 'Red', value: '#b91c1c', stroke: '#7f1d1d' },
    { name: 'Maroon', value: '#7f1d1d', stroke: '#5f1414' },
    { name: 'Orange', value: '#ea580c', stroke: '#9a3412' },
    { name: 'Yellow', value: '#facc15', stroke: '#a16207' },
    { name: 'Green', value: '#15803d', stroke: '#14532d' },
    { name: 'Mint', value: '#10b981', stroke: '#047857' },
    { name: 'Purple', value: '#7c3aed', stroke: '#5b21b6' },
    { name: 'Pink', value: '#ec4899', stroke: '#be185d' },
    { name: 'Grey', value: '#6b7280', stroke: '#4b5563' }
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
  const customColorName = document.getElementById('customColorName');
  const customColorValue = document.getElementById('customColorValue');
  const imageUploadInput = document.getElementById('imageUploadInput');
  const addImageBtn = document.getElementById('addImageBtn');
  const addTextBtn = document.getElementById('addTextBtn');
  const editPrintAreaBtn = document.getElementById('editPrintAreaBtn');
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
  const shirtColorNameData = document.getElementById('shirtColorNameData');
  const shirtColorHexData = document.getElementById('shirtColorHexData');
  const quoteForm = document.getElementById('quoteForm');
  const formStatus = document.getElementById('formStatus');
  const frontSideBtn = document.getElementById('frontSideBtn');
  const backSideBtn = document.getElementById('backSideBtn');
  const controlsToggleBtn = document.getElementById('controlsToggleBtn');
  const mobileControlsFab = document.getElementById('mobileControlsFab');
  const mobileControlsCloseBtn = document.getElementById('mobileControlsCloseBtn');
  const mobileControlsBackdrop = document.getElementById('mobileControlsBackdrop');
  const toolbarLeft = document.querySelector('.toolbar-left');
  const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;

  const canvases = {
    front: new fabric.Canvas('designCanvasFront', {
      preserveObjectStacking: true,
      selection: true,
      centeredScaling: false,
      allowTouchScrolling: false,
      fireRightClick: false,
      stopContextMenu: true
    }),
    back: new fabric.Canvas('designCanvasBack', {
      preserveObjectStacking: true,
      selection: true,
      centeredScaling: false,
      allowTouchScrolling: false,
      fireRightClick: false,
      stopContextMenu: true
    })
  };

  const canvasElements = {
    front: document.getElementById('designCanvasFront'),
    back: document.getElementById('designCanvasBack')
  };

  const canvasContainers = {
    front: null,
    back: null
  };

  const printAreas = {
    front: Object.assign({}, DEFAULT_PRINT_AREA),
    back: Object.assign({}, DEFAULT_PRINT_AREA)
  };

  const printAreaGuides = {
    front: null,
    back: null
  };

  const imageCache = new Map();
  let modelBgImage = null;
  let previewTimer = null;
  let isPrintAreaEditMode = false;

  function setMobileControlsOpen(opened) {
    if (!toolbarLeft) return;
    const isOpen = Boolean(opened);
    toolbarLeft.classList.toggle('mobile-expanded', isOpen);
    document.body.classList.toggle('mobile-controls-open', isOpen);

    if (controlsToggleBtn) {
      controlsToggleBtn.setAttribute('aria-expanded', String(isOpen));
    }

    if (mobileControlsFab) {
      mobileControlsFab.setAttribute('aria-expanded', String(isOpen));
    }
  }

  function wireMobileControlsPanel() {
    if (!toolbarLeft || !isMobileViewport) return;

    if (controlsToggleBtn) {
      controlsToggleBtn.addEventListener('click', function () {
        setMobileControlsOpen(!toolbarLeft.classList.contains('mobile-expanded'));
      });
    }

    if (mobileControlsFab) {
      mobileControlsFab.addEventListener('click', function () {
        setMobileControlsOpen(!toolbarLeft.classList.contains('mobile-expanded'));
      });
    }

    if (mobileControlsCloseBtn) {
      mobileControlsCloseBtn.addEventListener('click', function () {
        setMobileControlsOpen(false);
      });
    }

    if (mobileControlsBackdrop) {
      mobileControlsBackdrop.addEventListener('click', function () {
        setMobileControlsOpen(false);
      });
    }
  }

  function applyMobileCanvasTouchTuning() {
    if (!isMobileViewport) return;

    // Keep touch gestures on canvas dedicated to object manipulation on mobile.
    Object.keys(canvases).forEach(function (side) {
      const canvas = canvases[side];
      if (canvas.upperCanvasEl) {
        canvas.upperCanvasEl.style.touchAction = 'none';
      }
      if (canvas.lowerCanvasEl) {
        canvas.lowerCanvasEl.style.touchAction = 'none';
      }

      canvas.selectionFullyContained = false;
      canvas.uniformScaling = false;
    });

    fabric.Object.prototype.touchCornerSize = 26;
    fabric.Object.prototype.cornerSize = 12;
    fabric.Object.prototype.padding = 4;
  }

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

  function getPrintArea(side) {
    return printAreas[side || state.activeSide];
  }

  function normalizePrintArea(left, top, width, height) {
    const normalizedWidth = Math.min(
      Math.max(width, MIN_PRINT_AREA.width),
      STAGE_WIDTH
    );
    const normalizedHeight = Math.min(
      Math.max(height, MIN_PRINT_AREA.height),
      STAGE_HEIGHT
    );

    const normalizedLeft = Math.min(
      Math.max(left, 0),
      STAGE_WIDTH - normalizedWidth
    );
    const normalizedTop = Math.min(
      Math.max(top, 0),
      STAGE_HEIGHT - normalizedHeight
    );

    return {
      left: normalizedLeft,
      top: normalizedTop,
      width: normalizedWidth,
      height: normalizedHeight
    };
  }

  function applyClip(canvas, side) {
    const area = getPrintArea(side);
    canvas.clipPath = new fabric.Rect({
      left: area.left,
      top: area.top,
      width: area.width,
      height: area.height,
      absolutePositioned: true
    });
  }

  function applyStageClip(canvas) {
    canvas.clipPath = new fabric.Rect({
      left: 0,
      top: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      absolutePositioned: true
    });
  }

  function clampObjectToPrintArea(obj, side) {
    if (!obj) return;
    if (obj.isPrintAreaGuide) return;

    const area = getPrintArea(side);

    // Use canvas-space bounds so clamping remains correct after viewport scaling.
    const bounds = obj.getBoundingRect(false, true);
    if (bounds.width > area.width || bounds.height > area.height) {
      const ratio = Math.min(area.width / bounds.width, area.height / bounds.height, 1);
      obj.scaleX *= ratio;
      obj.scaleY *= ratio;
      obj.setCoords();
    }

    const next = obj.getBoundingRect(false, true);
    let dx = 0;
    let dy = 0;

    if (next.left < area.left) dx = area.left - next.left;
    if (next.top < area.top) dy = area.top - next.top;
    if (next.left + next.width > area.left + area.width) dx = (area.left + area.width) - (next.left + next.width);
    if (next.top + next.height > area.top + area.height) dy = (area.top + area.height) - (next.top + next.height);

    obj.left += dx;
    obj.top += dy;
    obj.setCoords();
  }

  function syncPrintAreaGuide(side) {
    const area = getPrintArea(side);
    const guide = printAreaGuides[side];
    if (!guide) return;

    guide.set({
      left: area.left,
      top: area.top,
      width: area.width,
      height: area.height,
      scaleX: 1,
      scaleY: 1
    });
    guide.setCoords();
  }

  function clampAllDesignObjects(side) {
    const canvas = canvases[side];
    canvas.getObjects().forEach(function (obj) {
      clampObjectToPrintArea(obj, side);
    });
    canvas.requestRenderAll();
  }

  function updatePrintAreaFromGuide(side) {
    const guide = printAreaGuides[side];
    if (!guide) return;

    const area = normalizePrintArea(
      guide.left,
      guide.top,
      guide.getScaledWidth(),
      guide.getScaledHeight()
    );

    printAreas[side] = area;
    syncPrintAreaGuide(side);
    if (isPrintAreaEditMode && side === state.activeSide) {
      applyStageClip(canvases[side]);
    } else {
      applyClip(canvases[side], side);
    }
    clampAllDesignObjects(side);

    if (side === state.activeSide) {
      schedulePlacementPreviewUpdate();
    }
  }

  function updatePrintAreaPositionFromGuide(side) {
    const guide = printAreaGuides[side];
    if (!guide) return;

    const current = getPrintArea(side);
    const area = normalizePrintArea(
      guide.left,
      guide.top,
      current.width,
      current.height
    );

    printAreas[side] = area;
    syncPrintAreaGuide(side);
    if (isPrintAreaEditMode && side === state.activeSide) {
      applyStageClip(canvases[side]);
    } else {
      applyClip(canvases[side], side);
    }
    clampAllDesignObjects(side);

    if (side === state.activeSide) {
      schedulePlacementPreviewUpdate();
    }
  }

  function setPrintAreaEditMode(enabled, silent) {
    isPrintAreaEditMode = enabled;
    if (editPrintAreaBtn) {
      editPrintAreaBtn.classList.toggle('active', enabled);
      editPrintAreaBtn.textContent = enabled ? 'Lock Print Area' : 'Edit Print Area';
      editPrintAreaBtn.title = enabled ? 'Lock current print area' : 'Enable print area resize mode';
    }

    Object.keys(printAreaGuides).forEach(function (side) {
      const guide = printAreaGuides[side];
      if (!guide) return;

      if (enabled && side === state.activeSide) {
        applyStageClip(canvases[side]);
      } else {
        applyClip(canvases[side], side);
      }

      const editable = enabled && side === state.activeSide;
      guide.set({
        selectable: editable,
        evented: editable,
        hasControls: editable,
        borderColor: '#2563eb',
        cornerColor: editable ? '#2563eb' : 'rgba(37, 99, 235, 0)',
        stroke: editable ? '#1d4ed8' : 'rgba(37, 99, 235, 0.92)',
        fill: editable ? 'rgba(59, 130, 246, 0.11)' : 'rgba(59, 130, 246, 0.06)',
        strokeWidth: editable ? 2.5 : 2,
        strokeDashArray: editable ? [12, 8] : [10, 8],
        opacity: 1
      });

      canvases[side].bringToFront(guide);
    });

    const activeCanvas = getCurrentCanvas();
    if (!enabled) {
      activeCanvas.discardActiveObject();
      if (!silent) {
        formStatus.textContent = 'Print area locked. Design objects stay inside the highlighted region.';
      }
    } else {
      activeCanvas.setActiveObject(printAreaGuides[state.activeSide]);
      if (!silent) {
        formStatus.textContent = 'Print area edit mode enabled. Drag corners to resize the print region.';
      }
    }

    activeCanvas.requestRenderAll();
  }

  function createPrintAreaGuide(side) {
    const area = getPrintArea(side);
    const guide = new fabric.Rect({
      left: area.left,
      top: area.top,
      width: area.width,
      height: area.height,
      fill: 'rgba(59, 130, 246, 0.08)',
      stroke: '#2563eb',
      strokeWidth: 2,
      strokeUniform: true,
      strokeDashArray: [10, 8],
      rx: 8,
      ry: 8,
      selectable: false,
      evented: false,
      hasControls: false,
      lockRotation: true,
      lockScalingFlip: true,
      centeredScaling: false,
      centeredRotation: false,
      transparentCorners: false,
      cornerStyle: 'circle',
      cornerSize: isMobileViewport ? 12 : 10,
      touchCornerSize: isMobileViewport ? 28 : 24,
      borderScaleFactor: 2,
      objectCaching: false,
      noScaleCache: false,
      excludeFromExport: true
    });

    guide.isPrintAreaGuide = true;
    guide.controls.mtr.visible = false;

    const canvas = canvases[side];
    canvas.add(guide);
    canvas.bringToFront(guide);
    printAreaGuides[side] = guide;
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
    syncPrintAreaGuide(side);
    if (printAreaGuides[side]) {
      canvases[side].bringToFront(printAreaGuides[side]);
    }
    canvases[side].calcOffset();
    setPrintAreaEditMode(isPrintAreaEditMode, true);
    syncSelectedTextControls();
    schedulePlacementPreviewUpdate();
  }

  function normalizeHexColor(value) {
    var raw = (value || '').trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(raw)) {
      raw = raw.split('').map(function (ch) { return ch + ch; }).join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(raw)) {
      return '';
    }
    return '#' + raw.toLowerCase();
  }

  function adjustHexColor(hex, factor) {
    var normalized = normalizeHexColor(hex);
    if (!normalized) return '#334155';

    var intValue = parseInt(normalized.slice(1), 16);
    var r = (intValue >> 16) & 255;
    var g = (intValue >> 8) & 255;
    var b = intValue & 255;

    function scale(channel) {
      var next = Math.round(channel * factor);
      return Math.max(0, Math.min(255, next));
    }

    var rr = scale(r).toString(16).padStart(2, '0');
    var gg = scale(g).toString(16).padStart(2, '0');
    var bb = scale(b).toString(16).padStart(2, '0');
    return '#' + rr + gg + bb;
  }

  function findColorByHex(hex) {
    var normalized = normalizeHexColor(hex);
    if (!normalized) return null;

    return SHIRT_COLORS.find(function (item) {
      return item.value.toLowerCase() === normalized;
    }) || null;
  }

  function findColorMentionInText(text) {
    var lower = String(text || '').toLowerCase();
    if (!lower) return null;
    var compact = lower.replace(/[\s_-]+/g, '');

    var direct = SHIRT_COLORS.find(function (item) {
      return lower.indexOf(item.name.toLowerCase()) !== -1;
    });
    if (direct) return direct;

    var aliasToHex = {
      blue: '#2563eb',
      lightblue: '#38bdf8',
      skyblue: '#38bdf8',
      navy: '#1e3a8a',
      red: '#b91c1c',
      maroon: '#7f1d1d',
      orange: '#ea580c',
      yellow: '#facc15',
      green: '#15803d',
      mint: '#10b981',
      purple: '#7c3aed',
      violet: '#7c3aed',
      pink: '#ec4899',
      black: '#111827',
      white: '#ffffff',
      grey: '#6b7280',
      gray: '#6b7280'
    };

    var alias = Object.keys(aliasToHex).find(function (key) {
      return lower.indexOf(key) !== -1 || compact.indexOf(key.replace(/[\s_-]+/g, '')) !== -1;
    });

    return alias ? findColorByHex(aliasToHex[alias]) : null;
  }

  function syncCustomColorInputsFromActiveColor(mode) {
    if (customColorValue) {
      customColorValue.value = state.activeColor.value;
    }
    if (customColorName) {
      customColorName.value = mode === 'preset' ? '' : state.activeColor.name;
    }
    if (shirtColorNameData) {
      shirtColorNameData.value = state.activeColor.name;
    }
    if (shirtColorHexData) {
      shirtColorHexData.value = state.activeColor.value;
    }
  }

  function upsertCustomColor(name, hex) {
    var normalizedHex = normalizeHexColor(hex);
    if (!normalizedHex) return null;

    var label = (name || '').trim() || normalizedHex.toUpperCase();
    var existing = SHIRT_COLORS.find(function (item) {
      return item.name.toLowerCase() === label.toLowerCase() || item.value.toLowerCase() === normalizedHex;
    });

    if (existing) {
      existing.name = label;
      existing.value = normalizedHex;
      existing.stroke = adjustHexColor(normalizedHex, 0.65);
      return existing;
    }

    var next = {
      name: label,
      value: normalizedHex,
      stroke: adjustHexColor(normalizedHex, 0.65)
    };
    SHIRT_COLORS.push(next);
    return next;
  }

  function applyCustomColorFromInputs(source) {
    var name = (customColorName && customColorName.value ? customColorName.value : '').trim();
    var hex = normalizeHexColor(customColorValue ? customColorValue.value : '');

    if (source === 'name') {
      var typedHex = normalizeHexColor(name);
      if (typedHex) {
        hex = typedHex;
        if (customColorValue) customColorValue.value = typedHex;
        name = typedHex.toUpperCase();
      } else {
        var mentioned = findColorMentionInText(name);
        if (mentioned) {
          if (customColorValue) customColorValue.value = mentioned.value;
          applySelectedColor(mentioned.value, 'custom');
          return;
        }
      }
    }

    if (!hex) return;

    var entry = upsertCustomColor(name, hex);
    if (!entry) return;

    populateColorOptions();
    applySelectedColor(entry.value, 'custom');
  }

  function applySelectedColor(value, mode) {
    state.activeColor = SHIRT_COLORS.find(function (item) {
      return item.value.toLowerCase() === String(value || '').toLowerCase();
    }) || SHIRT_COLORS[0];

    colorSelect.value = state.activeColor.value;
    syncCustomColorInputsFromActiveColor(mode || 'preset');
    updateLayerSources().then(function () {
      schedulePlacementPreviewUpdate();
    });
  }

  function populateColorOptions() {
    colorSelect.innerHTML = SHIRT_COLORS.map(function (color) {
      return '<option value="' + color.value + '">' + color.name + '</option>';
    }).join('');

    if (!colorSelect.dataset.bound) {
      colorSelect.addEventListener('change', function () {
        applySelectedColor(colorSelect.value, 'preset');
      });
      colorSelect.dataset.bound = '1';
    }
  }

  function addText() {
    const canvas = getCurrentCanvas();
    const area = getPrintArea();
    const textObj = new fabric.IText('Your Text', {
      left: area.left + 20,
      top: area.top + 20,
      fontSize: 32,
      fill: textColor.value,
      fontFamily: fontSelect.value,
      cornerColor: '#2563eb',
      borderColor: '#2563eb',
      cornerSize: isMobileViewport ? 12 : 10,
      touchCornerSize: isMobileViewport ? 28 : 24,
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
        const area = getPrintArea();
        const maxWidth = area.width * 0.75;
        if (img.width > maxWidth) {
          img.scaleToWidth(maxWidth);
        }

        img.set({
          left: area.left + 22,
          top: area.top + 24,
          cornerColor: '#2563eb',
          borderColor: '#2563eb',
          cornerSize: isMobileViewport ? 12 : 10,
          touchCornerSize: isMobileViewport ? 28 : 24,
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
    if (active.isPrintAreaGuide) return;

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

  function bindCanvasEvents(canvas, side) {
    canvas.on('object:moving', function (event) {
      if (event.target && event.target.isPrintAreaGuide) {
        updatePrintAreaPositionFromGuide(side);
        return;
      }
      clampObjectToPrintArea(event.target, side);
    });

    canvas.on('object:scaling', function (event) {
      if (event.target && event.target.isPrintAreaGuide) {
        // Avoid mutating guide geometry mid-transform; commit on object:modified.
        return;
      }
      clampObjectToPrintArea(event.target, side);
    });

    canvas.on('object:rotating', function (event) { clampObjectToPrintArea(event.target, side); });

    canvas.on('object:modified', function (event) {
      if (event.target && event.target.isPrintAreaGuide) {
        updatePrintAreaFromGuide(side);
      }
      schedulePlacementPreviewUpdate();
    });

    canvas.on('object:added', function () {
      if (printAreaGuides[side]) {
        canvas.bringToFront(printAreaGuides[side]);
      }
      schedulePlacementPreviewUpdate();
    });

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
    if (leftTextBtn) {
      leftTextBtn.addEventListener('click', addText);
    }

    if (editPrintAreaBtn) {
      editPrintAreaBtn.addEventListener('click', function () {
        setPrintAreaEditMode(!isPrintAreaEditMode);
      });
    }

    if (customColorName) {
      customColorName.addEventListener('input', function () {
        var typed = customColorName.value;
        var typedHex = normalizeHexColor(typed);

        if (typedHex) {
          if (customColorValue) customColorValue.value = typedHex;
          return;
        }

        var mentioned = findColorMentionInText(typed);
        if (mentioned && customColorValue) {
          customColorValue.value = mentioned.value;
          applySelectedColor(mentioned.value, 'custom');
        }
      });

      customColorName.addEventListener('change', function () {
        applyCustomColorFromInputs('name');
      });
    }

    if (customColorValue) {
      customColorValue.addEventListener('change', function () {
        var pickedHex = normalizeHexColor(customColorValue.value);
        if (!pickedHex) return;

        var known = findColorByHex(pickedHex);
        if (customColorName) {
          customColorName.value = known ? known.name : pickedHex.toUpperCase();
        }

        applyCustomColorFromInputs('picker');
      });
    }

    addImageBtn.addEventListener('click', function () { imageUploadInput.click(); });
    if (leftUploadBtn) {
      leftUploadBtn.addEventListener('click', function () { imageUploadInput.click(); });
    }
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
            shirtColorName: state.activeColor.name,
            shirtColorHex: state.activeColor.value,
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
  applySelectedColor(state.activeColor.value, 'preset');
  if (customColorValue) {
    customColorValue.value = state.activeColor.value;
  }
  Object.keys(canvases).forEach(function (side) {
    canvases[side].centeredScaling = false;
    applyClip(canvases[side], side);
    bindCanvasEvents(canvases[side], side);
    createPrintAreaGuide(side);
    canvasContainers[side] =
      canvases[side].wrapperEl ||
      (canvases[side].upperCanvasEl && canvases[side].upperCanvasEl.parentElement) ||
      (canvases[side].lowerCanvasEl && canvases[side].lowerCanvasEl.parentElement) ||
      null;
  });
  setSideButtonState();
  setPrintAreaEditMode(false, true);
  wireControls();
  wireMobileControlsPanel();
  applyMobileCanvasTouchTuning();
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();
  updateLayerSources().then(function () {
    updatePlacementPreviews();
  });
})();
