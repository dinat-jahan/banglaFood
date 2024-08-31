require("dotenv").config();
const bucketName = process.env.AWS_BUCKET_NAME;
const express = require("express");
const router = express.Router();
const { generateFileName, cleanInputData } = require("../helper/utils");
const { RecipeModel, CategoryModel } = require("../models/recipe");

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = require("../config/awsConfig");

router.get("/", async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    for (let category of categories) {
      category.imageUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: bucketName,
          Key: category.imageName,
        }),
        { expiresIn: 3600 }
      );
    }
    const recipes = await RecipeModel.find();
    for (let recipe of recipes) {
      recipe.imageUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: bucketName,
          Key: recipe.imageName,
        }),
        { expiresIn: 3600 }
      );
    }

    res.render("index.ejs", {
      categories,
      recipes,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/recipe/:id", async (req, res) => {
  try {
    let slug = req.params.id;

    const recipe = await RecipeModel.findById({ _id: slug });
    recipe.imageUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: recipe.imageName,
      }),
      { expiresIn: 3600 }
    );
    res.render("recipe", {
      recipe,
      currentRoute: `/recipe/${slug}`,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/recipes", async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    for (let category of categories) {
      category.imageUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: bucketName,
          Key: category.imageName,
        }),
        { expiresIn: 3600 }
      );
    }
    console.log(categories);
    res.render("categories.ejs", {
      categories,
    });
  } catch (error) {
    console.log("Error fetching posts:", error);
    res.status(500).send("An error occurred while fetching posts.");
  }

  // res.sendFile(__dirname + "/category.html");
});

module.exports = router;
