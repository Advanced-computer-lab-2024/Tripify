import mongoose from "mongoose";
import Product from "../models/product.model.js";
import fs from "fs";
import ProductPurchase from "../models/productPurchase.model.js";
import Tourist from "../models/tourist.model.js";

import PromoCode from "../models/promoCode.model.js";

const exchangeRates = {
  EGP: 49.1,
  SAR: 3.75,
  AED: 3.67,
  USD: 1,
};

export const addProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, seller } = req.body;

    if (!req.files || !req.files.productImage) {
      return res.status(400).json({
        message: "Product image is required",
        details: { productImage: !req.files?.productImage },
      });
    }

    const imageData = req.files.productImage.map((file) => ({
      filename: file.filename,
      path: `http://localhost:5000/uploads/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
      uploadDate: new Date(),
    }));

    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      totalSales: 0, // Initialize totalSales as 0
      seller,
      productImage: imageData,
    });

    await newProduct.save();

    const productWithPrices = {
      ...newProduct.toObject(),
      priceInEGP: (newProduct.price * exchangeRates.EGP).toFixed(2),
      priceInSAR: (newProduct.price * exchangeRates.SAR).toFixed(2),
      priceInAED: (newProduct.price * exchangeRates.AED).toFixed(2),
    };

    res.status(201).json({
      message: "Product added successfully",
      product: productWithPrices,
    });
  } catch (error) {
    if (req.files) {
      Object.values(req.files).forEach((fileArray) => {
        fileArray.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error("Error deleting file:", error);
          }
        });
      });
    }
    res
      .status(500)
      .json({ message: "Failed to add product", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.files && req.files.productImage) {
      const imageData = req.files.productImage.map((file) => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadDate: new Date(),
      }));
      updatedData.productImage = imageData;

      const oldProduct = await Product.findById(id);
      if (oldProduct && oldProduct.productImage) {
        oldProduct.productImage.forEach((image) => {
          try {
            fs.unlinkSync(image.path);
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    const productWithPrices = {
      ...updatedProduct.toObject(),
      priceInEGP: (updatedProduct.price * exchangeRates.EGP).toFixed(2),
      priceInSAR: (updatedProduct.price * exchangeRates.SAR).toFixed(2),
      priceInAED: (updatedProduct.price * exchangeRates.AED).toFixed(2),
    };

    res.status(200).json({
      message: "Product updated successfully",
      product: productWithPrices,
    });
  } catch (error) {
    if (req.files) {
      Object.values(req.files).forEach((fileArray) => {
        fileArray.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error("Error deleting file:", error);
          }
        });
      });
    }
    res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.productImage) {
      product.productImage.forEach((image) => {
        try {
          fs.unlinkSync(image.path);
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      });
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const productsWithPricesInMultipleCurrencies = products.map((product) => ({
      ...product.toObject(),
      priceInEGP: (product.price * exchangeRates.EGP).toFixed(2),
      priceInSAR: (product.price * exchangeRates.SAR).toFixed(2),
      priceInAED: (product.price * exchangeRates.AED).toFixed(2),
    }));
    res.status(200).json({ products: productsWithPricesInMultipleCurrencies });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

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

// In product.controller.js, modify the purchaseProduct function:
export const purchaseProduct = async (req, res) => {
  try {
    const { userId, productId, quantity, promoCode } = req.body; // Add promoCode to destructuring

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check stock availability
    if (product.quantity < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient stock" });
    }

    // Get user data
    const tourist = await Tourist.findById(userId);
    if (!tourist) {
      return res
        .status(404)
        .json({ success: false, message: "Tourist not found" });
    }

    // Calculate initial total price
    let totalPrice = product.price * quantity;

    // Apply promo code if provided
    if (promoCode) {
      const promoCodeDoc = await PromoCode.findOne({ code: promoCode });
      if (promoCodeDoc && promoCodeDoc.isValid()) {
        // Calculate discount
        const discount = (totalPrice * promoCodeDoc.discount) / 100;
        totalPrice -= discount;

        // Update promo code usage
        promoCodeDoc.usedCount += 1;
        await promoCodeDoc.save();
      }
    }

    // Check wallet balance
    if (tourist.wallet < totalPrice) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient wallet balance" });
    }

    // Create purchase record
    const purchase = new ProductPurchase({
      userId,
      productId,
      quantity,
      totalPrice,
      promoCode: promoCode || null, // Store the used promo code
    });

    // Update product quantity and increment totalSales
    product.quantity -= quantity;
    product.totalSales = (product.totalSales || 0) + quantity;
    await product.save();

    // Update user wallet
    tourist.wallet -= totalPrice;
    await tourist.save();

    await purchase.save();

    res.status(200).json({
      success: true,
      message: "Purchase successful",
      data: {
        purchase,
        newBalance: tourist.wallet,
      },
    });
  } catch (error) {
    console.error("Purchase error:", error); // Add better error logging
    res.status(500).json({
      success: false,
      message: "Failed to complete purchase",
      error: error.message,
    });
  }
};
export const getUserPurchases = async (req, res) => {
  try {
    const { userId } = req.params;
    const purchases = await ProductPurchase.find({ userId })
      .populate("productId")
      .sort({ purchaseDate: -1 });

    res.status(200).json({ success: true, data: purchases });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchases",
      error: error.message,
    });
  }
};

export const addPurchaseReview = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { rating, comment } = req.body;

    const purchase = await ProductPurchase.findById(purchaseId);
    if (!purchase) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }

    purchase.review = {
      rating,
      comment,
      date: new Date(),
    };

    await purchase.save();

    res.status(200).json({ success: true, data: purchase });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: error.message,
    });
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
    console.log("Starting getArchivedProducts controller");
    console.log("Query parameters:", req.query);

    // Extract pagination parameters with validation
    let page = 1;
    let limit = 10;

    try {
      if (req.query.page) {
        page = Math.max(1, parseInt(req.query.page));
      }
      if (req.query.limit) {
        limit = Math.max(1, Math.min(100, parseInt(req.query.limit)));
      }
    } catch (parseError) {
      console.log("Error parsing pagination parameters:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const skip = (page - 1) * limit;
    console.log("Pagination values:", { page, limit, skip });

    // Build query
    const query = { isArchived: true };
    console.log("Query object:", query);

    // Get total count
    const totalProducts = await Product.countDocuments(query);
    console.log("Total products count:", totalProducts);

    // Fetch archived products
    const archivedProducts = await Product.find(query)
      .select("-__v") // Exclude version key
      .populate({
        path: "reviewerName",
        select: "name",
        options: { strictPopulate: false }, // Make population less strict
      })
      .populate({
        path: "archivedBy",
        select: "name",
        options: { strictPopulate: false },
      })
      .skip(skip)
      .limit(limit)
      .sort({ archivedAt: -1 })
      .lean(); // Convert to plain JavaScript objects for better performance

    console.log("Retrieved products count:", archivedProducts.length);

    if (!archivedProducts.length) {
      return res.status(404).json({
        success: false,
        message: "No archived products found",
      });
    }

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      data: {
        products: archivedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Detailed error in getArchivedProducts:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Handle specific types of errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
        error: error.message,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// Update this in product.controller.js

export const getSellerSales = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate seller ID
    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required",
      });
    }

    // Get all purchases and populate product details
    const purchases = await ProductPurchase.find()
      .populate({
        path: "productId",
        match: { seller: "External seller" }, // Match products with seller type "External seller"
        select: "name price seller",
      })
      .populate("userId", "username")
      .sort({ purchaseDate: -1 });

    // Filter out purchases where productId is null (means product doesn't match seller criteria)
    const sellerPurchases = purchases.filter(
      (purchase) => purchase.productId !== null
    );

    // Calculate totals and format the data
    const salesData = sellerPurchases.map((purchase) => ({
      _id: purchase._id,
      purchaseDate: purchase.purchaseDate,
      productName: purchase.productId?.name || "Product Deleted",
      buyerName: purchase.userId?.username || "User Deleted",
      quantity: purchase.quantity,
      totalPrice: purchase.totalPrice,
      grossAmount: purchase.totalPrice,
      appFee: purchase.totalPrice * 0.1,
      netAmount: purchase.totalPrice * 0.9,
    }));

    res.status(200).json({
      success: true,
      data: salesData,
      message: "Sales data retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getSellerSales:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sales data",
      error: error.message,
    });
  }
};

// Add this to product.controller.js

export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { purchaseId } = req.params;
    const purchase = await ProductPurchase.findById(purchaseId).populate(
      "productId"
    );

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    // Check if order is already cancelled or delivered
    if (purchase.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    if (purchase.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a delivered order",
      });
    }

    // Get the tourist
    const tourist = await Tourist.findById(purchase.userId);
    if (!tourist) {
      return res.status(404).json({
        success: false,
        message: "Tourist not found",
      });
    }

    // Update product quantity
    const product = purchase.productId;
    product.quantity += purchase.quantity;
    await product.save({ session });

    // Update tourist wallet with refund
    tourist.wallet += purchase.totalPrice;
    await tourist.save({ session });

    // Update purchase status
    purchase.status = "cancelled";
    purchase.trackingUpdates.push({
      status: "cancelled",
      message: "Order has been cancelled and refunded",
      timestamp: new Date(),
    });
    await purchase.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        refundAmount: purchase.totalPrice,
        newWalletBalance: tourist.wallet,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

export const validatePromoCode = async (req, res) => {
  try {
    const { code, userId, amount } = req.body;

    if (!code || !userId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Find the promo code
    const promoCode = await PromoCode.findOne({ code });

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: "Invalid promo code",
      });
    }

    // Check if promo code is active
    if (!promoCode.isActive) {
      return res.status(400).json({
        success: false,
        message: "This promo code is no longer active",
      });
    }

    // Check expiry
    const now = new Date();
    if (promoCode.expiryDate < now) {
      return res.status(400).json({
        success: false,
        message: "This promo code has expired",
      });
    }

    // Check usage limit
    if (promoCode.usedCount >= promoCode.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "This promo code has reached its usage limit",
      });
    }

    // For birthday promos, verify it belongs to the user
    if (promoCode.type === "BIRTHDAY") {
      if (promoCode.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "This birthday promo code is not valid for your account",
        });
      }

      // Verify it's within the user's birthday month
      const tourist = await Tourist.findById(userId);
      const birthday = new Date(tourist.dob);
      const currentMonth = new Date().getMonth();

      if (birthday.getMonth() !== currentMonth) {
        return res.status(400).json({
          success: false,
          message:
            "Birthday promo codes are only valid during your birthday month",
        });
      }
    }

    // Calculate discount
    const discountAmount = (amount * promoCode.discount) / 100;

    res.status(200).json({
      success: true,
      discount: promoCode.discount,
      discountedAmount: discountAmount,
      finalAmount: amount - discountAmount,
      message: "Promo code applied successfully",
    });
  } catch (error) {
    console.error("Promo code validation error:", error);
    res.status(500).json({
      success: false,
      message: "Error validating promo code",
      error: error.message,
    });
  }
};
