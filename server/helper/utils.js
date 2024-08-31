const crypto = require("crypto");

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

function cleanInputData(input) {
  return input
    .split("\n") // Split the input into lines
    .map((line) => line.replace(/^\s*[-*]?\s*\d*\.\s*/, "").trim()) // Remove list numbers and bullet points
    .filter((line) => line); // Remove any empty strings
}

module.exports = {
  generateFileName,
  cleanInputData,
};
