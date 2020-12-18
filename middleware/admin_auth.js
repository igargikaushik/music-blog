export default (context) => {
  if (!context.store.state.user?.admin) {
    return context.redirect(301, '/');
  }
};