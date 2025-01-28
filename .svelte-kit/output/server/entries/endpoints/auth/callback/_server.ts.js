import { r as redirect } from "../../../../chunks/index.js";
const GET = async (event) => {
  const {
    url,
    locals: { supabase }
  } = event;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      throw redirect(303, `/${next.slice(1)}`);
    }
  }
  throw redirect(303, "/auth/auth-code-error");
};
export {
  GET
};
