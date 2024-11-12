import Product from "../models/product.model.js";
import Tourist from "../models/tourist.model.js"; // Make sure this path is correct
import ProductPurchase from "../models/productPurchase.model.js";
import mongoose from "mongoose";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Define exchange rates
const exchangeRates = {
  EGP: 49.1,
  SAR: 3.75,
  AED: 3.67,
  USD: 1,
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
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add product", error: error.message });
  }
};

export const getProductsForTourists = async (req, res) => {
  try {
    const products = await Product.find({ isArchived: false }).sort({
      createdAt: -1,
    });
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

// Find all products with prices in multiple currencies
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const productsWithPricesInMultipleCurrencies = products.map((product) => {
      return {
        ...product.toObject(),
        priceInEGP: (product.price * exchangeRates.EGP).toFixed(2),
        priceInSAR: (product.price * exchangeRates.SAR).toFixed(2),
        priceInAED: (product.price * exchangeRates.AED).toFixed(2),
      };
    });
    res.status(200).json({ products: productsWithPricesInMultipleCurrencies });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

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
    if (userRole === "seller" && product.seller !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You don't have permission to archive this product",
      });
    }
    product.isArchived = isArchived;
    product.archivedAt = isArchived ? new Date() : null;
    product.archivedBy = req.user._id;
    await product.save();
    res.status(200).json({
      message: `Product ${isArchived ? "archived" : "unarchived"} successfully`,
      product,
    });
  } catch (error) {
    console.error("Error in toggleArchiveProduct:", error);
    res.status(500).json({
      message: "Error toggling product archive status",
      error: error.message,
    });
  }
};
export const getArchivedProducts = async (req, res) => {
  try {
    const userRole = req.user.role;
    let query = { isArchived: true };
    // If seller, only show their archived products
    if (userRole === "seller") {
      query.seller = req.user._id;
    }
    const archivedProducts = await Product.find(query).sort({ archivedAt: -1 });
    res.status(200).json(archivedProducts);
  } catch (error) {
    console.error("Error in getArchivedProducts:", error);
    res.status(500).json({
      message: "Error fetching archived products",
      error: error.message,
    });
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

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

// Add a review to a product
export const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewerName, rating, comment } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newReview = {
      reviewerName,
      rating,
      comment,
    };

    product.reviews.push(newReview);
    await product.save();

    res.status(201).json({
      message: "Review added successfully",
      product: product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add review", error: error.message });
  }
};

export const purchaseProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, productId, quantity } = req.body;

    // Validate inputs
    if (!userId || !productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if userId is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Find product first
    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.quantity < quantity) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Insufficient product quantity",
      });
    }

    const totalPrice = product.price * quantity;

    // Find tourist with error handling
    let tourist;
    try {
      tourist = await Tourist.findById(userId).session(session);
      if (!tourist) {
        throw new Error("Tourist not found");
      }
    } catch (error) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Tourist not found",
      });
    }

    if (tourist.wallet < totalPrice) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    // Create purchase record
    const purchase = new ProductPurchase({
      userId,
      productId,
      quantity,
      totalPrice,
      status: "completed",
    });
    await purchase.save({ session });

    // Update product quantity
    product.quantity -= quantity;
    product.totalSales = (product.totalSales || 0) + quantity;
    await product.save({ session });

    // Update tourist wallet
    tourist.wallet -= totalPrice;
    await tourist.save({ session });

    await session.commitTransaction();

    // Send response
    res.status(200).json({
      success: true,
      message: "Purchase successful",
      data: {
        purchase,
        newBalance: tourist.wallet,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Purchase error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error processing purchase",
    });
  } finally {
    session.endSession();
  }
};
export const getTouristPurchases = async (req, res) => {
  try {
    const { touristId } = req.params;

    const purchases = await ProductPurchase.find({ userId: touristId })
      .populate("productId")
      .sort("-purchaseDate");

    res.status(200).json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching purchases",
    });
  }
};

export const reviewPurchase = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { rating, comment } = req.body;

    const purchase = await ProductPurchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    if (purchase.review?.rating) {
      return res.status(400).json({
        success: false,
        message: "Purchase already reviewed",
      });
    }

    purchase.review = {
      rating,
      comment,
      date: new Date(),
    };

    await purchase.save();

    // Update product's reviews as well
    const product = await Product.findById(purchase.productId);
    if (product) {
      product.reviews.push({
        reviewerName: purchase.userId,
        rating,
        comment,
        timestamp: new Date(),
      });
      await product.save();
    }

    res.status(200).json({
      success: true,
      message: "Review submitted successfully",
      data: purchase,
    });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error submitting review",
    });
  }
};
