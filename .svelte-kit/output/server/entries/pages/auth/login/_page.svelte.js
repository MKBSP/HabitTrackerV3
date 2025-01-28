import { c as create_ssr_component, v as validate_component, e as escape, k as add_attribute } from "../../../../chunks/ssr.js";
import "../../../../chunks/index3.js";
import { C as Card } from "../../../../chunks/card.js";
import { C as Card_header, a as Card_title, b as Card_content } from "../../../../chunks/card-title.js";
import { C as Card_description } from "../../../../chunks/card-description.js";
import "clsx";
import "../../../../chunks/client.js";
import { B as Button } from "../../../../chunks/button.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let email = "";
  let password = "";
  let isSignUp = false;
  return `${validate_component(Card, "Card.Root").$$render($$result, { class: "mx-auto max-w-md" }, {}, {
    default: () => {
      return `${validate_component(Card_header, "Card.Header").$$render($$result, {}, {}, {
        default: () => {
          return `${validate_component(Card_title, "Card.Title").$$render($$result, { class: "text-3xl font-thin" }, {}, {
            default: () => {
              return `${escape("Login")}`;
            }
          })} ${validate_component(Card_description, "Card.Description").$$render($$result, {}, {}, {
            default: () => {
              return `${escape("Choose a provider or use email")}`;
            }
          })}`;
        }
      })} ${validate_component(Card_content, "Card.Content").$$render($$result, { class: "space-y-4" }, {}, {
        default: () => {
          return `<form method="POST" class="space-y-4"><input type="email" name="email" placeholder="Email" class="w-full rounded border p-2" required${add_attribute("value", email, 0)}> <input type="password" name="password" placeholder="Password" class="w-full rounded border p-2" required${add_attribute("value", password, 0)}> <input type="hidden" name="isSignUp"${add_attribute("value", isSignUp, 0)}> ${validate_component(Button, "Button").$$render($$result, { type: "submit", class: "w-full" }, {}, {
            default: () => {
              return `${escape("Login")}`;
            }
          })}</form> <div class="text-center"><button class="text-sm text-blue-500 hover:underline">${escape("Need an account? Sign Up")}</button></div>`;
        }
      })}`;
    }
  })}`;
});
export {
  Page as default
};
