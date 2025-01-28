import { f as fail, r as redirect } from "../../../../chunks/index.js";
const actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const isSignUp = formData.get("isSignUp") === "true";
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) {
        return fail(400, { error: error.message });
      }
      return { success: true, message: "Check your email to confirm your account" };
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        return fail(400, { error: error.message });
      }
      throw redirect(303, "/dashboard");
    }
  }
};
export {
  actions
};
