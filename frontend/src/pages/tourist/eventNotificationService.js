// services/eventNotificationService.js
import axios from "axios";

export const requestEventNotification = async (eventId, eventType, userId) => {
  try {
    // Create a notification request
    const response = await axios.post(
      "http://localhost:5000/api/notifications",
      {
        recipients: [
          {
            userId: userId,
            userType: "Tourist",
          },
        ],
        title: "Event Booking Available!",
        message: `The event you're interested in is now accepting bookings!`,
        type: "BOOKING_REMINDER",
        priority: "high",
        link: `/tourist/view-events?type=${eventType}&id=${eventId}`,
        // Simulate random delay between 5-30 seconds
        expiresAt: new Date(
          Date.now() + Math.floor(Math.random() * (30000 - 5000) + 5000)
        ),
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error requesting event notification:", error);
    throw error;
  }
};
