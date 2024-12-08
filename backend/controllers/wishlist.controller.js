import Wishlist from '../models/wishlist.model.js';

// controllers/wishlistController.js
export const wishlistController = {
    // Add product to wishlist
    addToWishlist: async (req, res) => {
      try {
        const { userId, productId } = req.body;
        
        let wishlist = await Wishlist.findOne({ user: userId });
        
        if (!wishlist) {
          wishlist = new Wishlist({
            user: userId,
            products: []
          });
        }
  
        // Check if product already exists in wishlist
        if (wishlist.products.some(item => item.productId.toString() === productId)) {
          return res.status(400).json({ message: 'Product already in wishlist' });
        }
  
        wishlist.products.push({ productId });
        await wishlist.save();
  
        res.status(200).json({
          message: 'Product added to wishlist',
          wishlist
        });
      } catch (error) {
        res.status(500).json({
          message: 'Error adding product to wishlist',
          error: error.message
        });
      }
    },
  
    // Remove product from wishlist
    removeFromWishlist: async (req, res) => {
      try {
        const { userId, productId } = req.params;
        
        const wishlist = await Wishlist.findOne({ user: userId });
        
        if (!wishlist) {
          return res.status(404).json({ message: 'Wishlist not found' });
        }
  
        wishlist.products = wishlist.products.filter(
          item => item.productId.toString() !== productId
        );
  
        await wishlist.save();
  
        res.status(200).json({
          message: 'Product removed from wishlist',
          wishlist
        });
      } catch (error) {
        res.status(500).json({
          message: 'Error removing product from wishlist',
          error: error.message
        });
      }
    },
  
    // Get user's wishlist
    getWishlist: async (req, res) => {
      try {
        const { userId } = req.params;
        
        const wishlist = await Wishlist.findOne({ user: userId })
          .populate('products.productId')
          .exec();
        
        if (!wishlist) {
          return res.status(404).json({ message: 'Wishlist not found' });
        }
  
        res.status(200).json({ wishlist });
      } catch (error) {
        res.status(500).json({
          message: 'Error fetching wishlist',
          error: error.message
        });
      }
    }
  };