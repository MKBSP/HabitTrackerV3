import { c as create_ssr_component, j as compute_rest_props, a as subscribe, b as spread, d as escape_object, k as add_attribute, s as setContext, g as getContext, v as validate_component, n as escape_attribute_value, e as escape, p as each } from "../../../../chunks/ssr.js";
import "../../../../chunks/client.js";
import { m as makeElement, d as addMeltEventListener, o as omit, j as disabledAttr, e as executeCallbacks, i as isHTMLElement, l as getDirectionalKeys, k as kbd, h as isBrowser, g as createElHelpers } from "../../../../chunks/index3.js";
import { C as Card } from "../../../../chunks/card.js";
import { C as Card_header, a as Card_title, b as Card_content } from "../../../../chunks/card-title.js";
import { C as Card_description } from "../../../../chunks/card-description.js";
import "clsx";
import { t as toWritableStores, o as overridable, n as next, p as prev, l as last, c as createBitAttrs, a as createDispatcher, r as removeUndefined, g as getOptionUpdater, I as Input } from "../../../../chunks/input.js";
import "dequal";
import { c as cn, B as Button } from "../../../../chunks/button.js";
import { w as writable } from "../../../../chunks/index2.js";
function getElemDirection(elem) {
  const style = window.getComputedStyle(elem);
  const direction = style.getPropertyValue("direction");
  return direction;
}
function createLabel() {
  const root = makeElement("label", {
    action: (node) => {
      const mouseDown = addMeltEventListener(node, "mousedown", (e) => {
        if (!e.defaultPrevented && e.detail > 1) {
          e.preventDefault();
        }
      });
      return {
        destroy: mouseDown
      };
    }
  });
  return {
    elements: {
      root
    }
  };
}
const defaults = {
  orientation: "horizontal",
  activateOnFocus: true,
  loop: true,
  autoSet: true
};
const { name, selector } = createElHelpers("tabs");
function createTabs(props) {
  const withDefaults = { ...defaults, ...props };
  const options = toWritableStores(omit(withDefaults, "defaultValue", "value", "onValueChange", "autoSet"));
  const { orientation, activateOnFocus, loop } = options;
  const valueWritable = withDefaults.value ?? writable(withDefaults.defaultValue);
  const value = overridable(valueWritable, withDefaults?.onValueChange);
  let ssrValue = withDefaults.defaultValue ?? value.get();
  const root = makeElement(name(), {
    stores: orientation,
    returned: ($orientation) => {
      return {
        "data-orientation": $orientation
      };
    }
  });
  const list = makeElement(name("list"), {
    stores: orientation,
    returned: ($orientation) => {
      return {
        role: "tablist",
        "aria-orientation": $orientation,
        "data-orientation": $orientation
      };
    }
  });
  const parseTriggerProps = (props2) => {
    if (typeof props2 === "string") {
      return { value: props2 };
    } else {
      return props2;
    }
  };
  const trigger = makeElement(name("trigger"), {
    stores: [value, orientation],
    returned: ([$value, $orientation]) => {
      return (props2) => {
        const { value: tabValue, disabled } = parseTriggerProps(props2);
        if (!$value && !ssrValue && withDefaults.autoSet) {
          ssrValue = tabValue;
          $value = tabValue;
          value.set(tabValue);
        }
        const sourceOfTruth = isBrowser ? $value : ssrValue;
        const isActive = sourceOfTruth === tabValue;
        return {
          type: "button",
          role: "tab",
          "data-state": isActive ? "active" : "inactive",
          tabindex: isActive ? 0 : -1,
          "data-value": tabValue,
          "data-orientation": $orientation,
          "data-disabled": disabledAttr(disabled),
          disabled: disabledAttr(disabled)
        };
      };
    },
    action: (node) => {
      const unsub = executeCallbacks(addMeltEventListener(node, "focus", () => {
        const disabled = node.dataset.disabled === "true";
        const tabValue = node.dataset.value;
        if (activateOnFocus.get() && !disabled && tabValue !== void 0) {
          value.set(tabValue);
        }
      }), addMeltEventListener(node, "click", (e) => {
        node.focus();
        e.preventDefault();
        const disabled = node.dataset.disabled === "true";
        if (disabled)
          return;
        const tabValue = node.dataset.value;
        node.focus();
        if (tabValue !== void 0) {
          value.set(tabValue);
        }
      }), addMeltEventListener(node, "keydown", (e) => {
        const tabValue = node.dataset.value;
        if (!tabValue)
          return;
        const el = e.currentTarget;
        if (!isHTMLElement(el))
          return;
        const rootEl = el.closest(selector());
        if (!isHTMLElement(rootEl))
          return;
        const $loop = loop.get();
        const triggers = Array.from(rootEl.querySelectorAll('[role="tab"]')).filter((trigger2) => isHTMLElement(trigger2));
        const enabledTriggers = triggers.filter((el2) => !el2.hasAttribute("data-disabled"));
        const triggerIdx = enabledTriggers.findIndex((el2) => el2 === e.target);
        const dir = getElemDirection(rootEl);
        const { nextKey, prevKey } = getDirectionalKeys(dir, orientation.get());
        if (e.key === nextKey) {
          e.preventDefault();
          const nextEl = next(enabledTriggers, triggerIdx, $loop);
          nextEl.focus();
        } else if (e.key === prevKey) {
          e.preventDefault();
          const prevEl = prev(enabledTriggers, triggerIdx, $loop);
          prevEl.focus();
        } else if (e.key === kbd.ENTER || e.key === kbd.SPACE) {
          e.preventDefault();
          value.set(tabValue);
        } else if (e.key === kbd.HOME) {
          e.preventDefault();
          const firstTrigger = enabledTriggers[0];
          firstTrigger.focus();
        } else if (e.key === kbd.END) {
          e.preventDefault();
          const lastTrigger = last(enabledTriggers);
          lastTrigger.focus();
        }
      }));
      return {
        destroy: unsub
      };
    }
  });
  const content = makeElement(name("content"), {
    stores: value,
    returned: ($value) => {
      return (tabValue) => {
        return {
          role: "tabpanel",
          // TODO: improve
          "aria-labelledby": tabValue,
          hidden: isBrowser ? $value === tabValue ? void 0 : true : ssrValue === tabValue ? void 0 : true,
          tabindex: 0
        };
      };
    }
  });
  return {
    elements: {
      root,
      list,
      trigger,
      content
    },
    states: {
      value
    },
    options
  };
}
function getLabelData() {
  const NAME = "label";
  const PARTS = ["root"];
  const getAttrs = createBitAttrs(NAME, PARTS);
  return {
    NAME,
    getAttrs
  };
}
const Label$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $root, $$unsubscribe_root;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { root } } = createLabel();
  $$unsubscribe_root = subscribe(root, (value) => $root = value);
  createDispatcher();
  const { getAttrs } = getLabelData();
  const attrs = getAttrs("root");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0) $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0) $$bindings.el(el);
  builder = $root;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_root();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<label${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</label>`}`;
});
function getTabsData() {
  const NAME = "tabs";
  const PARTS = ["root", "content", "list", "trigger"];
  return {
    NAME,
    PARTS
  };
}
function setCtx(props) {
  const { NAME, PARTS } = getTabsData();
  const getAttrs = createBitAttrs(NAME, PARTS);
  const tabs = { ...createTabs(removeUndefined(props)), getAttrs };
  setContext(NAME, tabs);
  return {
    ...tabs,
    updateOption: getOptionUpdater(tabs.options)
  };
}
function getCtx() {
  const { NAME } = getTabsData();
  return getContext(NAME);
}
const Tabs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, [
    "orientation",
    "activateOnFocus",
    "loop",
    "autoSet",
    "value",
    "onValueChange",
    "asChild",
    "el"
  ]);
  let $root, $$unsubscribe_root;
  let $localValue, $$unsubscribe_localValue;
  let { orientation = void 0 } = $$props;
  let { activateOnFocus = void 0 } = $$props;
  let { loop = void 0 } = $$props;
  let { autoSet = void 0 } = $$props;
  let { value = void 0 } = $$props;
  let { onValueChange = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { root }, states: { value: localValue }, updateOption, getAttrs } = setCtx({
    orientation,
    activateOnFocus,
    loop,
    autoSet,
    defaultValue: value,
    onValueChange: ({ next: next2 }) => {
      if (value !== next2) {
        onValueChange?.(next2);
        value = next2;
      }
      return next2;
    }
  });
  $$unsubscribe_root = subscribe(root, (value2) => $root = value2);
  $$unsubscribe_localValue = subscribe(localValue, (value2) => $localValue = value2);
  const attrs = getAttrs("root");
  if ($$props.orientation === void 0 && $$bindings.orientation && orientation !== void 0) $$bindings.orientation(orientation);
  if ($$props.activateOnFocus === void 0 && $$bindings.activateOnFocus && activateOnFocus !== void 0) $$bindings.activateOnFocus(activateOnFocus);
  if ($$props.loop === void 0 && $$bindings.loop && loop !== void 0) $$bindings.loop(loop);
  if ($$props.autoSet === void 0 && $$bindings.autoSet && autoSet !== void 0) $$bindings.autoSet(autoSet);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
  if ($$props.onValueChange === void 0 && $$bindings.onValueChange && onValueChange !== void 0) $$bindings.onValueChange(onValueChange);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0) $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0) $$bindings.el(el);
  value !== void 0 && localValue.set(value);
  {
    updateOption("orientation", orientation);
  }
  {
    updateOption("activateOnFocus", activateOnFocus);
  }
  {
    updateOption("loop", loop);
  }
  {
    updateOption("autoSet", autoSet);
  }
  builder = $root;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_root();
  $$unsubscribe_localValue();
  return `${asChild ? `${slots.default ? slots.default({ builder, value: $localValue }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder, value: $localValue }) : ``}</div>`}`;
});
const Tabs_content$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["value", "asChild", "el"]);
  let $content, $$unsubscribe_content;
  let { value } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { content }, getAttrs } = getCtx();
  $$unsubscribe_content = subscribe(content, (value2) => $content = value2);
  const attrs = getAttrs("content");
  if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0) $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0) $$bindings.el(el);
  builder = $content(value);
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_content();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>`}`;
});
const Tabs_list$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $list, $$unsubscribe_list;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { list }, getAttrs } = getCtx();
  $$unsubscribe_list = subscribe(list, (value) => $list = value);
  const attrs = getAttrs("list");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0) $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0) $$bindings.el(el);
  builder = $list;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_list();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>`}`;
});
const Tabs_trigger$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["value", "disabled", "asChild", "el"]);
  let $trigger, $$unsubscribe_trigger;
  let { value } = $$props;
  let { disabled = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { trigger }, getAttrs } = getCtx();
  $$unsubscribe_trigger = subscribe(trigger, (value2) => $trigger = value2);
  createDispatcher();
  const attrs = getAttrs("trigger");
  if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0) $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0) $$bindings.el(el);
  builder = $trigger({ value, disabled });
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_trigger();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<button${spread([escape_object(builder), { type: "button" }, escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</button>`}`;
});
const Label = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0) $$bindings.class(className);
  return `${validate_component(Label$1, "LabelPrimitive.Root").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)
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
const Textarea = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "value", "readonly"]);
  let { class: className = void 0 } = $$props;
  let { value = void 0 } = $$props;
  let { readonly = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0) $$bindings.class(className);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
  if ($$props.readonly === void 0 && $$bindings.readonly && readonly !== void 0) $$bindings.readonly(readonly);
  return `<textarea${spread(
    [
      {
        class: escape_attribute_value(cn("border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className))
      },
      { readonly: readonly || null },
      escape_object($$restProps)
    ],
    {}
  )}>${escape(value || "")}</textarea>`;
});
const Tabs_content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "value"]);
  let { class: className = void 0 } = $$props;
  let { value } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0) $$bindings.class(className);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
  return `${validate_component(Tabs_content$1, "TabsPrimitive.Content").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("ring-offset-background focus-visible:ring-ring mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2", className)
      },
      { value },
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
const Tabs_list = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0) $$bindings.class(className);
  return `${validate_component(Tabs_list$1, "TabsPrimitive.List").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1", className)
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
const Tabs_trigger = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "value"]);
  let { class: className = void 0 } = $$props;
  let { value } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0) $$bindings.class(className);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
  return `${validate_component(Tabs_trigger$1, "TabsPrimitive.Trigger").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm", className)
      },
      { value },
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
const Root = Tabs;
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { profile } = data;
  let deleteConfirmation = "";
  let editing = {
    userName: false,
    location: false,
    description: false
  };
  let formData = {
    userName: profile?.user_name ?? "",
    location: profile?.location ?? "",
    description: profile?.description ?? ""
  };
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `  <div class="container mx-auto py-8 max-w-3xl">${validate_component(Root, "Tabs").$$render($$result, { value: "profile", class: "space-y-6" }, {}, {
      default: () => {
        return `${validate_component(Tabs_list, "TabsList").$$render($$result, { class: "grid w-full grid-cols-3" }, {}, {
          default: () => {
            return `${validate_component(Tabs_trigger, "TabsTrigger").$$render($$result, { value: "profile" }, {}, {
              default: () => {
                return `Profile`;
              }
            })} ${validate_component(Tabs_trigger, "TabsTrigger").$$render($$result, { value: "security" }, {}, {
              default: () => {
                return `Security`;
              }
            })} ${validate_component(Tabs_trigger, "TabsTrigger").$$render($$result, { value: "danger" }, {}, {
              default: () => {
                return `Danger Zone`;
              }
            })}`;
          }
        })} ${validate_component(Tabs_content, "TabsContent").$$render($$result, { value: "profile" }, {}, {
          default: () => {
            return `${validate_component(Card, "Card.Root").$$render($$result, { class: "border-2 border-border" }, {}, {
              default: () => {
                return `${validate_component(Card_header, "Card.Header").$$render($$result, { class: "space-y-1" }, {}, {
                  default: () => {
                    return `${validate_component(Card_title, "Card.Title").$$render($$result, { class: "text-2xl font-semibold" }, {}, {
                      default: () => {
                        return `Profile Settings`;
                      }
                    })} ${validate_component(Card_description, "Card.Description").$$render($$result, {}, {}, {
                      default: () => {
                        return `Manage your personal information`;
                      }
                    })}`;
                  }
                })} ${validate_component(Card_content, "Card.Content").$$render($$result, {}, {}, {
                  default: () => {
                    return `<div class="space-y-6"> ${each(["userName", "location", "description"], (field) => {
                      return `<div class="space-y-2">${validate_component(Label, "Label").$$render($$result, { class: "text-sm font-medium" }, {}, {
                        default: () => {
                          return `${escape(field === "userName" ? "Username" : field === "location" ? "Location" : "About")} `;
                        }
                      })} <div class="flex items-center gap-3">${editing[field] ? `${field === "description" ? `${validate_component(Textarea, "Textarea").$$render(
                        $$result,
                        {
                          placeholder: `Enter your ${field}`,
                          rows: "4",
                          class: "flex-1",
                          value: formData[field]
                        },
                        {
                          value: ($$value) => {
                            formData[field] = $$value;
                            $$settled = false;
                          }
                        },
                        {}
                      )}` : `${validate_component(Input, "Input").$$render(
                        $$result,
                        {
                          placeholder: `Enter your ${field}`,
                          class: "flex-1",
                          value: formData[field]
                        },
                        {
                          value: ($$value) => {
                            formData[field] = $$value;
                            $$settled = false;
                          }
                        },
                        {}
                      )}`} ${validate_component(Button, "Button").$$render($$result, { size: "sm", class: "shrink-0" }, {}, {
                        default: () => {
                          return `Save
                                        `;
                        }
                      })}` : `<p class="flex-1 py-2 px-3 bg-muted rounded-md min-h-[2.5rem] flex items-center">${escape(profile[field === "userName" ? "user_name" : field] || `No ${field} set`)}</p> ${validate_component(Button, "Button").$$render(
                        $$result,
                        {
                          variant: "ghost",
                          size: "sm",
                          class: "shrink-0"
                        },
                        {},
                        {
                          default: () => {
                            return `Edit
                                        `;
                          }
                        }
                      )}`}</div> </div>`;
                    })}</div>`;
                  }
                })}`;
              }
            })}`;
          }
        })} ${validate_component(Tabs_content, "TabsContent").$$render($$result, { value: "security" }, {}, {
          default: () => {
            return `<div class="space-y-6"> ${validate_component(Card, "Card.Root").$$render($$result, { class: "border-2 border-border" }, {}, {
              default: () => {
                return `${validate_component(Card_header, "Card.Header").$$render($$result, { class: "space-y-1" }, {}, {
                  default: () => {
                    return `${validate_component(Card_title, "Card.Title").$$render($$result, { class: "text-2xl font-semibold" }, {}, {
                      default: () => {
                        return `Email Settings`;
                      }
                    })} ${validate_component(Card_description, "Card.Description").$$render($$result, {}, {}, {
                      default: () => {
                        return `Update your email address`;
                      }
                    })}`;
                  }
                })} ${validate_component(Card_content, "Card.Content").$$render($$result, {}, {}, {
                  default: () => {
                    return `<form method="POST" action="?/updateEmail" class="space-y-4"><div class="space-y-2">${validate_component(Label, "Label").$$render($$result, { class: "text-sm font-medium" }, {}, {
                      default: () => {
                        return `Email Address`;
                      }
                    })} ${validate_component(Input, "Input").$$render(
                      $$result,
                      {
                        name: "email",
                        type: "email",
                        value: profile?.email ?? ""
                      },
                      {},
                      {}
                    )}</div> ${validate_component(Button, "Button").$$render($$result, { type: "submit", class: "w-full" }, {}, {
                      default: () => {
                        return `Update Email`;
                      }
                    })}</form>`;
                  }
                })}`;
              }
            })}  ${validate_component(Card, "Card.Root").$$render($$result, { class: "border-2 border-border" }, {}, {
              default: () => {
                return `${validate_component(Card_header, "Card.Header").$$render($$result, { class: "space-y-1" }, {}, {
                  default: () => {
                    return `${validate_component(Card_title, "Card.Title").$$render($$result, { class: "text-2xl font-semibold" }, {}, {
                      default: () => {
                        return `Password Settings`;
                      }
                    })} ${validate_component(Card_description, "Card.Description").$$render($$result, {}, {}, {
                      default: () => {
                        return `Change your password`;
                      }
                    })}`;
                  }
                })} ${validate_component(Card_content, "Card.Content").$$render($$result, {}, {}, {
                  default: () => {
                    return `<form method="POST" action="?/updatePassword" class="space-y-4">${each(["currentPassword", "newPassword", "confirmPassword"], (field) => {
                      return `<div class="space-y-2">${validate_component(Label, "Label").$$render($$result, { class: "text-sm font-medium" }, {}, {
                        default: () => {
                          return `${escape(field === "currentPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm New Password")} `;
                        }
                      })} ${validate_component(Input, "Input").$$render(
                        $$result,
                        {
                          name: field,
                          type: "password",
                          required: true
                        },
                        {},
                        {}
                      )} </div>`;
                    })} ${validate_component(Button, "Button").$$render($$result, { type: "submit", class: "w-full" }, {}, {
                      default: () => {
                        return `Update Password`;
                      }
                    })}</form>`;
                  }
                })}`;
              }
            })}</div>`;
          }
        })} ${validate_component(Tabs_content, "TabsContent").$$render($$result, { value: "danger" }, {}, {
          default: () => {
            return `${validate_component(Card, "Card.Root").$$render($$result, { class: "border-2 border-destructive/50" }, {}, {
              default: () => {
                return `${validate_component(Card_header, "Card.Header").$$render($$result, { class: "space-y-1" }, {}, {
                  default: () => {
                    return `${validate_component(Card_title, "Card.Title").$$render(
                      $$result,
                      {
                        class: "text-2xl font-semibold text-destructive"
                      },
                      {},
                      {
                        default: () => {
                          return `Delete Account`;
                        }
                      }
                    )} ${validate_component(Card_description, "Card.Description").$$render($$result, {}, {}, {
                      default: () => {
                        return `Once your account is deactivated, all your data will become inaccessible.`;
                      }
                    })}`;
                  }
                })} ${validate_component(Card_content, "Card.Content").$$render($$result, {}, {}, {
                  default: () => {
                    return `<form method="POST" action="?/deleteProfile" class="space-y-4"><div class="space-y-2">${validate_component(Label, "Label").$$render($$result, { class: "text-sm font-medium" }, {}, {
                      default: () => {
                        return `Confirmation`;
                      }
                    })} <div class="space-y-1">${validate_component(Input, "Input").$$render(
                      $$result,
                      {
                        name: "deleteConfirmation",
                        placeholder: 'Type "delete me" to confirm',
                        required: true,
                        value: deleteConfirmation
                      },
                      {
                        value: ($$value) => {
                          deleteConfirmation = $$value;
                          $$settled = false;
                        }
                      },
                      {}
                    )} <p class="text-xs text-muted-foreground" data-svelte-h="svelte-1jfs3kg">This action cannot be undone.</p></div></div> ${validate_component(Button, "Button").$$render(
                      $$result,
                      {
                        type: "submit",
                        variant: "destructive",
                        class: "w-full",
                        disabled: deleteConfirmation !== "delete me"
                      },
                      {},
                      {
                        default: () => {
                          return `Deactivate Account`;
                        }
                      }
                    )}</form>`;
                  }
                })}`;
              }
            })}`;
          }
        })}`;
      }
    })}</div>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};
