const express = require("express");
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require("./productController");

// CREATE
router.post("/", createProduct);

// READ
router.get("/", getAllProducts);

module.exports = router;
