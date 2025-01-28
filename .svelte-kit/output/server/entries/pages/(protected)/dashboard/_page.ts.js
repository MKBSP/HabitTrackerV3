const load = async ({ parent }) => {
  const { session } = await parent();
  return {
    session
  };
};
export {
  load
};
