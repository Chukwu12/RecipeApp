module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      // Check if this is an API request (AJAX/fetch)
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      // Regular page request - redirect to home
      res.redirect("/");
    }
  }
};
