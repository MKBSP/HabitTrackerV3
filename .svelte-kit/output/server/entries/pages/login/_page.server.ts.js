import { f as fail, r as redirect } from "../../../chunks/index.js";
const actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const isSignUp = formData.get("isSignUp") === "true";
    if (!email || !password) {
      return fail(400, { error: "Missing email or password" });
    }
    if (isSignUp) {
      const { error } = await locals.supabase.auth.signUp({
        email,
        password
      });
      if (error) {
        return fail(400, { error: error.message });
      }
      return { message: "Check your email for the confirmation link" };
    } else {
      const { error } = await locals.supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        return fail(400, { error: error.message });
      }
      throw redirect(303, "/");
    }
  }
};
export {
  actions
};
