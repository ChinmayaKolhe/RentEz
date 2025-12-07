import cron from 'node-cron';
import RentPayment from '../models/RentPayment.js';
import { sendRentReminder } from './emailService.js';

// Run every day at 9:00 AM to check for upcoming rent payments
export const initRentReminderCron = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 Running rent reminder cron job...');

    try {
      const today = new Date();
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);

      // Find pending payments due within 3 days
      const upcomingPayments = await RentPayment.find({
        status: { $in: ['pending', 'overdue'] },
        dueDate: {
          $gte: today,
          $lte: threeDaysFromNow,
        },
      })
        .populate('tenant', 'name email')
        .populate('property', 'title address')
        .populate('owner', 'name email');

      console.log(`Found ${upcomingPayments.length} upcoming payments`);

      // Send reminder emails
      for (const payment of upcomingPayments) {
        try {
          await sendRentReminder(payment.tenant, payment.property, payment);
          console.log(`✅ Reminder sent to ${payment.tenant.email}`);
        } catch (error) {
          console.error(`❌ Failed to send reminder to ${payment.tenant.email}:`, error);
        }
      }

      console.log('✅ Rent reminder cron job completed');
    } catch (error) {
      console.error('❌ Error in rent reminder cron job:', error);
    }
  });

  console.log('✅ Rent reminder cron job initialized (runs daily at 9:00 AM)');
};

// Run every day at midnight to update overdue payments
export const initOverduePaymentCron = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('🔔 Running overdue payment update cron job...');

    try {
      const today = new Date();

      // Update pending payments that are past due date to overdue
      const result = await RentPayment.updateMany(
        {
          status: 'pending',
          dueDate: { $lt: today },
        },
        {
          status: 'overdue',
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} payments to overdue status`);
    } catch (error) {
      console.error('❌ Error in overdue payment cron job:', error);
    }
  });

  console.log('✅ Overdue payment cron job initialized (runs daily at midnight)');
};

// Initialize all cron jobs
export const initCronJobs = () => {
  initRentReminderCron();
  initOverduePaymentCron();
};
