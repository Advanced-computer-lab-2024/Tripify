import mongoose from "mongoose";
import Product from "../models/product.model.js";
import fs from "fs";
import ProductPurchase from "../models/productPurchase.model.js";
import Tourist from "../models/tourist.model.js";
import sendEmail from '../utils/sendEmail.js';

import PromoCode from "../models/promoCode.model.js";

const exchangeRates = {
  EGP: 49.1,
  SAR: 3.75,
  AED: 3.67,
  USD: 1,
};

export const addProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, userId, userType, merchantEmail } = req.body;

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
      totalSales: 0,
      merchantEmail, // Add merchantEmail here
      createdBy: {
        user: userId,
        userType: userType
      },
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
    res.status(500).json({ message: "Failed to add product", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, quantity, merchantEmail } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Create update object with only the fields that are provided
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (quantity) updateData.quantity = quantity;
    if (merchantEmail) updateData.merchantEmail = merchantEmail;

    if (req.files && req.files.productImage) {
      const imageData = req.files.productImage.map((file) => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadDate: new Date(),
      }));
      updateData.productImage = imageData;

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

    const updatedProduct = await Product.findByIdAndUpdate(
      id, 
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

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
    res.status(500).json({ 
      message: "Failed to update product", 
      error: error.message 
    });
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
  const { _id: userId, role: userType } = req.user;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If user is a seller, they can only archive their own products
    // If user is an admin, they can archive any product
    if (userType === 'Seller' && 
        product.createdBy.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You don't have permission to archive this product",
      });
    }

    product.isArchived = isArchived;
    product.archivedAt = isArchived ? new Date() : null;
    product.archivedBy = userId;
    
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
    // Log incoming request details
    console.log("Fetching archived products for user:", req.user);
    console.log("User role:", req.headers['user-role']);

    const query = { isArchived: true };
    const products = await Product.find(query)
      .sort({ archivedAt: -1 })
      .lean();

    console.log("Found products:", products.length);

    return res.status(200).json({
      success: true,
      data: {
        products,
        total: products.length
      }
    });
  } catch (error) {
    console.error("GetArchivedProducts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch archived products",
      error: error.message
    });
  }
};

// Update this in product.controller.js

export const getSellerSales = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { startDate, endDate } = req.query;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required",
      });
    }

    const purchases = await ProductPurchase.find()
      .populate({
        path: "productId",
        match: { 
          'createdBy.user': sellerId,
          'createdBy.userType': 'Seller'
        },
        select: 'name price createdBy'
      })
      .populate("userId", "username")
      .sort({ purchaseDate: -1 });

    const sellerPurchases = purchases.filter(
      (purchase) => purchase.productId !== null
    );

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

// In your notifications.controller.js or similar


export const sendStockAlert = async (req, res) => {
    try {
        const { merchantEmail, productName, productId } = req.body;

        if (!merchantEmail || !productName || !productId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const subject = "Product Stock Alert - Action Required";
        const text = `Your product "${productName}" is now out of stock.\n\nProduct ID: ${productId}\n\nPlease log in to your account to update the stock levels.`;
        const html = `
            <h2>Product Stock Alert</h2>
            <p>Your product <strong>"${productName}"</strong> is now out of stock.</p>
            <p><strong>Product ID:</strong> ${productId}</p>
            <p>Please log in to your account to update the stock levels.</p>
            <br>
            <p>Best regards,</p>
            <p>Your Tripify Team</p>
        `;

        await sendEmail(merchantEmail, subject, text, html);

        res.status(200).json({
            success: true,
            message: "Stock alert email sent successfully"
        });
    } catch (error) {
        console.error("Error sending stock alert:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send stock alert email",
            error: error.message
        });
    }
};

export const getAllPurchases = async (req, res) => {
  try {
      const purchases = await ProductPurchase.find()
          .populate("productId")
          .sort({ purchaseDate: -1 });
          
      return res.status(200).json({ 
          success: true, 
          data: purchases 
      });
      
  } catch (error) {
      console.error('Error in getAllPurchases:', error);
      return res.status(500).json({
          success: false,
          message: "Failed to fetch all purchases",
          error: error.message,
      });
  }
};