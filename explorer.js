/**
 * Native product explorer used by the Palmer collection page.
 *
 * The explorer deliberately receives its layout and image URLs from the page
 * instead of fetching or executing any source-site code.  `desktop` and
 * `mobile` are the captured layout records from evidence/source/*.json.
 */

const DESKTOP = { width: 1440, height: 900, breakpoint: 1024 };
const MOBILE = { width: 390, height: 844 };
const ZOOM_LEVELS = [0.65, 1, 1.4];
const DRAG_THRESHOLD = 5;
const INERTIA_DAMPING = 0.9;
const FRAME_EASE = 0.28;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const hasWindow = typeof window !== "undefined";

function getViewport(container) {
  const view = container?.ownerDocument?.defaultView || (hasWindow ? window : null);
  const rect = container?.getBoundingClientRect?.();
  // Camera coordinates are tied to the browser viewport, even while the host
  // shifts this surface sideways for a selected collection. Falling back to
  // the container box keeps the module usable in DOM test harnesses without a
  // real window.
  const width = view?.innerWidth || rect?.width || container?.clientWidth || DESKTOP.width;
  const height = view?.innerHeight || rect?.height || container?.clientHeight || DESKTOP.height;
  const innerWidth = view?.innerWidth || width;
  return { width, height, innerWidth, view };
}

function prefersReducedMotion(view) {
  try {
    return Boolean(view?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  } catch {
    return false;
  }
}

function raf(view, callback) {
  if (view?.requestAnimationFrame) return view.requestAnimationFrame(callback);
  return setTimeout(() => callback(Date.now()), 16);
}

function caf(view, id) {
  if (id == null) return;
  if (view?.cancelAnimationFrame) view.cancelAnimationFrame(id);
  else clearTimeout(id);
}

function asRecord(record) {
  if (!record || typeof record !== "object") return { data: {}, src: "", x: 0, y: 0, size: 0 };
  const data = record.data && typeof record.data === "object" ? record.data : {};
  return {
    ...record,
    data,
    src: typeof record.src === "string" ? record.src : "",
    x: Number.isFinite(Number(record.x)) ? Number(record.x) : 0,
    y: Number.isFinite(Number(record.y)) ? Number(record.y) : 0,
    size: Number.isFinite(Number(record.size)) ? Number(record.size) : 0,
  };
}

function itemName(record) {
  return String(record?.data?.name || record?.data?.collection || "Dinnerware item");
}

/**
 * Build an interactive, pannable product canvas.
 *
 * @param {HTMLElement} container Element that owns the explorer.
 * @param {{desktop?: Array, mobile?: Array, onSelect?: Function, onHover?: Function}} options
 * @returns {{filter: Function, zoom: Function, resize: Function, setActive: Function, reset: Function, destroy: Function}}
 */
export function createExplorer(container, options = {}) {
  if (!container || typeof container.appendChild !== "function") {
    throw new TypeError("createExplorer requires a DOM container");
  }

  const view = container.ownerDocument?.defaultView || (hasWindow ? window : null);
  const desktop = Array.isArray(options.desktop) ? options.desktop.map(asRecord) : [];
  const mobile = Array.isArray(options.mobile) ? options.mobile.map(asRecord) : [];
  const onSelect = typeof options.onSelect === "function" ? options.onSelect : () => {};
  const onHover = typeof options.onHover === "function" ? options.onHover : () => {};

  // The explorer is a viewport-level surface in the source experience.  The
  // inline values keep it usable when the host page has not loaded its CSS yet.
  container.classList.add("explorer-canvas");
  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.overflow = "hidden";
  container.style.touchAction = "none";
  container.style.userSelect = "none";
  container.tabIndex = container.tabIndex >= 0 ? container.tabIndex : 0;

  const stage = container.ownerDocument.createElement("div");
  stage.className = "explorer-stage";
  stage.setAttribute("aria-hidden", "false");
  stage.style.position = "absolute";
  stage.style.left = "0";
  stage.style.top = "0";
  stage.style.width = "0";
  stage.style.height = "0";
  stage.style.transformOrigin = "0 0";
  stage.style.willChange = "transform";
  container.appendChild(stage);

  const state = {
    destroyed: false,
    active: true,
    mode: null,
    viewport: getViewport(container),
    source: [],
    refs: [],
    filterPredicate: null,
    reducedMotion: prefersReducedMotion(view),
    zoomIndex: 1,
    baseScale: 1,
    scale: 1,
    targetScale: 1,
    panX: 0,
    panY: 0,
    targetPanX: 0,
    targetPanY: 0,
    velocityX: 0,
    velocityY: 0,
    animationFrame: null,
    pointerId: null,
    pointerStartX: 0,
    pointerStartY: 0,
    pointerLastX: 0,
    pointerLastY: 0,
    pointerDistance: 0,
    pointerMoved: false,
    pointerItem: null,
    suppressClick: false,
    lastPointerX: null,
    lastPointerY: null,
    hoverItem: null,
    wrapWidth: 0,
  };

  function selectedLayout() {
    return state.mode === "mobile" ? mobile : desktop;
  }

  function getMode(viewport = state.viewport) {
    return viewport.innerWidth <= DESKTOP.breakpoint ? "mobile" : "desktop";
  }

  function updateViewport() {
    state.viewport = getViewport(container);
    state.reducedMotion = prefersReducedMotion(view);
  }

  function updateSourceGeometry() {
    const config = state.mode === "mobile" ? MOBILE : DESKTOP;
    const { width, height } = state.viewport;
    state.baseScale = width / config.width;
    state.scale = state.baseScale * ZOOM_LEVELS[state.zoomIndex];
    state.targetScale = state.scale;

    // Layout coordinates are captured from the top-left source viewport. Keep
    // that origin at (0, 0), scale uniformly from the viewport width, and
    // center only the vertical letterbox when the aspect ratio changes.
    const letterboxY = (height - config.height * state.baseScale) / 2;
    state.baseX = 0;
    state.baseY = letterboxY;

    const columns = new Map();
    state.refs.forEach((ref) => {
      const column = columns.get(ref.record.x) || [];
      column.push(ref);
      columns.set(ref.record.x, column);
    });
    const xs = [...columns.keys()].sort((a, b) => a - b);
    const maxSize = Math.max(0, ...state.source.map(item => item.size));
    const stepX = xs.length > 1 ? xs[1] - xs[0] : maxSize;
    state.wrapWidth = Math.max((xs.at(-1) || 0) - (xs[0] || 0) + stepX,
      width / (state.baseScale * ZOOM_LEVELS[0]) + maxSize);
    columns.forEach((column) => {
      column.sort((a, b) => a.record.y - b.record.y);
      const stepY = column.length > 1 ? column[1].record.y - column[0].record.y : maxSize;
      const period = Math.max(column.at(-1).record.y - column[0].record.y + stepY,
        height / (state.baseScale * ZOOM_LEVELS[0]) + maxSize);
      column.forEach(ref => { ref.wrapHeight = period; });
    });
  }

  function stageTransform(initial = false) {
    const translateX = state.baseX + state.panX;
    const translateY = state.baseY + state.panY;
    stage.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${state.scale})`;
    state.refs.forEach((ref) => {
      const { x, y, size } = ref.record;
      // Recycle offscreen products across the captured grid instead of ending the field.
      const tileX = Math.ceil((-translateX / state.scale - x - size) / state.wrapWidth);
      const tileY = Math.ceil((-translateY / state.scale - y - size) / ref.wrapHeight);
      const wrappedX = x + tileX * state.wrapWidth;
      const wrappedY = y + tileY * ref.wrapHeight;
      ref.button.style.left = `${wrappedX}px`;
      ref.button.style.top = `${wrappedY}px`;
      const left = translateX + wrappedX * state.scale;
      const top = translateY + wrappedY * state.scale;
      const extent = size * state.scale;
      const inViewport = left + extent > 0 && top + extent > 0 &&
        left < state.viewport.width && top < state.viewport.height;
      const recycled = tileX !== ref.tileX || tileY !== ref.tileY;
      ref.tileX = tileX;
      ref.tileY = tileY;
      if (inViewport === ref.inViewport && !recycled) return;
      ref.inViewport = inViewport;
      ref.revealAnimation?.cancel();
      setVisualState(ref, ref.visible, true);
      if (inViewport && ref.visible) reveal(ref, initial ? ref.index : null);
    });
  }

  function ensureFrame() {
    if (state.destroyed || state.animationFrame != null) return;
    state.animationFrame = raf(view, () => {
      state.animationFrame = null;
      tick();
    });
  }

  function tick() {
    if (state.destroyed) return;
    const scaleDelta = state.targetScale - state.scale;
    const panDeltaX = state.targetPanX - state.panX;
    const panDeltaY = state.targetPanY - state.panY;
    state.scale += scaleDelta * FRAME_EASE;
    state.panX += panDeltaX * FRAME_EASE;
    state.panY += panDeltaY * FRAME_EASE;
    state.velocityX *= INERTIA_DAMPING;
    state.velocityY *= INERTIA_DAMPING;

    if (state.pointerId == null && (Math.abs(state.velocityX) > 0.05 || Math.abs(state.velocityY) > 0.05)) {
      state.targetPanX += state.velocityX;
      state.targetPanY += state.velocityY;
    }
    stageTransform();

    const stillMoving =
      Math.abs(scaleDelta) > 0.001 ||
      Math.abs(panDeltaX) > 0.1 ||
      Math.abs(panDeltaY) > 0.1 ||
      Math.abs(state.velocityX) > 0.05 ||
      Math.abs(state.velocityY) > 0.05;
    if (stillMoving) ensureFrame();
  }

  function setPan(x, y, immediate = false) {
    state.targetPanX = x;
    state.targetPanY = y;
    if (immediate || state.reducedMotion) {
      state.panX = x;
      state.panY = y;
      stageTransform();
      return;
    }
    ensureFrame();
  }

  function setScaleAt(nextZoomIndex, clientX = state.viewport.width / 2, clientY = state.viewport.height / 2) {
    const nextIndex = clamp(nextZoomIndex, 0, ZOOM_LEVELS.length - 1);
    if (nextIndex === state.zoomIndex && Math.abs(state.targetScale - state.scale) < 0.001) return;

    const oldScale = state.scale || state.baseScale * ZOOM_LEVELS[state.zoomIndex];
    const newScale = state.baseScale * ZOOM_LEVELS[nextIndex];
    const rect = container.getBoundingClientRect?.();
    const localX = clientX - (rect?.left || 0);
    const localY = clientY - (rect?.top || 0);
    // Keep the world point below the pointer fixed while zooming.
    const worldX = (localX - state.baseX - state.panX) / oldScale;
    const worldY = (localY - state.baseY - state.panY) / oldScale;
    state.zoomIndex = nextIndex;
    state.targetScale = newScale;
    const nextPan = {
      x: localX - state.baseX - worldX * newScale,
      y: localY - state.baseY - worldY * newScale,
    };
    state.targetPanX = nextPan.x;
    state.targetPanY = nextPan.y;
    if (state.reducedMotion) {
      state.scale = newScale;
      state.panX = nextPan.x;
      state.panY = nextPan.y;
      stageTransform();
    } else {
      ensureFrame();
    }
  }

  function zoom(delta = 0, anchorX, anchorY) {
    const number = Number(delta);
    if (!Number.isFinite(number) || number === 0) return api;
    // Public calls use +/-1 as a step; larger values are interpreted as a
    // requested zoom level when they match one of the captured levels.
    let nextIndex;
    if (Math.abs(number) > 1 && ZOOM_LEVELS.includes(number)) {
      nextIndex = ZOOM_LEVELS.indexOf(number);
    } else {
      nextIndex = state.zoomIndex + (number > 0 ? 1 : -1);
    }
    setScaleAt(
      nextIndex,
      Number.isFinite(anchorX) ? anchorX : state.viewport.width / 2,
      Number.isFinite(anchorY) ? anchorY : state.viewport.height / 2,
    );
    return api;
  }

  function setVisualState(ref, visible, immediate = false) {
    const { button, visual, image } = ref;
    visible = visible && ref.inViewport;
    if (!visible) ref.revealAnimation?.cancel();
    button.dataset.visible = String(visible);
    button.setAttribute("aria-hidden", String(!visible));
    button.tabIndex = visible && state.active ? 0 : -1;
    button.style.pointerEvents = visible && state.active ? "auto" : "none";
    visual.style.transition = state.reducedMotion
      ? "none"
      : "opacity 420ms ease, transform 520ms cubic-bezier(.2,.8,.2,1)";
    visual.style.opacity = visible ? "1" : "0";
    visual.style.transform = visible ? "scale(1)" : "scale(0)";
    image.style.transform = "scale(1)";
    if (immediate) visual.style.transition = "none";
  }

  function applyFilter() {
    const predicate = state.filterPredicate;
    state.refs.forEach((ref) => {
      // The first argument is the full layout record. Its proxy also exposes
      // data fields at the top level, so both `item.data.color` and
      // `item.color` predicates remain ergonomic for the host page.
      const visible = typeof predicate !== "function" || Boolean(predicate(ref.filterItem, ref.record.data));
      ref.visible = visible;
      setVisualState(ref, visible);
    });
  }

  function reveal(ref, index) {
    if (state.reducedMotion || typeof ref.visual.animate !== "function") {
      ref.visual.style.opacity = "1";
      ref.visual.style.transform = "scale(1)";
      return;
    }
    ref.visual.style.opacity = "0";
    ref.visual.style.transform = "scale(0)";
    const animation = ref.visual.animate(
      [
        { opacity: 0, transform: "scale(0)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      {
        duration: 560,
        delay: index == null ? 0 : 800 + Math.min(index * 8, 720),
        easing: "cubic-bezier(.2,.8,.2,1)",
        fill: "both",
      },
    );
    ref.revealAnimation = animation;
    animation.onfinish = () => {
      if (state.destroyed) return;
      animation.cancel();
      ref.visual.style.opacity = ref.visible && ref.inViewport ? "1" : "0";
      ref.visual.style.transform = ref.visible && ref.inViewport ? "scale(1)" : "scale(0)";
    };
  }

  function createRef(record, index) {
    const document = container.ownerDocument;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "explorer-item";
    button.setAttribute("aria-label", itemName(record));
    button.dataset.index = String(index);
    button.dataset.collection = String(record.data.collection || "");
    button.dataset.type = String(record.data.type || "");
    button.dataset.color = String(record.data.color || "");
    button.style.position = "absolute";
    button.style.display = "block";
    button.style.margin = "0";
    button.style.padding = "0";
    button.style.border = "0";
    button.style.background = "transparent";
    button.style.cursor = "pointer";
    button.style.transformOrigin = "50% 50%";
    button.style.touchAction = "none";
    button.style.outlineOffset = "4px";

    const visual = document.createElement("span");
    visual.className = "explorer-item-visual";
    visual.style.display = "block";
    visual.style.width = "100%";
    visual.style.height = "100%";
    visual.style.transformOrigin = "50% 50%";
    visual.style.willChange = "transform, opacity";
    visual.style.pointerEvents = "none";

    const image = document.createElement("img");
    image.src = record.src;
    image.alt = itemName(record);
    image.draggable = false;
    image.decoding = "async";
    image.loading = index < 16 ? "eager" : "lazy";
    image.style.display = "block";
    image.style.width = "100%";
    image.style.height = "100%";
    image.style.objectFit = "contain";
    image.style.pointerEvents = "none";
    image.style.transformOrigin = "50% 50%";
    image.style.transform = "scale(1)";
    image.style.willChange = "transform";
    image.style.transition = state.reducedMotion ? "none" : "transform 180ms ease-out";
    visual.appendChild(image);
    button.appendChild(visual);
    stage.appendChild(button);

    const filterItem = new Proxy(record, {
      get(target, property, receiver) {
        if (Reflect.has(target, property)) return Reflect.get(target, property, receiver);
        return target.data?.[property];
      },
    });
    const ref = { record, filterItem, button, visual, image, index, visible: true, inViewport: false, revealAnimation: null };

    button.addEventListener("click", (event) => {
      if (state.suppressClick) {
        state.suppressClick = false;
        event.preventDefault();
        return;
      }
      if (ref.visible && state.active) onSelect(record, event);
    });
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.repeat && ref.visible && state.active) {
        // Native buttons dispatch a click after Enter keyup. Suppress that
        // follow-up so keyboard activation invokes the callback once.
        event.preventDefault();
        state.suppressClick = true;
        onSelect(record, event);
      }
    });
    button.addEventListener("pointerenter", (event) => {
      state.hoverItem = ref;
      onHover(record, event);
      updateProximity(event.clientX, event.clientY);
    });
    button.addEventListener("pointerleave", (event) => {
      if (state.hoverItem === ref) {
        state.hoverItem = null;
        onHover(null, event);
      }
      image.style.transform = "scale(1)";
    });
    return ref;
  }

  function updateRefsGeometry() {
    state.refs.forEach((ref) => {
      const { record, button } = ref;
      button.style.left = `${record.x}px`;
      button.style.top = `${record.y}px`;
      button.style.width = `${record.size}px`;
      button.style.height = `${record.size}px`;
    });
  }

  function render(mode) {
    state.mode = mode;
    state.source = selectedLayout();
    state.refs.forEach((ref) => ref.revealAnimation?.cancel?.());
    stage.replaceChildren();
    state.refs = state.source.map(createRef);
    state.refs.forEach((ref) => {
      ref.visible = true;
      setVisualState(ref, true, true);
    });
    updateRefsGeometry();
    updateSourceGeometry();
    stageTransform(true);
    applyFilter();
  }

  function resize() {
    if (state.destroyed) return api;
    updateViewport();
    const nextMode = getMode();
    if (nextMode !== state.mode) {
      // Desktop and mobile captures use different grids and camera origins.
      // A breakpoint crossing starts the new layout at its captured origin.
      state.panX = state.targetPanX = 0;
      state.panY = state.targetPanY = 0;
      state.velocityX = state.velocityY = 0;
      render(nextMode);
    }
    else {
      updateSourceGeometry();
      stageTransform();
    }
    return api;
  }

  function filter(predicate) {
    state.filterPredicate = typeof predicate === "function" ? predicate : null;
    applyFilter();
    return api;
  }

  function setActive(active) {
    state.active = Boolean(active);
    container.classList.toggle("is-active", state.active);
    container.dataset.active = String(state.active);
    stage.setAttribute("aria-hidden", String(!state.active));
    state.refs.forEach((ref) => {
      ref.button.tabIndex = ref.visible && ref.inViewport && state.active ? 0 : -1;
      ref.button.style.pointerEvents = ref.visible && ref.inViewport && state.active ? "auto" : "none";
    });
    if (!state.active) {
      container.classList.remove("dragging");
      state.pointerId = null;
      state.velocityX = 0;
      state.velocityY = 0;
    }
    return api;
  }

  function reset() {
    state.filterPredicate = null;
    state.zoomIndex = 1;
    state.targetScale = state.baseScale;
    state.velocityX = 0;
    state.velocityY = 0;
    state.targetPanX = 0;
    state.targetPanY = 0;
    if (state.reducedMotion) {
      state.scale = state.baseScale;
      state.panX = 0;
      state.panY = 0;
    }
    state.refs.forEach((ref) => {
      ref.visible = true;
      setVisualState(ref, true, state.reducedMotion);
    });
    ensureFrame();
    return api;
  }

  function updateProximity(clientX, clientY) {
    state.lastPointerX = clientX;
    state.lastPointerY = clientY;
    state.refs.forEach((ref) => {
      if (!ref.visible) return;
      const rect = ref.button.getBoundingClientRect?.();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const distance = Math.hypot(clientX - cx, clientY - cy);
      const radius = Math.max(rect.width, rect.height) * 1.15;
      const proximity = clamp(1 - distance / radius, 0, 1);
      const scale = 1 + proximity * 0.15;
      // Scale the image itself so host CSS targeting `.explorer-item img`
      // remains effective in browsers that do not interpolate wrapper spans.
      ref.image.style.transform = `scale(${scale})`;
    });
  }

  function pointerDown(event) {
    if (state.destroyed || !state.active || state.pointerId != null) return;
    state.pointerId = event.pointerId;
    state.pointerStartX = state.pointerLastX = event.clientX;
    state.pointerStartY = state.pointerLastY = event.clientY;
    state.pointerDistance = 0;
    state.pointerMoved = false;
    container.classList.remove("dragging");
    state.pointerItem = event.target?.closest?.(".explorer-item") || null;
    state.suppressClick = false;
    state.velocityX = 0;
    state.velocityY = 0;
  }

  function pointerMove(event) {
    if (state.destroyed) return;
    updateProximity(event.clientX, event.clientY);
    if (state.pointerId !== event.pointerId) return;
    const dx = event.clientX - state.pointerLastX;
    const dy = event.clientY - state.pointerLastY;
    state.pointerLastX = event.clientX;
    state.pointerLastY = event.clientY;
    state.pointerDistance = Math.hypot(event.clientX - state.pointerStartX, event.clientY - state.pointerStartY);
    if (state.pointerDistance > DRAG_THRESHOLD && !state.pointerMoved) {
      state.pointerMoved = true;
      // Capture only drags so ordinary clicks keep the product as their target.
      try {
        container.setPointerCapture?.(event.pointerId);
      } catch {
        // Pointer capture is optional in embedded webviews.
      }
    }
    if (!state.pointerMoved) return;
    container.classList.add("dragging");
    event.preventDefault();
    state.targetPanX += dx;
    state.targetPanY += dy;
    state.velocityX = dx;
    state.velocityY = dy;
    ensureFrame();
  }

  function pointerUp(event) {
    if (state.pointerId !== event.pointerId) return;
    if (state.pointerMoved) state.suppressClick = true;
    state.pointerId = null;
    container.classList.remove("dragging");
    try {
      container.releasePointerCapture?.(event.pointerId);
    } catch {
      // See pointerDown: capture is optional in embedded webviews.
    }
    if (state.pointerMoved) ensureFrame();
  }

  function pointerCancel(event) {
    if (state.pointerId !== event.pointerId) return;
    state.pointerId = null;
    container.classList.remove("dragging");
    state.velocityX = 0;
    state.velocityY = 0;
  }

  function wheel(event) {
    if (state.destroyed || !state.active) return;
    event.preventDefault();
    const deltaX = Number.isFinite(event.deltaX) ? event.deltaX : 0;
    const deltaY = Number.isFinite(event.deltaY) ? event.deltaY : 0;
    if (event.ctrlKey || event.metaKey) {
      // Trackpads report pinch gestures as a modified wheel. Keep ordinary
      // wheel scrolling available for panning the product field.
      const delta = deltaY === 0 ? deltaX : deltaY;
      if (delta !== 0) zoom(delta < 0 ? 1 : -1, event.clientX, event.clientY);
      return;
    }
    const panX = state.targetPanX - deltaX;
    const panY = state.targetPanY - deltaY;
    setPan(panX, panY);
    if (state.reducedMotion) {
      state.velocityX = 0;
      state.velocityY = 0;
    } else {
      state.velocityX = -deltaX;
      state.velocityY = -deltaY;
      ensureFrame();
    }
  }

  function keydown(event) {
    if (state.destroyed || !state.active) return;
    const amount = 70;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const dx = event.key === "ArrowLeft" ? amount : event.key === "ArrowRight" ? -amount : 0;
      const dy = event.key === "ArrowUp" ? amount : event.key === "ArrowDown" ? -amount : 0;
      setPan(state.targetPanX + dx, state.targetPanY + dy);
    }
  }

  container.addEventListener("pointerdown", pointerDown);
  container.addEventListener("pointermove", pointerMove, { passive: false });
  container.addEventListener("pointerup", pointerUp);
  container.addEventListener("pointercancel", pointerCancel);
  container.addEventListener("wheel", wheel, { passive: false });
  container.addEventListener("keydown", keydown);
  view?.addEventListener?.("resize", resize);

  state.mode = getMode(state.viewport);
  state.source = selectedLayout();
  updateSourceGeometry();
  render(state.mode);

  const api = {
    filter,
    zoom,
    resize,
    setActive,
    reset,
    destroy() {
      if (state.destroyed) return;
      state.destroyed = true;
      caf(view, state.animationFrame);
      state.animationFrame = null;
      view?.removeEventListener?.("resize", resize);
      container.removeEventListener("pointerdown", pointerDown);
      container.removeEventListener("pointermove", pointerMove);
      container.removeEventListener("pointerup", pointerUp);
      container.removeEventListener("pointercancel", pointerCancel);
      container.removeEventListener("wheel", wheel);
      container.removeEventListener("keydown", keydown);
      state.refs.forEach((ref) => ref.revealAnimation?.cancel?.());
      stage.remove();
      container.classList.remove("explorer-canvas", "is-active");
      delete container.dataset.active;
    },
  };

  return api;
}

export default createExplorer;
