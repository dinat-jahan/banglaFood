const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: String,
  imageName: String,
});

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  ingredients: {
    type: [String],
    required: true,
  },
  instructions: {
    type: [String],
    required: true,
  },
  servings: {
    type: Number,
    required: true,
    min: 1,
  },
  categories: [String],
  imageName: {
    type: String,
    required: true,
  },
});

const RecipeModel = mongoose.model("RecipeModel", recipeSchema);
const CategoryModel = mongoose.model("CategoryModel", categorySchema);

module.exports = { RecipeModel, CategoryModel };
