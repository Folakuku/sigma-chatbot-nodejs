function ensureAuthenticated(req, res, next) {
  console.log("middleware");
  if (req.isAuthenticated()) {
    console.log("authenticated");
    return next();
  }
  console.log("please login");
  res.redirect("/login");
}

module.exports = { ensureAuthenticated };
