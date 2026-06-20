import { dbQuery } from '../models/db-json-backup.js';

export const getAllServices = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, rating, sort } = req.query;

    let services = dbQuery.getServicesWithProviders();

    // Filter by keyword (service title or description)
    if (keyword) {
      const kw = keyword.toLowerCase();
      services = services.filter(
        s => s.title.toLowerCase().includes(kw) || s.description.toLowerCase().includes(kw)
      );
    }

    // Filter by category
    if (category && category !== 'All') {
      services = services.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by price range
    if (minPrice) {
      services = services.filter(s => Number(s.price) >= Number(minPrice));
    }
    if (maxPrice) {
      services = services.filter(s => Number(s.price) <= Number(maxPrice));
    }

    // Filter by rating
    if (rating) {
      services = services.filter(s => Number(s.provider_rating) >= Number(rating));
    }

    // Sorting
    if (sort === 'low_to_high') {
      services.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === 'high_to_low') {
      services.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === 'rating') {
      services.sort((a, b) => Number(b.provider_rating) - Number(a.provider_rating));
    }

    res.status(200).json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error retrieving service listings' });
  }
};

export const getServiceDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const service = dbQuery.findById('services', id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const providerSum = dbQuery.getProviderSummary(service.provider_id);

    res.status(200).json({
      service,
      provider: providerSum
    });
  } catch (error) {
    console.error('Error getting service detail:', error);
    res.status(500).json({ message: 'Error retrieving service details' });
  }
};

export const getProviderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const providerSum = dbQuery.getProviderSummary(id);

    if (!providerSum) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    // 🔥 ADD THIS: fetch reviews
    const reviews = dbQuery.where(
      'reviews',
      r => Number(r.provider_id) === Number(id)
    );

    // Fetch availability block dates
    const blockedDates = dbQuery.where(
      'availability',
      a => a.provider_id === Number(id)
    );

    res.status(200).json({
      provider: {
        ...providerSum,
        reviews: reviews   // ✅ THIS IS THE FIX
      },
      blockedDates: blockedDates.map(b => b.blocked_date)
    });

  } catch (error) {
    console.error('Error getting provider review detail', error);
    res.status(500).json({ message: 'Error loading provider' });
  }
};
export const createService = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, price, duration, image } = req.body;

    const providers = dbQuery.where('providers', p => p.user_id === userId);
    if (providers.length === 0) {
      return res.status(403).json({ message: 'Only approved providers can create services' });
    }

    const provider = providers[0];
    if (provider.status !== 'approved') {
      return res.status(403).json({ message: `Your profile status is "${provider.status}". You cannot list services yet.` });
    }

    if (!title || !description || !price || !duration) {
      return res.status(400).json({ message: 'Missing required service specifications' });
    }

    const newService = dbQuery.insert('services', {
      provider_id: provider.id,
      title,
      description,
      price: String(Number(price).toFixed(2)),
      duration: Number(duration),
      image: image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600'
    });

    res.status(201).json({
      message: 'Service listing created successfully',
      service: newService
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Failed to create service listing' });
  }
};

export const updateService = async (req, res) => {
  try {
    const userId = req.user.userId;
    const serviceId = req.params.id;
    const { title, description, price, duration, image } = req.body;

    const service = dbQuery.findById('services', serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const providers = dbQuery.where('providers', p => p.user_id === userId);
    if (providers.length === 0 || providers[0].id !== service.provider_id) {
      return res.status(403).json({ message: 'Unauthorized modification' });
    }

    const updated = dbQuery.update('services', serviceId, {
      title,
      description,
      price: price ? String(Number(price).toFixed(2)) : service.price,
      duration: duration ? Number(duration) : service.duration,
      image: image || service.image
    });

    res.status(200).json({
      message: 'Service updated successfully',
      service: updated
    });
  } catch (error) {
    console.error('Update service failed:', error);
    res.status(500).json({ message: 'Server error updating service specifications' });
  }
};

export const deleteService = async (req, res) => {
  try {
    const userId = req.user.userId;
    const serviceId = req.params.id;

    const service = dbQuery.findById('services', serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const providers = dbQuery.where('providers', p => p.user_id === userId);
    if (providers.length === 0 || providers[0].id !== service.provider_id) {
      return res.status(403).json({ message: 'Unauthorized delete action' });
    }

    dbQuery.delete('services', serviceId);
    res.status(200).json({ message: 'Service successfully deleted' });
  } catch (error) {
    console.error('Error deleting service', error);
    res.status(500).json({ message: 'Server error deleting service' });
  }
};

export const getProviderServices = async (req, res) => {
  try {
    const userId = req.user.userId;

    const providers = dbQuery.where('providers', p => p.user_id === userId);
    if (providers.length === 0) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const services = dbQuery.where('services', s => s.provider_id === providers[0].id);
    res.status(200).json({ services });
  } catch (error) {
    console.error('Get provider services failed:', error);
    res.status(500).json({ message: 'Error retrieving your services' });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { blockedDates } = req.body; // Array of string dates ['2026-06-20', '2026-06-21']

    const providers = dbQuery.where('providers', p => p.user_id === userId);
    if (providers.length === 0) {
      return res.status(401).json({ message: 'Not authorized as service provider' });
    }

    const providerId = providers[0].id;

    // Delete existing records
    const oldRecords = dbQuery.where('availability', a => a.provider_id === providerId);
    oldRecords.forEach(rec => {
      dbQuery.delete('availability', rec.id);
    });

    // Write new blockages
    if (Array.isArray(blockedDates)) {
      blockedDates.forEach(d => {
        dbQuery.insert('availability', {
          provider_id: providerId,
          blocked_date: d
        });
      });
    }

    res.status(200).json({ message: 'Availability schedule saved successfully' });
  } catch (error) {
    console.error('Error saving availability schedule:', error);
    res.status(500).json({ message: 'Failed to update schedule status' });
  }
};
