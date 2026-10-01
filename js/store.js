// Browser storage for settings.
// Keys are prefixed: GitHub Pages serves all project sites of a user from one
// origin (user.github.io), and they share localStorage.

(function (app) {
  const PREFIX = "wielprijs.";

  function read(key) {
    try {
      return JSON.parse(localStorage.getItem(PREFIX + key));
    } catch {
      return null;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Storage unavailable (private mode, disabled, full): settings just won't persist.
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // See write().
    }
  }

  app.store = { read, write, remove };
})(WielPrijs);
