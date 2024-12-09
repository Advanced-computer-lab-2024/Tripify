import cron from 'node-cron';
import { checkAndSendBirthdayPromos } from './birthdayPromo.service.js';

// Run every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running birthday promo job...');
  try {
    await checkAndSendBirthdayPromos();
    console.log('Birthday promo job completed successfully');
  } catch (error) {
    console.error('Birthday promo job failed:', error);
  }
});