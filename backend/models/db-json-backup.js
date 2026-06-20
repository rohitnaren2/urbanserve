// File-Backed Database Engine for the Service Marketplace Platform
// Simulates MySQL tables and relations securely while ensuring persistence in our container.

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (table) => path.join(DATA_DIR, `${table}.json`);

function readTable(table) {
  const filePath = getFilePath(table);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading database table: ${table}`, error);
    return [];
  }
}

function writeTable(table, data) {
  try {
    fs.writeFileSync(getFilePath(table), JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing database table: ${table}`, error);
  }
}

// --------------------------------------------------------
// BASE TABLES DEFINITIONS & SEEDING (ON INITIAL RUN)
// --------------------------------------------------------

export const dbInit = () => {
  // Initialize Tables
  const tables = [
    'users',
    'providers',
    'services',
    'bookings',
    'payments',
    'reviews',
    'notifications',
    'availability'
  ];

  tables.forEach(table => {
    if (!fs.existsSync(getFilePath(table))) {
      writeTable(table, []);
    }
  });

  // Seed Users if empty
  const users = readTable('users');
  if (users.length === 0) {
    console.log('Seeding initial database data...');

    const salt = bcrypt.genSaltSync(10);
    const adminPassword = bcrypt.hashSync('admin123', salt);
    const providerPassword = bcrypt.hashSync('provider123', salt);
    const customerPassword = bcrypt.hashSync('customer123', salt);

    const initialUsers = [
      {
        id: 1,
        full_name: 'System Admin',
        email: 'admin@marketplace.com',
        phone: '1234567890',
        password: adminPassword,
        role_id: 3, // Admin
        profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        address: 'HQ Administrative Block, Suite 101',
        is_blocked: false,
        created_at: new Date().toISOString()
      },
     
    ];

    writeTable('users', initialUsers);

    // Seed Providers Profile
 

    // Seed Services
 

    // Seed Reviews
    

    // Seed Notifications
    const initialNotifications = [
      {
        id: 1,
        user_id: 4,
        title: 'Account Active',
        message: 'Welcome to our premium service marketplace! Complete your profile to get personalized recommendations.',
        is_read: false,
        created_at: new Date().toISOString()
      }
    ];
    writeTable('notifications', initialNotifications);

    // Seed Availability
    const initialAvailability = [
      {
        id: 1,
        provider_id: 1,
        blocked_date: '2026-06-25'
      }
    ];
    writeTable('availability', initialAvailability);

    console.log('Seeding successfully completed!');
  }
};

// --------------------------------------------------------
// ENGINE MODEL METHOD DECORATORS (MYSQL QUERY EMULATION)
// --------------------------------------------------------

export const dbQuery = {
  // FIND ALL
  findAll: (table) => {
    return readTable(table);
  },

  // FIND BY ID
  findById: (table, id) => {
    const data = readTable(table);
    return data.find(item => item.id === Number(id)) || null;
  },

  // INSERT ROW
  insert: (table, row) => {
    const data = readTable(table);
    const newId = data.length > 0 ? Math.max(...data.map(i => i.id)) + 1 : 1;
    const newRow = { id: newId, ...row, created_at: new Date().toISOString() };
    data.push(newRow);
    writeTable(table, data);
    return newRow;
  },

  // UPDATE ROW
  update: (table, id, fields) => {
    const data = readTable(table);
    const idx = data.findIndex(item => item.id === Number(id));
    if (idx === -1) return null;
    const updated = { ...data[idx], ...fields, updated_at: new Date().toISOString() };
    data[idx] = updated;
    writeTable(table, data);
    return updated;
  },

  // DELETE ROW
  delete: (table, id) => {
    const data = readTable(table);
    const filtered = data.filter(item => item.id !== Number(id));
    writeTable(table, filtered);
    return true;
  },

  // CUSTOM FILTERS (Like SELECT * WHERE ...)
  where: (table, predicate) => {
    const data = readTable(table);
    return data.filter(predicate);
  },

  // JOIN UTILITIES (For complex dashboard queries)
  getServicesWithProviders: () => {
    const services = readTable('services');
    const providers = readTable('providers');
    const users = readTable('users');

    return services.map(srv => {
      const provider = providers.find(p => p.id === srv.provider_id);
      const providerUser = provider ? users.find(u => u.id === provider.user_id) : null;
      return {
        ...srv,
        provider_name: providerUser ? providerUser.full_name : 'Unknown Specialist',
        provider_rating: provider ? provider.rating : 5.0,
        provider_photo: providerUser ? providerUser.profile_photo : null,
        provider_business_name: provider ? provider.business_name : null,
        category: provider ? provider.category : 'General'
      };
    });
  },

  getBookingsForCustomer: (customerId) => {
    const bookings = readTable('bookings');
    const services = readTable('services');
    const providers = readTable('providers');
    const users = readTable('users');
    const reviews = readTable('reviews');

    return bookings
      .filter(b => b.customer_id === Number(customerId))
      .map(b => {
        const service = services.find(s => s.id === b.service_id);
        const provider = providers.find(p => p.id === b.provider_id);
        const providerUser = provider ? users.find(u => u.id === provider.user_id) : null;
        const review = reviews.find(r => r.booking_id === b.id);

        return {
          ...b,
          service_title: service ? service.title : 'Deleted Service',
          service_price: service ? service.price : '0.00',
          service_image: service ? service.image : null,
          service_duration: service ? service.duration : 0,
          provider_name: providerUser ? providerUser.full_name : 'Unknown Specialists',
          provider_business_name: provider ? provider.business_name : null,
          provider_photo: providerUser ? providerUser.profile_photo : null,
          provider_id: b.provider_id,
          review_posted: review ? true : false,
          rating_given: review ? review.rating : null
        };
      })
      .sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  },

  getBookingsForProvider: (providerId) => {
    const bookings = readTable('bookings');
    const services = readTable('services');
    const users = readTable('users');

    return bookings
      .filter(b => b.provider_id === Number(providerId))
      .map(b => {
        const service = services.find(s => s.id === b.service_id);
        const customerUser = users.find(u => u.id === b.customer_id);

        return {
          ...b,
          service_title: service ? service.title : 'Deleted Service',
          service_price: service ? service.price : '0.00',
          service_image: service ? service.image : null,
          customer_name: customerUser ? customerUser.full_name : 'Valued Client',
          customer_email: customerUser ? customerUser.email : '',
          customer_phone: customerUser ? customerUser.phone : '',
          customer_photo: customerUser ? customerUser.profile_photo : null
        };
      })
      .sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  },

  getAllBookingsWithDetails: () => {
    const bookings = readTable('bookings');
    const services = readTable('services');
    const providers = readTable('providers');
    const users = readTable('users');

    return bookings.map(b => {
      const service = services.find(s => s.id === b.service_id);
      const customerUser = users.find(u => u.id === b.customer_id);
      const provider = providers.find(p => p.id === b.provider_id);
      const providerUser = provider ? users.find(u => u.id === provider.user_id) : null;

      return {
        ...b,
        service_title: service ? service.title : 'Deleted Service',
        customer_name: customerUser ? customerUser.full_name : 'Client',
        provider_name: providerUser ? providerUser.full_name : 'Specialist',
        provider_business_name: provider ? provider.business_name : null
      };
    }).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  },

  getReviewsForProvider: (providerId) => {
    const reviews = readTable('reviews');
    const users = readTable('users');
    const services = readTable('services');
    const bookings = readTable('bookings');

    return reviews
      .filter(r => r.provider_id === Number(providerId))
      .map(r => {
        const reviewer = users.find(u => u.id === r.customer_id);
        const booking = bookings.find(b => b.id === r.booking_id);
        const serviceName = booking ? (services.find(s => s.id === booking.service_id)?.title || 'Service') : 'Service';

        return {
          ...r,
          customer_name: reviewer ? reviewer.full_name : 'Anonymous Client',
          customer_photo: reviewer ? reviewer.profile_photo : null,
          service_title: serviceName
        };
      });
  },

  getProviderSummary: (providerId) => {
    const provider = readTable('providers').find(p => p.id === Number(providerId));
    if (!provider) return null;

    const providerUser = readTable('users').find(u => u.id === provider.user_id);
    const services = readTable('services').filter(s => s.provider_id === Number(providerId));
    const reviews = readTable('reviews').filter(r => r.provider_id === Number(providerId));
    const bookings = readTable('bookings').filter(b => b.provider_id === Number(providerId) && b.status === 'completed');

    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const calculatedRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 5.0;

    return {
      ...provider,
      full_name: providerUser ? providerUser.full_name : 'Unknown Professional',
      profile_photo: providerUser ? providerUser.profile_photo : null,
      email: providerUser ? providerUser.email : '',
      phone: providerUser ? providerUser.phone : '',
      address: providerUser ? providerUser.address : '',
      services,
      reviewsCount: reviews.length,
      rating: Number(calculatedRating),
      completed_jobs: bookings.length
    };
  },

  getProvidersAggregate: () => {
    const providers = readTable('providers');
    const users = readTable('users');

    return providers.map(p => {
      const userObj = users.find(u => u.id === p.user_id);
      return {
        ...p,
        full_name: userObj ? userObj.full_name : 'Unknown Professional',
        email: userObj ? userObj.email : '',
        phone: userObj ? userObj.phone : '',
        profile_photo: userObj ? userObj.profile_photo : null,
        address: userObj ? userObj.address : ''
      };
    });
  }
};
