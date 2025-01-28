import { r as redirect } from "../../../chunks/index.js";
const load = async ({ parent }) => {
  const { session } = await parent();
  if (!session) {
    throw redirect(303, "/auth/login");
  }
  return {
    session
  };
};
export {
  load
};
