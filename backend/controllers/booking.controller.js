import Booking from '../models/booking.model.js';
import Activity from '../models/activity.model.js';
import HistoricalPlace from '../models/histroicalplace.model.js';
import Itinerary from '../models/itinerary.model.js';

const validateBookingDate = async (eventItem, bookingType, requestedDate) => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  if (requestedDate < currentDate) {
    return {
      success: false,
      message: 'Cannot book for past dates',
    };
  }

  switch (bookingType) {
    case 'Activity':
      // For activities, check if the activity date matches the requested date
      const activityDate = new Date(eventItem.date);
      activityDate.setHours(0, 0, 0, 0);
      
      if (requestedDate.getTime() !== activityDate.getTime()) {
        return {
          success: false,
          message: `This activity is only available on ${activityDate.toLocaleDateString()}`,
        };
      }
      break;

    case 'Itinerary':
      // For itineraries, check if the date is in availableDates
      const isAvailableDate = eventItem.availableDates?.some(dateObj => {
        const availableDate = new Date(dateObj.date);
        availableDate.setHours(0, 0, 0, 0);
        return availableDate.getTime() === requestedDate.getTime();
      });

      // if (!isAvailableDate) {
      //   return {
      //     success: false,
      //     message: 'Selected date is not available for this itinerary',
      //   };
      // }
      break;

    case 'HistoricalPlace':
      // For historical places, check opening hours or specific available dates if needed
      break;
  }

  return { success: true };
};

export const bookingController = {
  // Create a new booking
  createBooking: async (req, res) => {
    try {
      const { userId, bookingType, itemId, bookingDate } = req.body;

      if (!userId || !bookingType || !itemId || !bookingDate) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      const requestedDate = new Date(bookingDate);
      requestedDate.setHours(0, 0, 0, 0);

      // Get the event/item details based on bookingType
      let eventItem;
      switch (bookingType) {
        case 'Activity':
          eventItem = await Activity.findById(itemId);
          break;
        case 'HistoricalPlace':
          eventItem = await HistoricalPlace.findById(itemId);
          break;
        case 'Itinerary':
          eventItem = await Itinerary.findById(itemId);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid booking type',
          });
      }

      if (!eventItem) {
        return res.status(404).json({
          success: false,
          message: 'Item not found',
        });
      }

      // Check if the requested date is valid for the event
      const isDateValid = await validateBookingDate(eventItem, bookingType, requestedDate);
      if (!isDateValid.success) {
        return res.status(400).json({
          success: false,
          message: isDateValid.message,
        });
      }

      // Check for existing bookings on the same date
      const startDate = new Date(requestedDate);
      const endDate = new Date(requestedDate);
      endDate.setHours(23, 59, 59, 999);

      const existingBooking = await Booking.findOne({
        bookingType,
        itemId,
        bookingDate: {
          $gte: startDate,
          $lte: endDate,
        },
        status: { $ne: 'cancelled' },
      });

      if (existingBooking) {
        return res.status(400).json({
          success: false,
          message: 'This date is already booked',
        });
      }

      const booking = await Booking.create({
        userId,
        bookingType,
        itemId,
        bookingDate: requestedDate,
        status: 'confirmed',
      });

      res.status(201).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      console.error('Booking creation error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error creating booking',
      });
    }
  },

  // Get bookings by user ID
  getUserBookings: async (req, res) => {
    try {
      const { userId } = req.params;
      const bookings = await Booking.find({ userId })
        .populate('itemId')
        .sort('-bookingDate');

      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get upcoming bookings for a user
  getUpcomingBookings: async (req, res) => {
    try {
      const { userId } = req.params;
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const bookings = await Booking.find({
        userId,
        bookingDate: { $gte: currentDate },
        status: { $ne: 'cancelled' },
      })
        .populate('itemId')
        .sort('bookingDate');

      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get bookings for a specific item
  getItemBookings: async (req, res) => {
    try {
      const { bookingType, itemId } = req.params;
      const bookings = await Booking.find({
        bookingType,
        itemId,
        status: { $ne: 'cancelled' },
      })
        .sort('-bookingDate')
        .populate('userId', 'name email'); // Populate user details if needed

      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Update booking status
  updateBookingStatus: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { status } = req.body;

      if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value',
        });
      }

      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { status },
        { new: true }
      ).populate('itemId');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Cancel a booking
  cancelBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      
      const booking = await Booking.findById(bookingId);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }

      // Optional: Add cancellation policy checks here
      // For example, check if cancellation is allowed based on the booking date
      const currentDate = new Date();
      const bookingDate = new Date(booking.bookingDate);
      const timeDifference = bookingDate.getTime() - currentDate.getTime();
      const daysDifference = timeDifference / (1000 * 3600 * 24);

      if (daysDifference < 1) { // Example: Cannot cancel less than 24 hours before
        return res.status(400).json({
          success: false,
          message: 'Cancellation is not allowed less than 24 hours before the booking',
        });
      }

      booking.status = 'cancelled';
      await booking.save();

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Check if a date is available for booking
  checkAvailability: async (req, res) => {
    try {
      const { bookingType, itemId, bookingDate } = req.query;

      if (!bookingType || !itemId || !bookingDate) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters',
        });
      }

      const requestedDate = new Date(bookingDate);
      requestedDate.setHours(0, 0, 0, 0);

      // Get the event/item details
      let eventItem;
      switch (bookingType) {
        case 'Activity':
          eventItem = await Activity.findById(itemId);
          break;
        case 'HistoricalPlace':
          eventItem = await HistoricalPlace.findById(itemId);
          break;
        case 'Itinerary':
          eventItem = await Itinerary.findById(itemId);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid booking type',
          });
      }

      if (!eventItem) {
        return res.status(404).json({
          success: false,
          message: 'Item not found',
        });
      }

      // Validate the date against event dates
      const dateValidation = await validateBookingDate(eventItem, bookingType, requestedDate);
      if (!dateValidation.success) {
        return res.status(400).json({
          success: false,
          message: dateValidation.message,
          available: false,
        });
      }

      // Check for existing bookings
      const startDate = new Date(requestedDate);
      const endDate = new Date(requestedDate);
      endDate.setHours(23, 59, 59, 999);

      const existingBookings = await Booking.find({
        bookingType,
        itemId,
        bookingDate: {
          $gte: startDate,
          $lte: endDate,
        },
        status: { $ne: 'cancelled' },
      });

      res.status(200).json({
        success: true,
        available: existingBookings.length === 0,
        existingBookings: existingBookings.length,
      });
    } catch (error) {
      console.error('Availability check error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error checking availability',
      });
    }
  },
};