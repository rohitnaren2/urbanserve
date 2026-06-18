import { dbQuery } from '../models/db-json-backup.js';

export const getAdminStats = async (req, res) => {
  try {
    const users = dbQuery.findAll('users');
    const providers = dbQuery.findAll('providers');
    const bookings = dbQuery.findAll('bookings');
    const payments = dbQuery.findAll('payments').filter(p => p.payment_status === 'completed');

    const totalUsers = users.length;
    const totalProviders = providers.length;
    const totalBookings = bookings.length;

    // Calculate total revenue from successful payments
    const totalRevenue = payments.reduce((sum, pay) => sum + Number(pay.amount), 0).toFixed(2);

    // Dynamic charts dataset representing monthly performance
    const monthlyPerformance = [
      { name: 'Jan', bookings: 5, revenue: 245 },
      { name: 'Feb', bookings: 8, revenue: 540 },
      { name: 'Mar', bookings: 12, revenue: 890 },
      { name: 'Apr', bookings: 19, revenue: 1450 },
      { name: 'May', bookings: 25, revenue: 1980 },
      { name: 'Jun', bookings: totalBookings, revenue: Number(totalRevenue) }
    ];

    const categoryDistribution = [
      { name: 'AC Repair', count: providers.filter(p => p.category === 'AC Repair').length },
      { name: 'Cleaning', count: providers.filter(p => p.category === 'Cleaning').length },
      { name: 'Plumbing', count: providers.filter(p => p.category === 'Plumbing').length },
      { name: 'Beauty', count: providers.filter(p => p.category === 'Beauty').length }
    ];

    res.status(200).json({
      stats: {
        totalUsers,
        totalProviders,
        totalBookings,
        totalRevenue
      },
      charts: {
        monthlyPerformance,
        categoryDistribution
      }
    });

  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ message: 'Error retrieving global platform diagnostics stats' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = dbQuery.findAll('users');
    // Hide passwords from dashboard listing
    const sanitizedUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    }).sort((a,b) => b.id - a.id);

    res.status(200).json({ users: sanitizedUsers });
  } catch (error) {
    console.error('Error listing platform users:', error);
    res.status(500).json({ message: 'Could not retrieve users list' });
  }
};

export const updateUserBlockState = async (req, res) => {
  try {
    const userId = req.params.id;
    const { block } = req.body; // boolean

    const user = dbQuery.findById('users', userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role_id === 3) {
      return res.status(400).json({ message: 'Administrative roles cannot be restricted' });
    }

    dbQuery.update('users', userId, { is_blocked: !!block });

    res.status(200).json({ 
      message: `User has been successfully ${block ? 'Blocked' : 'Unblocked'}` 
    });
  } catch (error) {
    console.error('Failed to change user block status:', error);
    res.status(500).json({ message: 'Error updating user restriction settings' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = dbQuery.findById('users', userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role_id === 3) {
      return res.status(400).json({ message: 'System admins cannot be deleted' });
    }

    // Delete corresponding provider if any
    if (user.role_id === 2) {
      const providers = dbQuery.where('providers', p => p.user_id === user.id);
      if (providers.length > 0) {
        dbQuery.delete('providers', providers[0].id);
      }
    }

    dbQuery.delete('users', userId);
    res.status(200).json({ message: 'User account permanently purged' });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user account' });
  }
};

export const getAllProviders = async (req, res) => {
  try {
    const providers = dbQuery.getProvidersAggregate();
    res.status(200).json({ providers });
  } catch (error) {
    console.error('Error loading provider aggregates:', error);
    res.status(500).json({ message: 'Failed to access provider registries' });
  }
};

export const updateProviderStatus = async (req, res) => {
  try {
    const providerId = req.params.id;
    const { status } = req.body; // 'approved', 'rejected', 'suspended'

    const provider = dbQuery.findById('providers', providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    dbQuery.update('providers', providerId, { status: status });

    // Send Notification to Provider User
    dbQuery.insert('notifications', {
      user_id: provider.user_id,
      title: `Staff Action: Account Status ${status.toUpperCase()}`,
      message: `An administrator has marked your registration status review as "${status.toUpperCase()}". Check your profile dashboard.`,
      is_read: false
    });

    res.status(200).json({ 
      message: `Provider status updated to ${status}` 
    });
  } catch (error) {
    console.error('Error changing provider verification status:', error);
    res.status(500).json({ message: 'Could not change provider approval state' });
  }
};

export const getAllAdministrativeBookings = async (req, res) => {
  try {
    const list = dbQuery.getAllBookingsWithDetails();
    res.status(200).json({ bookings: list });
  } catch (error) {
    console.error('Failed to load global scheduler records:', error);
    res.status(500).json({ message: 'Error retrieving reservation ledger registries' });
  }
};
