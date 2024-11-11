import mongoose from "mongoose";
import Product from "../models/product.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Define exchange rates
const exchangeRates = {
  EGP: 49.10,
  SAR: 3.75,
  AED: 3.67,
  USD: 1,
};

// Archive/Unarchive Product
export const toggleArchiveProduct = async (req, res) => {
  const { productId } = req.params;
  const { isArchived } = req.body;
  const userRole = req.user.role;

  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check permissions
    if (userRole === 'seller' && product.seller !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "You don't have permission to archive this product" 
      });
    }

    product.isArchived = isArchived;
    product.archivedAt = isArchived ? new Date() : null;
    product.archivedBy = req.user._id;

    await product.save();

    res.status(200).json({
      message: `Product ${isArchived ? 'archived' : 'unarchived'} successfully`,
      product
    });
  } catch (error) {
    console.error('Error in toggleArchiveProduct:', error);
    res.status(500).json({ 
      message: "Error toggling product archive status", 
      error: error.message 
    });
  }
};

export const getArchivedProducts = async (req, res) => {
  try {
    const userRole = req.user.role;
    let query = { isArchived: true };

    // If seller, only show their archived products
    if (userRole === 'seller') {
      query.seller = req.user._id;
    }

    const archivedProducts = await Product.find(query)
      .sort({ archivedAt: -1 });

    res.status(200).json(archivedProducts);
  } catch (error) {
    console.error('Error in getArchivedProducts:', error);
    res.status(500).json({ 
      message: "Error fetching archived products", 
      error: error.message 
    });
  }
};
// Create a new product
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, imageUrl, seller } = req.body;
    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      totalSales: 0, // Initialize total sales to 0
      imageUrl,
      seller,
    });
    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to add product", error: error.message });
  }
};

// Find all products with prices in multiple currencies (Excludes archived products by default)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isArchived: { $ne: true } }).sort({ createdAt: -1 });
    const productsWithPricesInMultipleCurrencies = products.map(product => ({
      ...product.toObject(),
      priceInEGP: (product.price * exchangeRates.EGP).toFixed(2),
      priceInSAR: (product.price * exchangeRates.SAR).toFixed(2),
      priceInAED: (product.price * exchangeRates.AED).toFixed(2),
    }));
    res.status(200).json({ products: productsWithPricesInMultipleCurrencies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Products for Tourists (only non-archived products)
export const getProductsForTourists = async (req, res) => {
  try {
    const products = await Product.find({ isArchived: false }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Products (Admin/Seller views showing archived status)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const productWithPrices = {
      ...product.toObject(),
      priceInEGP: (product.price * exchangeRates.EGP).toFixed(2),
      priceInSAR: (product.price * exchangeRates.SAR).toFixed(2),
      priceInAED: (product.price * exchangeRates.AED).toFixed(2),
    };
    res.status(200).json(productWithPrices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

// Update a product by ID
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error: error.message });
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
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};

// Add a review to a product
export const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewerName, rating, comment } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newReview = { reviewerName, rating, comment };
    product.reviews.push(newReview);
    await product.save();

    res.status(201).json({
      message: "Review added successfully",
      product: product,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add review", error: error.message });
  }
};
