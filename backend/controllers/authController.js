import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbQuery } from '../models/db-json-backup.js';

const JWT_SECRET = process.env.JWT_SECRET || 'service_marketplace_super_secret_jwt_key_2026';

export const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, phone, password, profilePhoto, address } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: 'All mandatory fields are required' });
    }

    // Email unique check
    const existingUser = dbQuery.where('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    // Password strength check
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = dbQuery.insert('users', {
      full_name: fullName,
      email: email.toLowerCase(),
      phone: phone,
      password: hashedPassword,
      role_id: 1, // Customer
      profile_photo: profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      address: address || '',
      is_blocked: false
    });

    // Create Initial Notification
    dbQuery.insert('notifications', {
      user_id: newUser.id,
      title: 'Registration Successful',
      message: `Welcome, ${fullName}! Your customer account has been created successfully. Explore our premium services.`,
      is_read: false
    });
   // Notify Admins
const admins = dbQuery.where('users', u => u.role_id === 3);

admins.forEach(admin => {
  dbQuery.insert('notifications', {
    user_id: admin.id,
    title: 'New Provider Approval Request',
    message: `${fullName} has registered as a provider and is waiting for approval.`,
    is_read: false
  });
});

    // Sign JWT
    const token = jwt.sign(
      { userId: newUser.id, roleId: newUser.role_id, email: newUser.email, fullName: newUser.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        roleId: newUser.role_id,
        profilePhoto: newUser.profile_photo,
        address: newUser.address
      }
    });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const registerProvider = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      businessName,
      category,
      experience,
      description,
      verificationDocument,
      profilePhoto
    } = req.body;

    if (!fullName || !email || !phone || !password || !category) {
      return res.status(400).json({ message: 'Mandatory fields are missing' });
    }

    // Validate email
    const existingUser = dbQuery.where('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = dbQuery.insert('users', {
      full_name: fullName,
      email: email.toLowerCase(),
      phone: phone,
      password: hashedPassword,
      role_id: 2, // Provider
      profile_photo: profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      address: '',
      is_blocked: false
    });

    const newProvider = dbQuery.insert('providers', {
      user_id: newUser.id,
      business_name: businessName || `${fullName} Services`,
      category: category,
      experience: Number(experience) || 0,
      description: description || '',
      verification_document: verificationDocument || 'license_document.pdf',
      status: 'pending', // Pending Admin approval
      rating: 5.0,
      completed_jobs: 0,
      skills: '',
      certificates: ''
    });

    // Notification
    dbQuery.insert('notifications', {
      user_id: newUser.id,
      title: 'Provider Account Pending',
      message: 'Your registration is received and is currently pending approval by the administration team.',
      is_read: false
    });
    // Notify Admins (THIS IS THE MISSING PART)
const admins = dbQuery.where('users', u => u.role_id === 3);

admins.forEach(admin => {
  dbQuery.insert('notifications', {
    user_id: admin.id,
    title: 'New Provider Approval Request',
    message: `${fullName} has registered as a provider and is waiting for approval.`,
    is_read: false
  });
});

    // JWT for provider
    const token = jwt.sign(
      { userId: newUser.id, roleId: newUser.role_id, email: newUser.email, fullName: newUser.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Provider registered successfully and pending administrative review',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        roleId: newUser.role_id,
        profilePhoto: newUser.profile_photo,
        providerId: newProvider.id,
        status: newProvider.status
      }
    });

  } catch (error) {
    console.error('Provider registration failed:', error);
    res.status(500).json({ message: 'Server error during provider registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = dbQuery.where('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email credentials' });
    }

    const user = users[0];

    if (user.is_blocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Support notified.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password credentials' });
    }

    let providerExtra = null;
    if (user.role_id === 2) {
      const providers = dbQuery.where('providers', p => p.user_id === user.id);
      if (providers.length > 0) {
        providerExtra = providers[0];
      }
    }

    const token = jwt.sign(
      { userId: user.id, roleId: user.role_id, email: user.email, fullName: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        roleId: user.role_id,
        profilePhoto: user.profile_photo,
        address: user.address,
        provider: providerExtra
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = dbQuery.findById('users', userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let providerProfile = null;
    if (user.role_id === 2) {
      const providerList = dbQuery.where('providers', p => p.user_id === user.id);
      providerProfile = providerList.length > 0 ? providerList[0] : null;
    }

    res.status(200).json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        roleId: user.role_id,
        profilePhoto: user.profile_photo,
        address: user.address,
        provider: providerProfile
      }
    });
  } catch (error) {
    console.error('Get profile failed', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, phone, address, profilePhoto, newPassword, currentPassword } = req.body;

    const user = dbQuery.findById('users', userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateFields = {};
    if (fullName) updateFields.full_name = fullName;
    if (phone) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (profilePhoto) updateFields.profile_photo = profilePhoto;

    // Password change control
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }
      const isMatch = bcrypt.compareSync(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }
      const salt = bcrypt.genSaltSync(10);
      updateFields.password = bcrypt.hashSync(newPassword, salt);
    }

    const updatedUser = dbQuery.update('users', userId, updateFields);

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        roleId: updatedUser.role_id,
        profilePhoto: updatedUser.profile_photo,
        address: updatedUser.address
      }
    });

  } catch (error) {
    console.error('Update profile failed', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

export const updateProviderProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { businessName, category, experience, verificationDocument, description, profilePhoto } = req.body;

    const providers = dbQuery.where('providers', p => p.user_id === userId);
    if (providers.length === 0) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const providerId = providers[0].id;
    const updateData = {};
    if (businessName !== undefined) updateData.business_name = businessName;
    if (category !== undefined) updateData.category = category;
    if (experience !== undefined) updateData.experience = Number(experience);
    if (verificationDocument !== undefined) updateData.verification_document = verificationDocument;
    if (description !== undefined) updateData.description = description;

    const updated = dbQuery.update('providers', providerId, updateData);

    if (profilePhoto) {
      dbQuery.update('users', userId, { profile_photo: profilePhoto });
    }

    const updatedUser = dbQuery.findById('users', userId);

    res.status(200).json({
      message: 'Professional profile details saved',
      provider: updated,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        roleId: updatedUser.role_id,
        profilePhoto: updatedUser.profile_photo,
        address: updatedUser.address,
        provider: updated
      }
    });
  } catch (error) {
    console.error('Update provider profile error', error);
    res.status(500).json({ message: 'Error saving provider professional profile' });
  }
};
