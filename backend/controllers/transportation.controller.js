import Transportation from "../models/transportation.model.js";
import TransportationBooking from "../models/transportationBooking.model.js";

// Create a new transportation listing
export const createTransportation = async (req, res) => {
  try {
    const newTransportation = new Transportation({
      ...req.body,
      advertiserId: req.user._id,
    });

    await newTransportation.save();
    res.status(201).json(newTransportation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all transportation listings
export const getAllTransportation = async (req, res) => {
  try {
    const transportations = await Transportation.find()
      .populate("advertiserId", "companyName email")
      .sort("-createdAt");
    res.status(200).json(transportations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transportation by ID
export const getTransportationById = async (req, res) => {
  try {
    const transportation = await Transportation.findById(
      req.params.id
    ).populate("advertiserId", "companyName email");

    if (!transportation) {
      return res.status(404).json({ message: "Transportation not found" });
    }

    res.status(200).json(transportation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update transportation listing
// Update transportation listing
export const updateTransportation = async (req, res) => {
  try {
    console.log("Updating transportation:", req.params.id);
    console.log("Update data:", req.body);

    const transportation = await Transportation.findById(req.params.id);

    if (!transportation) {
      return res.status(404).json({ message: "Transportation not found" });
    }

    // Check if the user is the owner of the listing
    if (transportation.advertiserId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this listing" });
    }

    // Check if the transportation can be modified
    if (transportation.status === "booked" && req.body.status === "available") {
      const activeBooking = await TransportationBooking.findOne({
        transportationId: transportation._id,
        status: { $in: ["pending", "confirmed"] },
      });

      if (activeBooking) {
        return res.status(400).json({
          message:
            "Cannot change status to available while there are active bookings",
        });
      }
    }

    // Update fields
    const updatableFields = [
      "vehicleType",
      "model",
      "capacity",
      "price",
      "availabilityStart",
      "availabilityEnd",
      "pickupLocation",
      "dropoffLocation",
      "description",
      "features",
      "status",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        transportation[field] = req.body[field];
      }
    });

    const updatedTransportation = await transportation.save();
    console.log("Updated transportation:", updatedTransportation);

    res.status(200).json({
      message: "Transportation updated successfully",
      transportation: updatedTransportation,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      message: "Failed to update transportation",
      error: error.message,
    });
  }
};
// Book transportation
export const bookTransportation = async (req, res) => {
  try {
    const { transportationId, startDate, endDate, totalPrice } = req.body;
    const touristId = req.user._id;

    // Validate date strings
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    // Parse dates
    const bookingStart = new Date(startDate);
    const bookingEnd = new Date(endDate);

    // Validate parsed dates
    if (isNaN(bookingStart.getTime()) || isNaN(bookingEnd.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Validate date range
    if (bookingEnd <= bookingStart) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    // Check if transportation exists and is available
    const transportation = await Transportation.findById(transportationId);
    if (!transportation) {
      return res.status(404).json({ message: "Transportation not found" });
    }

    if (transportation.status !== "available") {
      return res
        .status(400)
        .json({ message: "Transportation is not available for booking" });
    }

    // Check date availability
    const transportationStart = new Date(transportation.availabilityStart);
    const transportationEnd = new Date(transportation.availabilityEnd);

    if (bookingStart < transportationStart || bookingEnd > transportationEnd) {
      return res.status(400).json({
        message: "Selected dates are outside the available booking period",
        availableStart: transportationStart,
        availableEnd: transportationEnd,
      });
    }

    // Verify the total price
    const days = Math.ceil((bookingEnd - bookingStart) / (1000 * 60 * 60 * 24));
    const calculatedPrice = days * transportation.price;

    if (Math.abs(calculatedPrice - totalPrice) > 0.01) {
      return res.status(400).json({
        message: "Price calculation mismatch",
        calculated: calculatedPrice,
        received: totalPrice,
      });
    }

    // Check for existing overlapping bookings
    const existingBooking = await TransportationBooking.findOne({
      transportationId,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          startDate: { $lte: bookingEnd },
          endDate: { $gte: bookingStart },
        },
      ],
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "Selected dates are already booked" });
    }

    // Create booking
    const newBooking = new TransportationBooking({
      transportationId,
      touristId,
      startDate: bookingStart,
      endDate: bookingEnd,
      totalPrice,
    });

    await newBooking.save();

    // Update transportation status
    transportation.status = "booked";
    await transportation.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

// Get tourist's bookings
export const getTouristBookings = async (req, res) => {
  try {
    const bookings = await TransportationBooking.find({
      touristId: req.user._id,
    })
      .populate("transportationId")
      .sort("-createdAt");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get advertiser's bookings
export const getAdvertiserBookings = async (req, res) => {
  try {
    const transportations = await Transportation.find({
      advertiserId: req.user._id,
    });
    const transportationIds = transportations.map((t) => t._id);

    const bookings = await TransportationBooking.find({
      transportationId: { $in: transportationIds },
    })
      .populate("transportationId")
      .populate("touristId", "username email")
      .sort("-createdAt");

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await TransportationBooking.findById(
      req.params.id
    ).populate("transportationId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check authorization
    const transportation = booking.transportationId;
    if (transportation.advertiserId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this booking" });
    }

    booking.status = status;
    await booking.save();

    // Update transportation status if needed
    if (status === "cancelled") {
      transportation.status = "available";
      await transportation.save();
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get advertiser's transportation listings
export const getAdvertiserTransportations = async (req, res) => {
  try {
    // Log the user ID for debugging
    console.log("User ID:", req.user._id);

    // Fetch transportations where advertiserId matches the logged-in user's ID
    const transportations = await Transportation.find({
      advertiserId: req.user._id,
    })
      .populate("advertiserId", "username companyName email")
      .sort("-createdAt");

    console.log("Found transportations:", transportations);

    res.status(200).json(transportations);
  } catch (error) {
    console.error("Error in getAdvertiserTransportations:", error);
    res.status(500).json({
      message: "Failed to fetch transportation listings",
      error: error.message,
    });
  }
};

// Delete transportation listing
// Delete transportation listing
export const deleteTransportation = async (req, res) => {
  try {
    console.log("Deleting transportation with ID:", req.params.id);
    console.log("User ID:", req.user._id);

    const transportation = await Transportation.findById(req.params.id);

    if (!transportation) {
      console.log("Transportation not found");
      return res.status(404).json({ message: "Transportation not found" });
    }

    // Check if the user is the owner of the listing
    if (transportation.advertiserId.toString() !== req.user._id.toString()) {
      console.log("Authorization failed:", {
        transportationAdvertiserId: transportation.advertiserId,
        requestUserId: req.user._id,
      });
      return res
        .status(403)
        .json({ message: "Not authorized to delete this listing" });
    }

    // Delete the transportation
    const result = await Transportation.findByIdAndDelete(req.params.id);
    console.log("Delete result:", result);

    if (result) {
      res
        .status(200)
        .json({ message: "Transportation listing deleted successfully" });
    } else {
      res.status(404).json({ message: "Transportation not found" });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      message: "Failed to delete transportation listing",
      error: error.message,
    });
  }
};
