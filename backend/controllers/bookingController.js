import { dbQuery } from '../models/db-json-backup.js';

export const createBooking = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { serviceId, bookingDate, bookingTime, address, notes } = req.body;

    if (!serviceId || !bookingDate || !bookingTime || !address) {
      return res.status(400).json({ message: 'Missing required booking parameters' });
    }

    const service = dbQuery.findById('services', serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check duplicate booking (provider already booked for same date + slot)
    const activeConflicts = dbQuery.where('bookings', b => 
      b.provider_id === service.provider_id &&
      b.booking_date === bookingDate &&
      b.booking_time === bookingTime &&
      b.status !== 'cancelled'
    );

    if (activeConflicts.length > 0) {
      return res.status(400).json({ 
        message: 'This time slot has already been booked with this specialist. Please select another slot.' 
      });
    }

    const newBooking = dbQuery.insert('bookings', {
      customer_id: Number(customerId),
      provider_id: service.provider_id,
      service_id: Number(serviceId),
      booking_date: bookingDate,
      booking_time: bookingTime,
      address,
      notes: notes || '',
      status: 'pending',
      payment_status: 'pending',
      total_price: service.price
    });

    // Create Initial Payment Record
    dbQuery.insert('payments', {
      booking_id: newBooking.id,
      amount: newBooking.total_price,
      payment_method: 'Card', // Default placeholder, will edit on checkout
      payment_status: 'pending'
    });

    // Notify Provider (Find user_id of provider)
    const provider = dbQuery.findById('providers', service.provider_id);
    if (provider) {
      dbQuery.insert('notifications', {
        user_id: provider.user_id,
        title: 'New Service Request Received',
        message: `A client has requested "${service.title}" for ${bookingDate} at ${bookingTime}. Please review the order.`,
        is_read: false
      });
    }
    // Notify Admins
const admins = dbQuery.where('users', u => u.role_id === 3);

admins.forEach(admin => {
  dbQuery.insert('notifications', {
    user_id: admin.id,
    title: 'New Booking Created',
    message: `A new booking was created for "${service.title}".`,
    is_read: false
  });
});

    // Notify Customer
    dbQuery.insert('notifications', {
      user_id: customerId,
      title: 'Booking Order Received',
      message: `Your booking for "${service.title}" on ${bookingDate} is pending provider acceptance.`,
      is_read: false
    });

    res.status(201).json({
      message: 'Booking request sent successfully',
      bookingId: newBooking.id
    });

  } catch (error) {
    console.error('Create booking failed:', error);
    res.status(500).json({ message: 'Could not schedule booking request' });
  }
};

export const getCustomerBookings = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const bookings = dbQuery.getBookingsForCustomer(customerId);
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({ message: 'Error retrieving your booking orders' });
  }
};

export const getProviderBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const providers = dbQuery.where('providers', p => p.user_id === userId);
    if (providers.length === 0) {
      return res.status(404).json({ message: 'Service Provider profile not found' });
    }

    const bookings = dbQuery.getBookingsForProvider(providers[0].id);
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    res.status(500).json({ message: 'Error retrieving project work orders' });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookingId = req.params.id;
    const { action } = req.body; // 'accept', 'reject', 'complete'

    const booking = dbQuery.findById('bookings', bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking order not found' });
    }

    const providers = dbQuery.where('providers', p => p.user_id === userId);
    if (providers.length === 0 || providers[0].id !== booking.provider_id) {
      return res.status(403).json({ message: 'Unauthorized status modification' });
    }
    const allowedActions = ['accept', 'reject', 'complete'];

if (!allowedActions.includes(action)) {
  return res.status(400).json({
    message: 'Invalid action parameter',
    received: action
  });
}

const statusMap = {
  accept: 'accepted',
  reject: 'cancelled',
  complete: 'completed'
};

let nextStatus = statusMap[action];
let notifyMessage = '';
let isComplete = action === 'complete';

if (action === 'accept') {
  notifyMessage = 'Your service request has been ACCEPTED by the professional and scheduled!';
} else if (action === 'reject') {
  notifyMessage = 'Your service request was not accepted by the professional.';
} else if (action === 'complete') {
  notifyMessage = 'Your service has been marked as COMPLETED. Please leave a review!';
}
    const updatedBooking = dbQuery.update('bookings', bookingId, { status: nextStatus });

    // Handle completed job updates
    if (isComplete) {
      const providerObj = dbQuery.findById('providers', booking.provider_id);
      if (providerObj) {
        dbQuery.update('providers', providerObj.id, {
          completed_jobs: (providerObj.completed_jobs || 0) + 1
        });
      }
    }

    // Send Notification to client
    dbQuery.insert('notifications', {
      user_id: booking.customer_id,
      title: `Booking Update: Status is ${nextStatus.toUpperCase()}`,
      message: notifyMessage,
      is_read: false
    });
    const admins = dbQuery.where('users', u => u.role_id === 3);

admins.forEach(admin => {
  dbQuery.insert('notifications', {
    user_id: admin.id,
    title: 'Booking Status Changed',
    message: `Booking #${bookingId} changed to ${nextStatus}.`,
    is_read: false
  });
});

    res.status(200).json({
      message: `Booking order status updated to ${nextStatus}`,
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Failed to update booking status:', error);
    res.status(500).json({ message: 'Could not change booking status' });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookingId = req.params.id;

    const booking = dbQuery.findById('bookings', bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.customer_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Completed or cancelled bookings cannot be altered' });
    }

    const updated = dbQuery.update('bookings', bookingId, { status: 'cancelled' });

    // Notify Provider
    const provider = dbQuery.findById('providers', booking.provider_id);
    if (provider) {
      dbQuery.insert('notifications', {
        user_id: provider.user_id,
        title: 'Booking Cancelled',
        message: `The client cancelled the booking for ${booking.booking_date} at ${booking.booking_time}.`,
        is_read: false
      });
    }

    res.status(200).json({
      message: 'Booking successfully cancelled',
      booking: updated
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Failed to cancel the booking' });
  }
};

export const submitPayment = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { bookingId, paymentMethod, paymentDetails } = req.body;

    if (!bookingId || !paymentMethod) {
      return res.status(400).json({ message: 'Booking ID and payment method are required' });
    }

    const booking = dbQuery.findById('bookings', bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.customer_id !== customerId) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    // Find and update payment item
    const paymentList = dbQuery.where('payments', p => p.booking_id === Number(bookingId));
    if (paymentList.length > 0) {
  dbQuery.update('payments', paymentList[0].id, {
    payment_method: paymentMethod,
    payment_status: 'completed',
    transaction_ref: paymentDetails || `TXN-${Math.floor(Math.random() * 9000000) + 1000000}`
  });
}

dbQuery.update('bookings', bookingId, {
  payment_status: 'paid',
    status: 'confirmed'
});
    const admins = dbQuery.where('users', u => u.role_id === 3);

admins.forEach(admin => {
  dbQuery.insert('notifications', {
    user_id: admin.id,
    title: 'Payment Received',
    message: `Payment received for booking #${bookingId}.`,
    is_read: false
  });
});

    res.status(200).json({ message: 'Payment successfully processed! Your slot is confirmed.' });
  } catch (error) {
    console.error('Payment failure:', error);
    res.status(500).json({ message: 'Error processing secure checkout' });
  }
};

export const submitReview = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'Booking ID and star rating are required' });
    }

    const booking = dbQuery.findById('bookings', bookingId);
    if (!booking || booking.status !== 'completed') {
      return res.status(400).json({ message: 'You can only review fully completed bookings' });
    }

    if (booking.customer_id !== customerId) {
      return res.status(403).json({ message: 'Unauthorized activity' });
    }

    // Prevent duplicate reviews
    const existing = dbQuery.where('reviews', r => r.booking_id === Number(bookingId));
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this service appointment.' });
    }

    // Save review
    dbQuery.insert('reviews', {
      booking_id: Number(bookingId),
      customer_id: Number(customerId),
      provider_id: booking.provider_id,
      rating: Number(rating),
      comment: comment || ''
    });

    // Re-calculate provider average rating
    const providerReviews = dbQuery.where('reviews', r => r.provider_id === booking.provider_id);
    const avgScore = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;

    dbQuery.update('providers', booking.provider_id, {
     
      rating: Number(avgScore.toFixed(2))
    });
     

    // Notify Provider
    const provider = dbQuery.findById('providers', booking.provider_id);
    if (provider) {
      dbQuery.insert('notifications', {
        user_id: provider.user_id,
        title: 'New Client Review Received',
        message: `A client left a ${rating}-star review on your recent job. Check your services statistics.`,
        is_read: false
      });
    }

    res.status(201).json({ message: 'Review published successfully! Thank you for the rating.' });

  } catch (error) {
    console.error('Submit review failure:', error);
    res.status(500).json({ message: 'Could not publish review' });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
   const list = dbQuery.where('notifications', n => n.user_id === userId)
  .sort((a, b) => b.id - a.id);
    res.status(200).json({ notifications: list });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Could not load notifications' });
  }
};

export const markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const list = dbQuery.where('notifications', n => n.user_id === userId && !n.is_read);
    list.forEach(n => {
      dbQuery.update('notifications', n.id, { is_read: true });
    });
    res.status(200).json({ message: 'All messages marked as read.' });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    res.status(500).json({ message: 'Failed to read notification feed' });
  }
};
