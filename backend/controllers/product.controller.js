import mongoose from "mongoose";
import Product from "../models/product.model.js";
import fs from "fs";

const exchangeRates = {
  EGP: 49.10,
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
        details: { productImage: !req.files?.productImage }
      });
    }

    const imageData = req.files.productImage.map(file => ({
      filename: file.filename,
      path: `http://localhost:5000/uploads/${file.filename}`, // Add full URL
      mimetype: file.mimetype,
      size: file.size,
      uploadDate: new Date()
    }));

    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      totalSales: 0,
      seller,
      productImage: imageData
    });

    await newProduct.save();

    const productWithPrices = {
      ...newProduct.toObject(),
      priceInEGP: (newProduct.price * exchangeRates.EGP).toFixed(2),
      priceInSAR: (newProduct.price * exchangeRates.SAR).toFixed(2),
      priceInAED: (newProduct.price * exchangeRates.AED).toFixed(2)
    };

    res.status(201).json({ 
      message: "Product added successfully", 
      product: productWithPrices 
    });
  } catch (error) {
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        fileArray.forEach(file => {
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
    const updatedData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.files && req.files.productImage) {
      const imageData = req.files.productImage.map(file => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadDate: new Date()
      }));
      updatedData.productImage = imageData;

      const oldProduct = await Product.findById(id);
      if (oldProduct && oldProduct.productImage) {
        oldProduct.productImage.forEach(image => {
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
      priceInAED: (updatedProduct.price * exchangeRates.AED).toFixed(2)
    };

    res.status(200).json({
      message: "Product updated successfully",
      product: productWithPrices
    });
  } catch (error) {
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        fileArray.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error("Error deleting file:", error);
          }
        });
      });
    }
    res.status(500).json({ message: "Failed to update product", error: error.message });
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
      product.productImage.forEach(image => {
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
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const productsWithPricesInMultipleCurrencies = products.map(product => ({
      ...product.toObject(),
      priceInEGP: (product.price * exchangeRates.EGP).toFixed(2),
      priceInSAR: (product.price * exchangeRates.SAR).toFixed(2),
      priceInAED: (product.price * exchangeRates.AED).toFixed(2),
    }));
    res.status(200).json({ products: productsWithPricesInMultipleCurrencies });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
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
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
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
    res.status(500).json({ message: "Failed to add review", error: error.message });
  }
};