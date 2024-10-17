require("dotenv").config();
const bucketName = process.env.AWS_BUCKET_NAME;
const express = require("express");
const router = express.Router();
const { generateFileName, cleanInputData } = require("../helper/utils");
const { RecipeModel, CategoryModel } = require("../models/recipe");
const authController = require("../controllers/authController");
const { checkUser, requireAuth } = require("../middleware/authMiddleware");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = require("../config/awsConfig");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("*", checkUser);

router.get("/upload", (req, res) => {
  res.render("addRecipe");
});

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const title = req.body.title;
    const servings = req.body.servings;
    const categories = req.body.categories;
    const description = req.body.description;
    const ingredientsInput = req.body.ingredients;
    const ingredients = ingredientsInput
      ? cleanInputData(ingredientsInput)
      : [];

    const instructionsInput = req.body.instructions;
    const instructions = instructionsInput
      ? cleanInputData(instructionsInput)
      : [];
    const imgFile = req.file;
    if (!imgFile) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded." });
    }

    const imageName = generateFileName();
    if (!imageName) {
      throw new Error("Failed to generate a file name for the image.");
    }

    const uploadParams = {
      Bucket: bucketName,
      Key: imageName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const newRecipe = new RecipeModel({
      title,
      description,
      ingredients,
      instructions,
      servings,
      categories,
      imageName,
    });
    await newRecipe.save();
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "An error occurred." });
  }
});

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

    let limit = 10;
    let page = parseInt(req.query.page) || 1;

    let countRecipe = await RecipeModel.countDocuments();
    let countPage = Math.ceil(countRecipe / 10);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const hasPrevpage = startIndex > 0;
    const hasNextpage = endIndex < countRecipe;

    const recipes = await RecipeModel.find()
      .limit(limit)
      .skip(startIndex)
      .exec();
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
      nextPage: hasNextpage ? page + 1 : null,
      prevPage: hasPrevpage ? page - 1 : null,
      countPage,

      current: page,
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

    res.render("categories.ejs", {
      categories,
    });
  } catch (error) {
    console.log("Error fetching posts:", error);
    res.status(500).send("An error occurred while fetching posts.");
  }

  // res.sendFile(__dirname + "/category.html");
});

router.get("/category/:categoryName", async (req, res) => {
  try {
    const categoryName = req.params.categoryName;
    const recipes = await RecipeModel.find({ categories: categoryName });
    for (recipe of recipes) {
      recipe.imageUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: bucketName,
          Key: recipe.imageName,
        }),
        { expiresIn: 3600 }
      );
    }
    res.render("recipeofCategories", {
      categoryName,
      recipes,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/search", async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");

    const recipes = await RecipeModel.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        {
          ingredients: { $regex: new RegExp(searchNoSpecialChar, "i") },
        },
        { category: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });
    for (recipe of recipes) {
      recipe.imageUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: bucketName,
          Key: recipe.imageName,
        }),
        { expiresIn: 3600 }
      );
    }
    res.render("search", {
      recipes,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/contact", (req, res) => {
  res.render("contact.ejs", {});
});

//auth routes
router.get("/signup", authController.signup_get);
router.post("/signup", authController.signup_post);
router.get("/login", authController.login_get);
router.post("/login", authController.login_post);
router.get("/logout", authController.logout_get);

module.exports = router;
