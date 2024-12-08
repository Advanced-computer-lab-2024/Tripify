// controllers/wishlist.controller.js
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import HistoricalPlace from '../models/HistoricalPlace.js';
import Activity from '../models/Activity.js';
import Itinerary from '../models/Itinerary.js';

const models = {
  Product,
  HistoricalPlace,
  Activity,
  Itinerary
};

export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    // Populate items with their full details
    const populatedItems = await Promise.all(
      wishlist.items.map(async (item) => {
        const Model = models[item.itemType];
        const itemDetails = await Model.findById(item.itemId);
        return {
          ...item.toObject(),
          details: itemDetails
        };
      })
    );

    res.json({
      success: true,
      data: {
        ...wishlist.toObject(),
        items: populatedItems
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { itemId, itemType } = req.body;

    // Validate item exists
    const Model = models[itemType];
    const item = await Model.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, items: [] });
    }

    // Check if item already exists in wishlist
    const exists = wishlist.items.some(
      item => item.itemId.toString() === itemId && item.itemType === itemType
    );

    if (!exists) {
      wishlist.items.push({ itemId, itemType });
      await wishlist.save();
    }

    res.json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { itemId, itemType } = req.params;
    
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter(
      item => !(item.itemId.toString() === itemId && item.itemType === itemType)
    );

    await wishlist.save();
    res.json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};