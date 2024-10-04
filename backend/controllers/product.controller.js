// backend/controllers/product.controller.js
import mongoose from "mongoose";
import Product from "../models/product.model.js";

// Create a new product
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      quantity,
      imageUrl,
      seller,
      rating,
      review,
    } = req.body;

    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      imageUrl,
      seller,
      rating,
      review,
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add product", error: error.message });
  }
};

// Find all products
export const getProducts = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, minRating, maxRating } = req.query;
    let filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter.price.$lte = parseFloat(maxPrice);
      }
    }

    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) {
        filter.rating.$gte = parseFloat(minRating);
      }
      if (maxRating) {
        filter.rating.$lte = parseFloat(maxRating);
      }
    }

    const products = await Product.find(filter);

    res.status(200).json({ products });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

// Find a product by ID
export const findProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: error.message });
  }
};

// Update a product by ID
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
};
