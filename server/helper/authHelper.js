require("dotenv").config();
const jwt = require("jsonwebtoken");
const handleErrors = (err) => {
  let errors = { username: "", email: "", password: "" };
  console.log(err.message, err.keyPattern);
  //incorrect email
  if (err.message === "incorrect email") {
    errors.email = "That email is not registered";
  }
  //incorrect password
  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
  }

  //duplicate email error
  if (err.code === 11000) {
    // Check which field caused the duplication error
    if (err.keyPattern.username) {
      errors.username = "Username is already taken";
    }
    if (err.keyPattern.email) {
      errors.email = "Email is already registered";
    }
    return errors;
  }
  console.log(err);

  // Validation errors
  if (err.errors) {
    Object.values(err.errors).forEach(({ properties }) => {
      if (properties.path === "password") {
        errors.password = properties.message;
      } else if (properties.path === "username") {
        errors.username = properties.message;
      } else if (properties.path === "email") {
        errors.email = properties.message;
      }
    });
  }
  // if (err.message.includes("user validation failed")) {
  //   console.log("err");
  //   Object.values(err.errors).forEach(({ properties }) => {
  //     errors[properties.path] = properties.message;
  //     console.log(
  //       `Setting error for ${properties.path}: ${properties.message}`
  //     );
  //   });
  // }
  return errors;
};

//create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: maxAge,
  });
};

module.exports = {
  handleErrors,
  maxAge,
  createToken,
};
