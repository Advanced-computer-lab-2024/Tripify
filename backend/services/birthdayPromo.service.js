import sendEmail from '../utils/sendEmail.js';
import PromoCode from '../models/promoCode.model.js';
import Tourist from '../models/tourist.model.js';
import Notification from '../models/notification.model.js';

const generateBirthdayPromoCode = (userId) => {
  const prefix = 'BDAY';
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${userId.toString().substring(0, 4)}-${randomString}`;
};

export const checkAndSendBirthdayPromos = async () => {
  try {
    const today = new Date();
    console.log('Checking for birthdays:', {
      month: today.getMonth() + 1,
      day: today.getDate()
    });

    // Updated query to use dob instead of birthDate
    const users = await Tourist.find({
      $expr: {
        $and: [
          { $eq: [{ $month: '$dob' }, today.getMonth() + 1] },
          { $eq: [{ $dayOfMonth: '$dob' }, today.getDate()] }
        ]
      }
    });

    console.log('Found users with birthdays:', users);

    const results = await Promise.all(users.map(createAndSendBirthdayPromo));
    return results;
  } catch (error) {
    console.error('Error processing birthday promos:', error);
    throw error;
  }
};

const createAndSendBirthdayPromo = async (user) => {
  try {
    console.log('Creating promo for user:', user);
    const code = generateBirthdayPromoCode(user._id);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    // Create promo code
    const newPromoCode = new PromoCode({
      code,
      discount: 20,
      expiryDate,
      usageLimit: 1,
      isActive: true,
      userId: user._id,
      type: 'BIRTHDAY'
    });
    await newPromoCode.save();

    // Send email
    const subject = '🎉 Happy Birthday from Tripify!';
    const text = `Happy Birthday! Here's your special 20% discount code: ${code}. Valid until ${expiryDate.toLocaleDateString()}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Happy Birthday! 🎂</h1>
        <p>To celebrate your special day, we're giving you a special 20% discount on Tripify!</p>
        <div style="background-color: #f8f8f8; padding: 15px; text-align: center; margin: 20px 0;">
          <h2 style="color: #e91e63;">Your Birthday Promo Code: ${code}</h2>
          <p>Valid until: ${expiryDate.toLocaleDateString()}</p>
        </div>
        <p>Use this code at checkout to receive your birthday discount.</p>
        <p>Have a wonderful birthday!</p>
        <p>Best regards,<br>The Tripify Team</p>
      </div>
    `;
    await sendEmail(user.email, subject, text, html);

    // Create in-app notification using the Notification model directly
    const notification = new Notification({
      recipient: {
        userId: user._id,
        userType: 'Tourist'
      },
      title: '🎉 Happy Birthday! Special Discount Inside',
      message: `Happy Birthday! We've sent a special 20% discount code to your email. Code: ${code} (Valid until ${expiryDate.toLocaleDateString()})`,
      type: 'SYSTEM_NOTIFICATION',
      priority: 'high',
      relatedId: newPromoCode._id,
      relatedModel: 'PromoCode',
      link: '/promotions'
    });
    await notification.save();

    return { success: true, user: user._id, promoCode: newPromoCode };
  } catch (error) {
    console.error(`Error creating birthday promo for user ${user._id}:`, error);
    return { success: false, user: user._id, error: error.message };
  }
};


