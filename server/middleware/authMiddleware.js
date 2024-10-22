const jwt = require("jsonwebtoken");
const { User } = require("../models/recipe");
require("dotenv").config();

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        // Check if the request is an AJAX request
        if (req.xhr || req.headers.accept.includes("application/json")) {
          return res
            .status(401)
            .json({ error: "Unauthorized. Please log in." });
        } else {
          return res.redirect("/login");
        }
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    // Check if the request is an AJAX request
    if (req.xhr || req.headers.accept.includes("application/json")) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    } else {
      return res.redirect("/login");
    }
  }
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports = { requireAuth, checkUser };
