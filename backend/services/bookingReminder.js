// bookingReminder.js
import Notification from '../models/notification.model.js';
import Booking from '../models/booking.model.js';
import Tourist from '../models/tourist.model.js';
import sendEmail from '../utils/sendEmail.js';

export const runBookingNotificationCheck = async () => {
  try {
    console.log('Running booking notification check for confirmed bookings...');
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const upcomingBookings = await Booking.find({
      bookingDate: {
        $gte: tomorrow,
        $lte: tomorrowEnd
      },
      status: 'confirmed',
      notificationSent: { $ne: true }
    });

    console.log(`Found ${upcomingBookings.length} confirmed upcoming bookings to send notifications for`);

    for (const booking of upcomingBookings) {
      try {
        const tourist = await Tourist.findById(booking.userId);
        
        if (!tourist || !tourist.email) {
          console.log(`No valid email found for user ID: ${booking.userId}`);
          continue;
        }

        const formattedDate = new Date(booking.bookingDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        // Send email
        const emailHtml = `
          <h2>Reminder: Your Confirmed Booking</h2>
          <p>Hello ${tourist.name || 'Valued Customer'},</p>
          <p>This is a reminder about your confirmed booking tomorrow:</p>
          <ul>
            <li><strong>Event:</strong> ${booking.itemId?.name || 'N/A'}</li>
            <li><strong>Type:</strong> ${booking.bookingType}</li>
            <li><strong>Date & Time:</strong> ${formattedDate}</li>
            <li><strong>Booking ID:</strong> ${booking._id}</li>
          </ul>
          <p>Please make sure to arrive on time.</p>
          <p>Thank you for choosing our service!</p>
        `;

        await sendEmail(
          tourist.email,
          'Reminder: Your Confirmed Booking Tomorrow',
          'You have a confirmed booking tomorrow. Please check your email for details.',
          emailHtml
        );

        // Create in-app notification using the Notification model directly
        const notification = new Notification({
          recipient: {
            userId: tourist._id,
            userType: 'Tourist'
          },
          title: '🗓️ Booking Reminder',
          message: `Reminder: You have a confirmed ${booking.bookingType} booking tomorrow at ${formattedDate}`,
          type: 'BOOKING_REMINDER',
          priority: 'high',
          relatedId: booking._id,
          relatedModel: 'Booking',
          link: `/bookings/${booking._id}`
        });
        await notification.save();

        // Mark notification as sent
        await Booking.findByIdAndUpdate(booking._id, { notificationSent: true });
        
        console.log(`Notification sent for confirmed booking ${booking._id} to ${tourist.email}`);
      } catch (error) {
        console.error(`Error sending notification for booking ${booking._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in notification check:', error);
  }
};