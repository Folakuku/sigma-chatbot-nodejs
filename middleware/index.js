function ensureAuthenticated(req, res, next) {
  console.log("middleware");
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = { ensureAuthenticated };
