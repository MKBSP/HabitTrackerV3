import { h as set_current_component, r as run_all, i as current_component, s as setContext, g as getContext, c as create_ssr_component, a as subscribe, j as compute_rest_props, b as spread, d as escape_object, k as add_attribute, l as identity, v as validate_component, n as escape_attribute_value, f as createEventDispatcher, e as escape, p as each, q as is_promise, t as noop$1 } from "../../../../chunks/ssr.js";
import { n as noop, i as isHTMLElement, a as isFunction, b as isElement, e as executeCallbacks, c as addEventListener, o as omit, w as withGet, m as makeElement, d as addMeltEventListener, k as kbd, s as styleToString, u as useEscapeKeydown, f as effect, p as portalAttr, g as createElHelpers, h as isBrowser } from "../../../../chunks/index3.js";
import { C as Card } from "../../../../chunks/card.js";
import "clsx";
import "dequal";
import { a as readonly, w as writable, d as derived } from "../../../../chunks/index2.js";
import { l as last, t as toWritableStores, o as overridable, c as createBitAttrs, r as removeUndefined, g as getOptionUpdater, a as createDispatcher, I as Input } from "../../../../chunks/input.js";
import { nanoid } from "nanoid/non-secure";
import { createFocusTrap as createFocusTrap$1 } from "focus-trap";
import "../../../../chunks/client.js";
import { s as supabase } from "../../../../chunks/supabase.js";
import { I as Icon } from "../../../../chunks/Icon.js";
import { i as is_void, c as cn, f as flyAndScale, B as Button } from "../../../../chunks/button.js";
import { g as goalStore } from "../../../../chunks/goals.js";
const dirty_components = [];
const binding_callbacks = [];
let render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = /* @__PURE__ */ Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function tick() {
  schedule_update();
  return resolved_promise;
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
  if (flushidx !== 0) {
    return;
  }
  const saved_component = current_component;
  do {
    try {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
    } catch (e) {
      dirty_components.length = 0;
      flushidx = 0;
      throw e;
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length) binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function generateId() {
  return nanoid(10);
}
function generateIds(args) {
  return args.reduce((acc, curr) => {
    acc[curr] = generateId();
    return acc;
  }, {});
}
const isDom = () => typeof window !== "undefined";
function getPlatform() {
  const agent = navigator.userAgentData;
  return agent?.platform ?? navigator.platform;
}
const pt = (v) => isDom() && v.test(getPlatform().toLowerCase());
const isTouchDevice = () => isDom() && !!navigator.maxTouchPoints;
const isMac = () => pt(/^mac/) && !isTouchDevice();
const isApple = () => pt(/mac|iphone|ipad|ipod/i);
const isIos = () => isApple() && !isMac();
const LOCK_CLASSNAME = "data-melt-scroll-lock";
function assignStyle(el, style) {
  if (!el)
    return;
  const previousStyle = el.style.cssText;
  Object.assign(el.style, style);
  return () => {
    el.style.cssText = previousStyle;
  };
}
function setCSSProperty(el, property, value) {
  if (!el)
    return;
  const previousValue = el.style.getPropertyValue(property);
  el.style.setProperty(property, value);
  return () => {
    if (previousValue) {
      el.style.setProperty(property, previousValue);
    } else {
      el.style.removeProperty(property);
    }
  };
}
function getPaddingProperty(documentElement) {
  const documentLeft = documentElement.getBoundingClientRect().left;
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft;
  return scrollbarX ? "paddingLeft" : "paddingRight";
}
function removeScroll(_document) {
  const doc = document;
  const win = doc.defaultView ?? window;
  const { documentElement, body } = doc;
  const locked = body.hasAttribute(LOCK_CLASSNAME);
  if (locked)
    return noop;
  body.setAttribute(LOCK_CLASSNAME, "");
  const scrollbarWidth = win.innerWidth - documentElement.clientWidth;
  const setScrollbarWidthProperty = () => setCSSProperty(documentElement, "--scrollbar-width", `${scrollbarWidth}px`);
  const paddingProperty = getPaddingProperty(documentElement);
  const scrollbarSidePadding = win.getComputedStyle(body)[paddingProperty];
  const setStyle = () => assignStyle(body, {
    overflow: "hidden",
    [paddingProperty]: `calc(${scrollbarSidePadding} + ${scrollbarWidth}px)`
  });
  const setIOSStyle = () => {
    const { scrollX, scrollY, visualViewport } = win;
    const offsetLeft = visualViewport?.offsetLeft ?? 0;
    const offsetTop = visualViewport?.offsetTop ?? 0;
    const restoreStyle = assignStyle(body, {
      position: "fixed",
      overflow: "hidden",
      top: `${-(scrollY - Math.floor(offsetTop))}px`,
      left: `${-(scrollX - Math.floor(offsetLeft))}px`,
      right: "0",
      [paddingProperty]: `calc(${scrollbarSidePadding} + ${scrollbarWidth}px)`
    });
    return () => {
      restoreStyle?.();
      win.scrollTo(scrollX, scrollY);
    };
  };
  const cleanups = [setScrollbarWidthProperty(), isIos() ? setIOSStyle() : setStyle()];
  return () => {
    cleanups.forEach((fn) => fn?.());
    body.removeAttribute(LOCK_CLASSNAME);
  };
}
function getPortalParent(node) {
  let parent = node.parentElement;
  while (isHTMLElement(parent) && !parent.hasAttribute("data-portal")) {
    parent = parent.parentElement;
  }
  return parent || "body";
}
function getPortalDestination(node, portalProp) {
  if (portalProp !== void 0)
    return portalProp;
  const portalParent = getPortalParent(node);
  if (portalParent === "body")
    return document.body;
  return null;
}
async function handleFocus(args) {
  const { prop, defaultEl } = args;
  await Promise.all([sleep(1), tick]);
  if (prop === void 0) {
    defaultEl?.focus();
    return;
  }
  const returned = isFunction(prop) ? prop(defaultEl) : prop;
  if (typeof returned === "string") {
    const el = document.querySelector(returned);
    if (!isHTMLElement(el))
      return;
    el.focus();
  } else if (isHTMLElement(returned)) {
    returned.focus();
  }
}
function createFocusTrap(config = {}) {
  let trap;
  const { immediate, ...focusTrapOptions } = config;
  const hasFocus = writable(false);
  const isPaused = writable(false);
  const activate = (opts) => trap?.activate(opts);
  const deactivate = (opts) => {
    trap?.deactivate(opts);
  };
  const pause = () => {
    if (trap) {
      trap.pause();
      isPaused.set(true);
    }
  };
  const unpause = () => {
    if (trap) {
      trap.unpause();
      isPaused.set(false);
    }
  };
  const useFocusTrap = (node) => {
    trap = createFocusTrap$1(node, {
      ...focusTrapOptions,
      onActivate() {
        hasFocus.set(true);
        config.onActivate?.();
      },
      onDeactivate() {
        hasFocus.set(false);
        config.onDeactivate?.();
      }
    });
    if (immediate) {
      activate();
    }
    return {
      destroy() {
        deactivate();
        trap = void 0;
      }
    };
  };
  return {
    useFocusTrap,
    hasFocus: readonly(hasFocus),
    isPaused: readonly(isPaused),
    activate,
    deactivate,
    pause,
    unpause
  };
}
const visibleModals = [];
const useModal = (node, config) => {
  let unsubInteractOutside = noop;
  function removeNodeFromVisibleModals() {
    const index = visibleModals.indexOf(node);
    if (index >= 0) {
      visibleModals.splice(index, 1);
    }
  }
  function update2(config2) {
    unsubInteractOutside();
    const { open, onClose, shouldCloseOnInteractOutside, closeOnInteractOutside } = config2;
    sleep(100).then(() => {
      if (open) {
        visibleModals.push(node);
      } else {
        removeNodeFromVisibleModals();
      }
    });
    function isLastModal() {
      return last(visibleModals) === node;
    }
    function closeModal() {
      if (isLastModal() && onClose) {
        onClose();
        removeNodeFromVisibleModals();
      }
    }
    function onInteractOutsideStart(e) {
      const target = e.target;
      if (!isElement(target))
        return;
      if (target && isLastModal()) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }
    function onInteractOutside(e) {
      if (shouldCloseOnInteractOutside?.(e) && isLastModal()) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        closeModal();
      }
    }
    unsubInteractOutside = useInteractOutside(node, {
      onInteractOutsideStart,
      onInteractOutside: closeOnInteractOutside ? onInteractOutside : void 0,
      enabled: open
    }).destroy;
  }
  update2(config);
  return {
    update: update2,
    destroy() {
      removeNodeFromVisibleModals();
      unsubInteractOutside();
    }
  };
};
const usePortal = (el, target = "body") => {
  let targetEl;
  if (!isHTMLElement(target) && typeof target !== "string") {
    return {
      destroy: noop
    };
  }
  async function update2(newTarget) {
    target = newTarget;
    if (typeof target === "string") {
      targetEl = document.querySelector(target);
      if (targetEl === null) {
        await tick();
        targetEl = document.querySelector(target);
      }
      if (targetEl === null) {
        throw new Error(`No element found matching css selector: "${target}"`);
      }
    } else if (target instanceof HTMLElement) {
      targetEl = target;
    } else {
      throw new TypeError(`Unknown portal target type: ${target === null ? "null" : typeof target}. Allowed types: string (CSS selector) or HTMLElement.`);
    }
    el.dataset.portal = "";
    targetEl.appendChild(el);
    el.hidden = false;
  }
  function destroy() {
    el.remove();
  }
  update2(target);
  return {
    update: update2,
    destroy
  };
};
const useInteractOutside = (node, config) => {
  let unsub = noop;
  let unsubClick = noop;
  let isPointerDown = false;
  let isPointerDownInside = false;
  let ignoreEmulatedMouseEvents = false;
  function update2(config2) {
    unsub();
    unsubClick();
    const { onInteractOutside, onInteractOutsideStart, enabled } = config2;
    if (!enabled)
      return;
    function onPointerDown(e) {
      if (onInteractOutside && isValidEvent(e, node)) {
        onInteractOutsideStart?.(e);
      }
      const target = e.target;
      if (isElement(target) && isOrContainsTarget(node, target)) {
        isPointerDownInside = true;
      }
      isPointerDown = true;
    }
    function triggerInteractOutside(e) {
      onInteractOutside?.(e);
    }
    const documentObj = getOwnerDocument(node);
    if (typeof PointerEvent !== "undefined") {
      const onPointerUp = (e) => {
        unsubClick();
        const handler = (e2) => {
          if (shouldTriggerInteractOutside(e2)) {
            triggerInteractOutside(e2);
          }
          resetPointerState();
        };
        if (e.pointerType === "touch") {
          unsubClick = addEventListener(documentObj, "click", handler, {
            capture: true,
            once: true
          });
          return;
        }
        handler(e);
      };
      unsub = executeCallbacks(addEventListener(documentObj, "pointerdown", onPointerDown, true), addEventListener(documentObj, "pointerup", onPointerUp, true));
    } else {
      const onMouseUp = (e) => {
        if (ignoreEmulatedMouseEvents) {
          ignoreEmulatedMouseEvents = false;
        } else if (shouldTriggerInteractOutside(e)) {
          triggerInteractOutside(e);
        }
        resetPointerState();
      };
      const onTouchEnd = (e) => {
        ignoreEmulatedMouseEvents = true;
        if (shouldTriggerInteractOutside(e)) {
          triggerInteractOutside(e);
        }
        resetPointerState();
      };
      unsub = executeCallbacks(addEventListener(documentObj, "mousedown", onPointerDown, true), addEventListener(documentObj, "mouseup", onMouseUp, true), addEventListener(documentObj, "touchstart", onPointerDown, true), addEventListener(documentObj, "touchend", onTouchEnd, true));
    }
  }
  function shouldTriggerInteractOutside(e) {
    if (isPointerDown && !isPointerDownInside && isValidEvent(e, node)) {
      return true;
    }
    return false;
  }
  function resetPointerState() {
    isPointerDown = false;
    isPointerDownInside = false;
  }
  update2(config);
  return {
    update: update2,
    destroy() {
      unsub();
      unsubClick();
    }
  };
};
function isValidEvent(e, node) {
  if ("button" in e && e.button > 0)
    return false;
  const target = e.target;
  if (!isElement(target))
    return false;
  const ownerDocument = target.ownerDocument;
  if (!ownerDocument || !ownerDocument.documentElement.contains(target)) {
    return false;
  }
  return node && !isOrContainsTarget(node, target);
}
function isOrContainsTarget(node, target) {
  return node === target || node.contains(target);
}
function getOwnerDocument(el) {
  return el?.ownerDocument ?? document;
}
const { name } = createElHelpers("dialog");
const defaults = {
  preventScroll: true,
  closeOnEscape: true,
  closeOnOutsideClick: true,
  role: "dialog",
  defaultOpen: false,
  portal: void 0,
  forceVisible: false,
  openFocus: void 0,
  closeFocus: void 0,
  onOutsideClick: void 0
};
const dialogIdParts = ["content", "title", "description"];
function createDialog(props) {
  const withDefaults = { ...defaults, ...props };
  const options = toWritableStores(omit(withDefaults, "ids"));
  const { preventScroll, closeOnEscape, closeOnOutsideClick, role, portal, forceVisible, openFocus, closeFocus, onOutsideClick } = options;
  const activeTrigger = withGet.writable(null);
  const ids = toWritableStores({
    ...generateIds(dialogIdParts),
    ...withDefaults.ids
  });
  const openWritable = withDefaults.open ?? writable(withDefaults.defaultOpen);
  const open = overridable(openWritable, withDefaults?.onOpenChange);
  const isVisible = derived([open, forceVisible], ([$open, $forceVisible]) => {
    return $open || $forceVisible;
  });
  let unsubScroll = noop;
  function handleOpen(e) {
    const el = e.currentTarget;
    const triggerEl = e.currentTarget;
    if (!isHTMLElement(el) || !isHTMLElement(triggerEl))
      return;
    open.set(true);
    activeTrigger.set(triggerEl);
  }
  function handleClose() {
    open.set(false);
    handleFocus({
      prop: closeFocus.get(),
      defaultEl: activeTrigger.get()
    });
  }
  const trigger = makeElement(name("trigger"), {
    stores: [open],
    returned: ([$open]) => {
      return {
        "aria-haspopup": "dialog",
        "aria-expanded": $open,
        type: "button"
      };
    },
    action: (node) => {
      const unsub = executeCallbacks(addMeltEventListener(node, "click", (e) => {
        handleOpen(e);
      }), addMeltEventListener(node, "keydown", (e) => {
        if (e.key !== kbd.ENTER && e.key !== kbd.SPACE)
          return;
        e.preventDefault();
        handleOpen(e);
      }));
      return {
        destroy: unsub
      };
    }
  });
  const overlay = makeElement(name("overlay"), {
    stores: [isVisible, open],
    returned: ([$isVisible, $open]) => {
      return {
        hidden: $isVisible ? void 0 : true,
        tabindex: -1,
        style: styleToString({
          display: $isVisible ? void 0 : "none"
        }),
        "aria-hidden": true,
        "data-state": $open ? "open" : "closed"
      };
    },
    action: (node) => {
      let unsubEscapeKeydown = noop;
      if (closeOnEscape.get()) {
        const escapeKeydown = useEscapeKeydown(node, {
          handler: () => {
            handleClose();
          }
        });
        {
          unsubEscapeKeydown = escapeKeydown.destroy;
        }
      }
      return {
        destroy() {
          unsubEscapeKeydown();
        }
      };
    }
  });
  const content = makeElement(name("content"), {
    stores: [isVisible, ids.content, ids.description, ids.title, open],
    returned: ([$isVisible, $contentId, $descriptionId, $titleId, $open]) => {
      return {
        id: $contentId,
        role: role.get(),
        "aria-describedby": $descriptionId,
        "aria-labelledby": $titleId,
        "aria-modal": $isVisible ? "true" : void 0,
        "data-state": $open ? "open" : "closed",
        tabindex: -1,
        hidden: $isVisible ? void 0 : true,
        style: styleToString({
          display: $isVisible ? void 0 : "none"
        })
      };
    },
    action: (node) => {
      let activate = noop;
      let deactivate = noop;
      const destroy = executeCallbacks(effect([open, closeOnOutsideClick, closeOnEscape], ([$open, $closeOnOutsideClick, $closeOnEscape]) => {
        if (!$open)
          return;
        const focusTrap = createFocusTrap({
          immediate: false,
          escapeDeactivates: $closeOnEscape,
          clickOutsideDeactivates: $closeOnOutsideClick,
          allowOutsideClick: true,
          returnFocusOnDeactivate: false,
          fallbackFocus: node
        });
        activate = focusTrap.activate;
        deactivate = focusTrap.deactivate;
        const ac = focusTrap.useFocusTrap(node);
        if (ac && ac.destroy) {
          return ac.destroy;
        } else {
          return focusTrap.deactivate;
        }
      }), effect([closeOnOutsideClick, open], ([$closeOnOutsideClick, $open]) => {
        return useModal(node, {
          open: $open,
          closeOnInteractOutside: $closeOnOutsideClick,
          onClose() {
            handleClose();
          },
          shouldCloseOnInteractOutside(e) {
            onOutsideClick.get()?.(e);
            if (e.defaultPrevented)
              return false;
            return true;
          }
        }).destroy;
      }), effect([closeOnEscape], ([$closeOnEscape]) => {
        if (!$closeOnEscape)
          return noop;
        return useEscapeKeydown(node, { handler: handleClose }).destroy;
      }), effect([isVisible], ([$isVisible]) => {
        tick().then(() => {
          if (!$isVisible) {
            deactivate();
          } else {
            activate();
          }
        });
      }));
      return {
        destroy: () => {
          unsubScroll();
          destroy();
        }
      };
    }
  });
  const portalled = makeElement(name("portalled"), {
    stores: portal,
    returned: ($portal) => ({
      "data-portal": portalAttr($portal)
    }),
    action: (node) => {
      const unsubPortal = effect([portal], ([$portal]) => {
        if ($portal === null)
          return noop;
        const portalDestination = getPortalDestination(node, $portal);
        if (portalDestination === null)
          return noop;
        return usePortal(node, portalDestination).destroy;
      });
      return {
        destroy() {
          unsubPortal();
        }
      };
    }
  });
  const title = makeElement(name("title"), {
    stores: [ids.title],
    returned: ([$titleId]) => ({
      id: $titleId
    })
  });
  const description = makeElement(name("description"), {
    stores: [ids.description],
    returned: ([$descriptionId]) => ({
      id: $descriptionId
    })
  });
  const close = makeElement(name("close"), {
    returned: () => ({
      type: "button"
    }),
    action: (node) => {
      const unsub = executeCallbacks(addMeltEventListener(node, "click", () => {
        handleClose();
      }), addMeltEventListener(node, "keydown", (e) => {
        if (e.key !== kbd.SPACE && e.key !== kbd.ENTER)
          return;
        e.preventDefault();
        handleClose();
      }));
      return {
        destroy: unsub
      };
    }
  });
  effect([open, preventScroll], ([$open, $preventScroll]) => {
    if (!isBrowser)
      return;
    if ($preventScroll && $open)
      unsubScroll = removeScroll();
    if ($open) {
      const contentEl = document.getElementById(ids.content.get());
      handleFocus({ prop: openFocus.get(), defaultEl: contentEl });
    }
    return () => {
      if (!forceVisible.get()) {
        unsubScroll();
      }
    };
  });
  return {
    ids,
    elements: {
      content,
      trigger,
      title,
      description,
      overlay,
      close,
      portalled
    },
    states: {
      open
    },
    options
  };
}
function getDialogData() {
  const NAME = "dialog";
  const PARTS = [
    "close",
    "content",
    "description",
    "overlay",
    "portal",
    "title",
    "trigger"
  ];
  return {
    NAME,
    PARTS
  };
}
function setCtx(props) {
  const { NAME, PARTS } = getDialogData();
  const getAttrs = createBitAttrs(NAME, PARTS);
  const dialog = {
    ...createDialog({ ...removeUndefined(props), role: "dialog", forceVisible: true }),
    getAttrs
  };
  setContext(NAME, dialog);
  return {
    ...dialog,
    updateOption: getOptionUpdater(dialog.options)
  };
}
function getCtx() {
  const { NAME } = getDialogData();
  return getContext(NAME);
}
const Dialog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $idValues, $$unsubscribe_idValues;
  let { preventScroll = void 0 } = $$props;
  let { closeOnEscape = void 0 } = $$props;
  let { closeOnOutsideClick = void 0 } = $$props;
  let { portal = void 0 } = $$props;
  let { open = void 0 } = $$props;
  let { onOpenChange = void 0 } = $$props;
  let { openFocus = void 0 } = $$props;
  let { closeFocus = void 0 } = $$props;
  let { onOutsideClick = void 0 } = $$props;
  const { states: { open: localOpen }, updateOption, ids } = setCtx({
    closeOnEscape,
    preventScroll,
    closeOnOutsideClick,
    portal,
    forceVisible: true,
    defaultOpen: open,
    openFocus,
    closeFocus,
    onOutsideClick,
    onOpenChange: ({ next }) => {
      if (open !== next) {
        onOpenChange?.(next);
        open = next;
      }
      return next;
    }
  });
  const idValues = derived([ids.content, ids.description, ids.title], ([$contentId, $descriptionId, $titleId]) => ({
    content: $contentId,
    description: $descriptionId,
    title: $titleId
  }));
  $$unsubscribe_idValues = subscribe(idValues, (value) => $idValues = value);
  if ($$props.preventScroll === void 0 && $$bindings.preventScroll && preventScroll !== void 0) $$bindings.preventScroll(preventScroll);
  if ($$props.closeOnEscape === void 0 && $$bindings.closeOnEscape && closeOnEscape !== void 0) $$bindings.closeOnEscape(closeOnEscape);
  if ($$props.closeOnOutsideClick === void 0 && $$bindings.closeOnOutsideClick && closeOnOutsideClick !== void 0) $$bindings.closeOnOutsideClick(closeOnOutsideClick);
  if ($$props.portal === void 0 && $$bindings.portal && portal !== void 0) $$bindings.portal(portal);
  if ($$props.open === void 0 && $$bindings.open && open !== void 0) $$bindings.open(open);
  if ($$props.onOpenChange === void 0 && $$bindings.onOpenChange && onOpenChange !== void 0) $$bindings.onOpenChange(onOpenChange);
  if ($$props.openFocus === void 0 && $$bindings.openFocus && openFocus !== void 0) $$bindings.openFocus(openFocus);
  if ($$props.closeFocus === void 0 && $$bindings.closeFocus && closeFocus !== void 0) $$bindings.closeFocus(closeFocus);
  if ($$props.onOutsideClick === void 0 && $$bindings.onOutsideClick && onOutsideClick !== void 0) $$bindings.onOutsideClick(onOutsideClick);
  open !== void 0 && localOpen.set(open);
  {
    updateOption("preventScroll", preventScroll);
  }
  {
    updateOption("closeOnEscape", closeOnEscape);
  }
  {
    updateOption("closeOnOutsideClick", closeOnOutsideClick);
  }
  {
    updateOption("portal", portal);
  }
  {
    updateOption("openFocus", openFocus);
  }
  {
    updateOption("closeFocus", closeFocus);
  }
  {
    updateOption("onOutsideClick", onOutsideClick);
  }
  $$unsubscribe_idValues();
  return `${slots.default ? slots.default({ ids: $idValues }) : ``}`;
});
const Dialog_title$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["level", "asChild", "id", "el"]);
  let $title, $$unsubscribe_title;
  let { level = "h2" } = $$props;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { title }, ids, getAttrs } = getCtx();
  $$unsubscribe_title = subscribe(title, (value) => $title = value);
  const attrs = getAttrs("title");
  if ($$props.level === void 0 && $$bindings.level && level !== void 0) $$bindings.level(level);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0) $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0) $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0) $$bindings.el(el);
  {
    if (id) {
      ids.title.set(id);
    }
  }
  builder = $title;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_title();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `${((tag) => {
    return tag ? `<${level}${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${is_void(tag) ? "" : `${slots.default ? slots.default({ builder }) : ``}`}${is_void(tag) ? "" : `</${tag}>`}` : "";
  })(level)}`}`;
});
const Dialog_close = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $close, $$unsubscribe_close;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { close }, getAttrs } = getCtx();
  $$unsubscribe_close = subscribe(close, (value) => $close = value);
  createDispatcher();
  const attrs = getAttrs("close");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0) $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0) $$bindings.el(el);
  builder = $close;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_close();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<button${spread([escape_object(builder), { type: "button" }, escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</button>`}`;
});
const Dialog_portal$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $portalled, $$unsubscribe_portalled;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { portalled }, getAttrs } = getCtx();
  $$unsubscribe_portalled = subscribe(portalled, (value) => $portalled = value);
  const attrs = getAttrs("portal");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0) $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0) $$bindings.el(el);
  builder = $portalled;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_portalled();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>`}`;
});
const Dialog_content$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, [
    "transition",
    "transitionConfig",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "asChild",
    "id",
    "el"
  ]);
  let $content, $$unsubscribe_content;
  let $open, $$unsubscribe_open;
  let { transition = void 0 } = $$props;
  let { transitionConfig = void 0 } = $$props;
  let { inTransition = void 0 } = $$props;
  let { inTransitionConfig = void 0 } = $$props;
  let { outTransition = void 0 } = $$props;
  let { outTransitionConfig = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { content }, states: { open }, ids, getAttrs } = getCtx();
  $$unsubscribe_content = subscribe(content, (value) => $content = value);
  $$unsubscribe_open = subscribe(open, (value) => $open = value);
  const attrs = getAttrs("content");
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0) $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0) $$bindings.transitionConfig(transitionConfig);
  if ($$props.inTransition === void 0 && $$bindings.inTransition && inTransition !== void 0) $$bindings.inTransition(inTransition);
  if ($$props.inTransitionConfig === void 0 && $$bindings.inTransitionConfig && inTransitionConfig !== void 0) $$bindings.inTransitionConfig(inTransitionConfig);
  if ($$props.outTransition === void 0 && $$bindings.outTransition && outTransition !== void 0) $$bindings.outTransition(outTransition);
  if ($$props.outTransitionConfig === void 0 && $$bindings.outTransitionConfig && outTransitionConfig !== void 0) $$bindings.outTransitionConfig(outTransitionConfig);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0) $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0) $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0) $$bindings.el(el);
  {
    if (id) {
      ids.content.set(id);
    }
  }
  builder = $content;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_content();
  $$unsubscribe_open();
  return `${asChild && $open ? `${slots.default ? slots.default({ builder }) : ``}` : `${transition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${inTransition && outTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${inTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${outTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${$open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : ``}`}`}`}`}`}`;
});
const Dialog_overlay$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, [
    "transition",
    "transitionConfig",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "asChild",
    "el"
  ]);
  let $overlay, $$unsubscribe_overlay;
  let $open, $$unsubscribe_open;
  let { transition = void 0 } = $$props;
  let { transitionConfig = void 0 } = $$props;
  let { inTransition = void 0 } = $$props;
  let { inTransitionConfig = void 0 } = $$props;
  let { outTransition = void 0 } = $$props;
  let { outTransitionConfig = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { overlay }, states: { open }, getAttrs } = getCtx();
  $$unsubscribe_overlay = subscribe(overlay, (value) => $overlay = value);
  $$unsubscribe_open = subscribe(open, (value) => $open = value);
  const attrs = getAttrs("overlay");
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0) $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0) $$bindings.transitionConfig(transitionConfig);
  if ($$props.inTransition === void 0 && $$bindings.inTransition && inTransition !== void 0) $$bindings.inTransition(inTransition);
  if ($$props.inTransitionConfig === void 0 && $$bindings.inTransitionConfig && inTransitionConfig !== void 0) $$bindings.inTransitionConfig(inTransitionConfig);
  if ($$props.outTransition === void 0 && $$bindings.outTransition && outTransition !== void 0) $$bindings.outTransition(outTransition);
  if ($$props.outTransitionConfig === void 0 && $$bindings.outTransitionConfig && outTransitionConfig !== void 0) $$bindings.outTransitionConfig(outTransitionConfig);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0) $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0) $$bindings.el(el);
  builder = $overlay;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_overlay();
  $$unsubscribe_open();
  return `${asChild && $open ? `${slots.default ? slots.default({ builder }) : ``}` : `${transition && $open ? ` <div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${inTransition && outTransition && $open ? ` <div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${inTransition && $open ? ` <div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${outTransition && $open ? ` <div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${$open ? ` <div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : ``}`}`}`}`}`}`;
});
function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
  const o = +getComputedStyle(node).opacity;
  return {
    delay,
    duration,
    easing,
    css: (t) => `opacity: ${t * o}`
  };
}
const X = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const iconNode = [["path", { "d": "M18 6 6 18" }], ["path", { "d": "m6 6 12 12" }]];
  return `${validate_component(Icon, "Icon").$$render($$result, Object.assign({}, { name: "x" }, $$props, { iconNode }), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const Dialog_title = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0) $$bindings.class(className);
  return `${validate_component(Dialog_title$1, "DialogPrimitive.Title").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("text-lg font-semibold leading-none tracking-tight", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Dialog_portal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `${validate_component(Dialog_portal$1, "DialogPrimitive.Portal").$$render($$result, Object.assign({}, $$restProps), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const Dialog_header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0) $$bindings.class(className);
  return `<div${spread(
    [
      {
        class: escape_attribute_value(cn("flex flex-col space-y-1.5 text-center sm:text-left", className))
      },
      escape_object($$restProps)
    ],
    {}
  )}>${slots.default ? slots.default({}) : ``}</div>`;
});
const Dialog_overlay = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "transition", "transitionConfig"]);
  let { class: className = void 0 } = $$props;
  let { transition = fade } = $$props;
  let { transitionConfig = { duration: 150 } } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0) $$bindings.class(className);
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0) $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0) $$bindings.transitionConfig(transitionConfig);
  return `${validate_component(Dialog_overlay$1, "DialogPrimitive.Overlay").$$render(
    $$result,
    Object.assign(
      {},
      { transition },
      { transitionConfig },
      {
        class: cn("bg-background/80 fixed inset-0 z-50 backdrop-blur-sm", className)
      },
      $$restProps
    ),
    {},
    {}
  )}`;
});
const Dialog_content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "transition", "transitionConfig"]);
  let { class: className = void 0 } = $$props;
  let { transition = flyAndScale } = $$props;
  let { transitionConfig = { duration: 200 } } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0) $$bindings.class(className);
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0) $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0) $$bindings.transitionConfig(transitionConfig);
  return `${validate_component(Dialog_portal, "Dialog.Portal").$$render($$result, {}, {}, {
    default: () => {
      return `${validate_component(Dialog_overlay, "Dialog.Overlay").$$render($$result, {}, {}, {})} ${validate_component(Dialog_content$1, "DialogPrimitive.Content").$$render(
        $$result,
        Object.assign(
          {},
          { transition },
          { transitionConfig },
          {
            class: cn("bg-background fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg sm:rounded-lg md:w-full", className)
          },
          $$restProps
        ),
        {},
        {
          default: () => {
            return `${slots.default ? slots.default({}) : ``} ${validate_component(Dialog_close, "DialogPrimitive.Close").$$render(
              $$result,
              {
                class: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
              },
              {},
              {
                default: () => {
                  return `${validate_component(X, "X").$$render($$result, { class: "h-4 w-4" }, {}, {})} <span class="sr-only" data-svelte-h="svelte-1pewzs3">Close</span>`;
                }
              }
            )}`;
          }
        }
      )}`;
    }
  })}`;
});
const Root = Dialog;
const HabitSearchModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $newHabitDescription, $$unsubscribe_newHabitDescription;
  let $newHabitName, $$unsubscribe_newHabitName;
  let $searchTerm, $$unsubscribe_searchTerm;
  let $error, $$unsubscribe_error;
  let $loading, $$unsubscribe_loading;
  let $filteredHabits, $$unsubscribe_filteredHabits;
  let $showCreateForm, $$unsubscribe_showCreateForm;
  let { open = false } = $$props;
  createEventDispatcher();
  const habits = writable([]);
  const loading = writable(false);
  $$unsubscribe_loading = subscribe(loading, (value) => $loading = value);
  const searchTerm = writable("");
  $$unsubscribe_searchTerm = subscribe(searchTerm, (value) => $searchTerm = value);
  const showCreateForm = writable(false);
  $$unsubscribe_showCreateForm = subscribe(showCreateForm, (value) => $showCreateForm = value);
  const newHabitName = writable("");
  $$unsubscribe_newHabitName = subscribe(newHabitName, (value) => $newHabitName = value);
  const newHabitDescription = writable("");
  $$unsubscribe_newHabitDescription = subscribe(newHabitDescription, (value) => $newHabitDescription = value);
  const error = writable(null);
  $$unsubscribe_error = subscribe(error, (value) => $error = value);
  const filteredHabits = derived([habits, searchTerm], ([$habits, $searchTerm2]) => $searchTerm2 ? $habits.filter((habit) => habit.name.toLowerCase().includes($searchTerm2.toLowerCase()) || habit.description && habit.description.toLowerCase().includes($searchTerm2.toLowerCase())) : $habits);
  $$unsubscribe_filteredHabits = subscribe(filteredHabits, (value) => $filteredHabits = value);
  async function initializeAuth() {
    const { data: { user }, error: error2 } = await supabase.auth.getUser();
    if (error2) {
      console.error("Auth error:", error2);
      return;
    }
  }
  async function fetchHabits() {
    loading.set(true);
    error.set(null);
    try {
      await initializeAuth();
      const { data, error: fetchError } = await supabase.from("Habits").select("id, name, description").order("name");
      if (fetchError) throw fetchError;
      habits.set(data || []);
    } catch (err) {
      console.error("[HabitSearchModal] Error:", err);
      error.set("Failed to fetch habits");
      habits.set([]);
    } finally {
      loading.set(false);
    }
  }
  if ($$props.open === void 0 && $$bindings.open && open !== void 0) $$bindings.open(open);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (open) {
        fetchHabits();
        initializeAuth();
      }
    }
    $$rendered = `${validate_component(Root, "Dialog").$$render($$result, { open }, {}, {
      default: () => {
        return `${validate_component(Dialog_content, "DialogContent").$$render($$result, { class: "sm:max-w-[850px]" }, {}, {
          default: () => {
            return `${validate_component(Dialog_header, "DialogHeader").$$render($$result, {}, {}, {
              default: () => {
                return `${validate_component(Dialog_title, "DialogTitle").$$render($$result, {}, {}, {
                  default: () => {
                    return `Add Habits`;
                  }
                })}`;
              }
            })} <div class="flex gap-4"> <div class="w-1/2 space-y-4">${validate_component(Input, "Input").$$render(
              $$result,
              {
                placeholder: "Search habits...",
                value: $searchTerm
              },
              {
                value: ($$value) => {
                  $searchTerm = $$value;
                  $$settled = false;
                }
              },
              {}
            )} ${$error ? `<div class="text-red-500 text-sm">${escape($error)}</div>` : ``} <div class="max-h-[400px] overflow-y-auto space-y-2">${$loading ? `<p class="text-center" data-svelte-h="svelte-k9twba">Loading...</p>` : `${$filteredHabits.length === 0 ? `<div class="text-center" data-svelte-h="svelte-o7ykmf"><p>No habits found</p></div>` : `${each($filteredHabits, (habit) => {
              return `<div class="flex items-center justify-between p-2 border rounded"><div><h4 class="font-medium">${escape(habit.name)}</h4> <p class="text-sm text-muted-foreground">${escape(habit.description)}</p></div> ${validate_component(Button, "Button").$$render($$result, { variant: "outline", size: "sm" }, {}, {
                default: () => {
                  return `Add
                                `;
                }
              })} </div>`;
            })}`}`}</div></div>  ${$showCreateForm ? `<div class="w-1/2 border-l pl-4"><form class="space-y-4"><div class="space-y-2"><label for="habitName" class="text-sm font-medium" data-svelte-h="svelte-1p5znoi">Habit Name*</label> ${validate_component(Input, "Input").$$render(
              $$result,
              {
                id: "habitName",
                required: true,
                placeholder: "Enter habit name",
                value: $newHabitName
              },
              {
                value: ($$value) => {
                  $newHabitName = $$value;
                  $$settled = false;
                }
              },
              {}
            )}</div> <div class="space-y-2"><label for="habitDesc" class="text-sm font-medium" data-svelte-h="svelte-jhwd97">Description</label> ${validate_component(Input, "Input").$$render(
              $$result,
              {
                id: "habitDesc",
                placeholder: "Enter habit description",
                value: $newHabitDescription
              },
              {
                value: ($$value) => {
                  $newHabitDescription = $$value;
                  $$settled = false;
                }
              },
              {}
            )}</div> <div class="flex justify-end gap-2">${validate_component(Button, "Button").$$render($$result, { type: "button", variant: "outline" }, {}, {
              default: () => {
                return `Cancel`;
              }
            })} ${validate_component(Button, "Button").$$render($$result, { type: "submit", disabled: !$newHabitName }, {}, {
              default: () => {
                return `Save and Add`;
              }
            })}</div></form></div>` : ``}</div>  <div class="pt-4 mt-4 border-t">${validate_component(Button, "Button").$$render($$result, { variant: "outline", class: "w-full" }, {}, {
              default: () => {
                return `Create New Habit`;
              }
            })}</div>`;
          }
        })}`;
      }
    })}`;
  } while (!$$settled);
  $$unsubscribe_newHabitDescription();
  $$unsubscribe_newHabitName();
  $$unsubscribe_searchTerm();
  $$unsubscribe_error();
  $$unsubscribe_loading();
  $$unsubscribe_filteredHabits();
  $$unsubscribe_showCreateForm();
  return $$rendered;
});
const GoalCreationDialog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let kpiPreview;
  let $newKpi, $$unsubscribe_newKpi;
  let $addedKpis, $$unsubscribe_addedKpis;
  let $goalDescription, $$unsubscribe_goalDescription;
  let $goalName, $$unsubscribe_goalName;
  let { open = false } = $$props;
  let { editingGoal = null } = $$props;
  createEventDispatcher();
  const goalName = writable("");
  $$unsubscribe_goalName = subscribe(goalName, (value) => $goalName = value);
  const goalDescription = writable("");
  $$unsubscribe_goalDescription = subscribe(goalDescription, (value) => $goalDescription = value);
  const newKpi = writable({
    habit_id: null,
    habitName: "",
    target: 1,
    period: "week"
  });
  $$unsubscribe_newKpi = subscribe(newKpi, (value) => $newKpi = value);
  const addedKpis = writable([]);
  $$unsubscribe_addedKpis = subscribe(addedKpis, (value) => $addedKpis = value);
  let userHabits = [];
  let showHabitModal = false;
  if ($$props.open === void 0 && $$bindings.open && open !== void 0) $$bindings.open(open);
  if ($$props.editingGoal === void 0 && $$bindings.editingGoal && editingGoal !== void 0) $$bindings.editingGoal(editingGoal);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (!open) {
        setTimeout(
          () => {
            goalName.set("");
            goalDescription.set("");
            addedKpis.set([]);
            newKpi.set({
              habit_id: null,
              habitName: "",
              target: 1,
              period: "week"
            });
          },
          100
        );
      }
    }
    {
      if (open && editingGoal) {
        setTimeout(
          () => {
            goalName.set(editingGoal.name);
            goalDescription.set(editingGoal.description || "");
            addedKpis.set(editingGoal.kpis || []);
          },
          100
        );
      }
    }
    {
      newKpi.update((kpi) => ({ ...kpi, habit_ids: [] }));
    }
    kpiPreview = $newKpi.habitName ? `${$newKpi.habitName} ${$newKpi.target} time${$newKpi.target !== 1 ? "s" : ""} per ${$newKpi.period}` : "";
    $$rendered = `${validate_component(Root, "Dialog").$$render($$result, { open }, {}, {
      default: () => {
        return `${validate_component(Dialog_content, "DialogContent").$$render($$result, { class: "sm:max-w-[850px]" }, {}, {
          default: () => {
            return `${validate_component(Dialog_header, "DialogHeader").$$render($$result, {}, {}, {
              default: () => {
                return `${validate_component(Dialog_title, "DialogTitle").$$render($$result, {}, {}, {
                  default: () => {
                    return `${escape(editingGoal ? "Edit" : "Create New")} Goal`;
                  }
                })} `;
              }
            })} <div class="flex gap-4"> <div class="w-1/2 space-y-4"><div class="space-y-2"><label for="goalName" class="text-sm font-medium" data-svelte-h="svelte-18r40ws">Goal Name*</label> ${validate_component(Input, "Input").$$render(
              $$result,
              {
                id: "goalName",
                placeholder: "Enter goal name",
                value: $goalName
              },
              {
                value: ($$value) => {
                  $goalName = $$value;
                  $$settled = false;
                }
              },
              {}
            )}</div> <div class="space-y-2"><label for="goalDesc" class="text-sm font-medium" data-svelte-h="svelte-a0qxqk">Description</label> ${validate_component(Input, "Input").$$render(
              $$result,
              {
                id: "goalDesc",
                placeholder: "Enter description",
                value: $goalDescription
              },
              {
                value: ($$value) => {
                  $goalDescription = $$value;
                  $$settled = false;
                }
              },
              {}
            )}</div>  <div class="space-y-2"><label for="addedKpisList" class="text-sm font-medium" data-svelte-h="svelte-1mxlu24">Added KPIs</label> <div id="addedKpisList" class="space-y-2">${each($addedKpis, (kpi, i) => {
              return `${validate_component(Card, "Card.Root").$$render($$result, { class: "p-3" }, {}, {
                default: () => {
                  return `<div class="flex justify-between items-center"><div><div class="font-medium">${escape(kpi.name)}</div> <div class="text-sm text-muted-foreground">${escape(kpi.target)} time(s) per ${escape(kpi.period)} </div></div> ${validate_component(Button, "Button").$$render($$result, { variant: "ghost", size: "sm" }, {}, {
                    default: () => {
                      return `Remove
                                    `;
                    }
                  })}</div> `;
                }
              })}`;
            })}</div></div></div>  <div class="w-1/2 border-l pl-4 space-y-4"><div class="space-y-4"> <div class="space-y-2"><label for="habitSelect" class="text-sm font-medium" data-svelte-h="svelte-1lqrubc">Select Habit</label> <div class="relative"><select id="habitSelect" class="w-full p-2 border rounded"${add_attribute("value", $newKpi.habit_id || "", 0)}><option value="" data-svelte-h="svelte-faipzt">Select a habit...</option>${each(userHabits, (habit) => {
              return `<option${add_attribute("value", habit.id, 0)}>${escape(habit.name)}</option>`;
            })}</select> ${validate_component(Button, "Button").$$render($$result, { variant: "outline", class: "mt-2 w-full" }, {}, {
              default: () => {
                return `Add New Habit`;
              }
            })}</div></div>  ${$newKpi.habitName ? `<div class="space-y-4"> <div class="p-4 bg-muted rounded"><p class="font-medium">${escape(kpiPreview)}</p></div> <div class="flex gap-4 items-end"><div class="flex-1">${validate_component(Input, "Input").$$render(
              $$result,
              {
                type: "number",
                min: "1",
                value: $newKpi.target
              },
              {
                value: ($$value) => {
                  $newKpi.target = $$value;
                  $$settled = false;
                }
              },
              {}
            )}</div> <div class="flex-1"><select class="w-full p-2 border rounded"><option value="day" data-svelte-h="svelte-rj6hpf">per day</option><option value="week" data-svelte-h="svelte-6224ip">per week</option><option value="month" data-svelte-h="svelte-6ypshr">per month</option></select></div></div> ${validate_component(Button, "Button").$$render(
              $$result,
              {
                class: "w-full",
                disabled: !$newKpi.habit_id
              },
              {},
              {
                default: () => {
                  return `Add to Goal`;
                }
              }
            )}</div>` : ``}</div></div></div> <div class="flex justify-end gap-2 pt-4 mt-4 border-t">${validate_component(Button, "Button").$$render($$result, { variant: "outline" }, {}, {
              default: () => {
                return `Cancel`;
              }
            })} ${validate_component(Button, "Button").$$render(
              $$result,
              {
                disabled: !$goalName || $addedKpis.length === 0
              },
              {},
              {
                default: () => {
                  return `${escape(editingGoal ? "Save Changes" : "Create Goal")}`;
                }
              }
            )}</div>`;
          }
        })}`;
      }
    })} ${validate_component(HabitSearchModal, "HabitSearchModal").$$render($$result, { open: showHabitModal }, {}, {})}`;
  } while (!$$settled);
  $$unsubscribe_newKpi();
  $$unsubscribe_addedKpis();
  $$unsubscribe_goalDescription();
  $$unsubscribe_goalName();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $goalStore, $$unsubscribe_goalStore;
  $$unsubscribe_goalStore = subscribe(goalStore, (value) => $goalStore = value);
  let showCreateDialog = false;
  let editingGoal = null;
  $$unsubscribe_goalStore();
  return `<div class="container mx-auto py-6"><div class="flex justify-between items-center mb-6"><h1 class="text-3xl font-bold" data-svelte-h="svelte-db62r">Goals</h1> ${validate_component(Button, "Button").$$render($$result, {}, {}, {
    default: () => {
      return `Create Goal`;
    }
  })}</div> ${validate_component(GoalCreationDialog, "GoalCreationDialog").$$render($$result, { open: showCreateDialog, editingGoal }, {}, {})}  ${$goalStore.loading ? `<p data-svelte-h="svelte-1ja2pv6">Loading goals...</p>` : `${$goalStore.error ? `<p class="text-red-500">${escape($goalStore.error)}</p>` : `<div class="grid gap-4">${each($goalStore.goals, (goal) => {
    return `${validate_component(Card, "Card.Root").$$render($$result, { class: "p-6" }, {}, {
      default: () => {
        return ` <div class="flex justify-between"> <div class="flex-1"><div class="flex justify-between items-start mb-2"><h3 class="text-xl font-semibold">${escape(goal.name)}</h3> ${validate_component(Button, "Button").$$render($$result, { variant: "ghost", size: "sm" }, {}, {
          default: () => {
            return `Edit
                                `;
          }
        })}</div> ${goal.description ? `<p class="text-muted-foreground mb-4">${escape(goal.description)}</p>` : ``}  <div class="space-y-3"><h4 class="text-sm font-medium text-muted-foreground" data-svelte-h="svelte-1auv5ty">KPIs</h4> ${goal.kpis && goal.kpis.length > 0 ? `${each(goal.kpis, (kpi, i) => {
          return `<div class="flex items-center gap-4 py-2 border-b last:border-0"><div class="flex-1"><span class="font-medium">${escape(kpi.name)}</span></div> <div class="text-sm text-muted-foreground">${escape(kpi.target)} time${escape(kpi.target !== 1 ? "s" : "")} per ${escape(kpi.period)}</div> <div class="flex items-center gap-2">${function(__value) {
            if (is_promise(__value)) {
              __value.then(null, noop$1);
              return ` <div class="w-24 text-right" data-svelte-h="svelte-d3vgr6"><span class="text-sm">Calculating...</span></div> `;
            }
            return function(performance) {
              return ` <div class="w-24 text-right"><span class="text-sm font-medium">${escape(performance?.kpis[i] ? `${Math.round(performance.kpis[i].performance)}%` : "0%")} </span></div> `;
            }(__value);
          }(goalStore.getGoalPerformance(goal.id))} ${validate_component(Button, "Button").$$render(
            $$result,
            {
              variant: "ghost",
              size: "sm",
              class: "text-destructive"
            },
            {},
            {
              default: () => {
                return `Remove
                                                `;
              }
            }
          )}</div> </div>`;
        })}` : `<p class="text-sm text-muted-foreground" data-svelte-h="svelte-1f71qcn">No KPIs defined</p>`} </div></div>  <div class="w-48 ml-6 pl-6 border-l">${function(__value) {
          if (is_promise(__value)) {
            __value.then(null, noop$1);
            return ` <div class="space-y-2" data-svelte-h="svelte-4m8oxd"><div class="text-sm font-medium text-muted-foreground">Calculating...</div></div> `;
          }
          return function(performance) {
            return ` <div class="space-y-2"><div class="text-sm font-medium text-muted-foreground" data-svelte-h="svelte-19hakfp">Overall Progress</div> <div class="text-2xl font-semibold">${escape(performance ? `${Math.round(performance.overallProgress)}%` : "0%")}</div> <div class="text-sm text-muted-foreground">This Week: ${escape(performance?.kpis.filter((k) => k.performance >= 100).length || 0)}/${escape(goal.kpis?.length || 0)} </div></div> `;
          }(__value);
        }(goalStore.getGoalPerformance(goal.id))} </div></div> `;
      }
    })}`;
  })}</div>`}`}</div>`;
});
export {
  Page as default
};
