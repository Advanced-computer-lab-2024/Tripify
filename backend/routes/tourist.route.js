import express from "express";
import {
  registerTourist,
  loginTourist,
  getTouristProfile,
  updateTouristProfile,
  getAllTourists,
  addToWallet,
  deductFromWallet,
  refundToWallet,
  getLoyaltyStatus,
  redeemLoyaltyPoints,
  rateTourGuide,
  changePassword,
  checkDeletionEligibility,
  deleteTouristAccount,
  bookmarkEvent,
  getSavedEvents,
  removeBookmark,
  addDeliveryAddress,
  getDeliveryAddresses,
  updateDeliveryAddress,
  deleteDeliveryAddress,
  setDefaultAddress
} from "../controllers/tourist.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerTourist);
router.post("/login", loginTourist);
router.get("/", getAllTourists);

// Protected routes (requires authentication)
router.get("/profile/:username", authMiddleware, getTouristProfile);
router.put("/profile/:username", authMiddleware, updateTouristProfile);
router.get("/profile/:username", authMiddleware, getLoyaltyStatus);

router.put("/change-password", authMiddleware, changePassword);
// Loyalty routes
router.get("/loyalty/:id", authMiddleware, getLoyaltyStatus);
router.post("/loyalty/redeem/:id", authMiddleware, redeemLoyaltyPoints);

// Wallet routes
router.post("/wallet/add/:id", authMiddleware, addToWallet);
router.post("/wallet/deduct/:id", authMiddleware, deductFromWallet);
router.post("/wallet/refund/:id", authMiddleware, refundToWallet);

// Rate tour guide route
router.post("/rate-guide/:tourGuideId", authMiddleware, rateTourGuide);

router.get("/check-deletion/:id", authMiddleware, checkDeletionEligibility);
router.delete("/delete/:id", authMiddleware, deleteTouristAccount);

router.post('/bookmark-event', authMiddleware, bookmarkEvent);
router.get('/saved-events', authMiddleware, getSavedEvents);
router.delete('/bookmark/:eventId', authMiddleware, removeBookmark);

// Delivery address routes
router.post('/address', authMiddleware, addDeliveryAddress);
router.get('/addresses', authMiddleware, getDeliveryAddresses);
router.put('/address/:addressId', authMiddleware, updateDeliveryAddress);
router.delete('/address/:addressId', authMiddleware, deleteDeliveryAddress);
router.patch('/address/:addressId/set-default', authMiddleware, setDefaultAddress);

export default router;
