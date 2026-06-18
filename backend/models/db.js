import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create MySQL Connection Pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'urbanserve',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Row Mapper to convert custom boolean integers (0/1) to real JS booleans
const mapRow = (row) => {
  if (!row) return row;
  const mapped = { ...row };
  if ('is_blocked' in mapped) {
    mapped.is_blocked = mapped.is_blocked === 1 || mapped.is_blocked === true;
  }
  if ('is_read' in mapped) {
    mapped.is_read = mapped.is_read === 1 || mapped.is_read === true;
  }
  return mapped;
};

// 1. findAll helper
export const findAll = async (table) => {
  const [rows] = await pool.query(`SELECT * FROM ??`, [table]);
  return rows.map(mapRow);
};

// 2. findById helper
export const findById = async (table, id) => {
  const [rows] = await pool.query(`SELECT * FROM ?? WHERE id = ? LIMIT 1`, [table, id]);
  return rows.length > 0 ? mapRow(rows[0]) : null;
};

// 3. insert helper
export const insert = async (table, data) => {
  const [result] = await pool.query(`INSERT INTO ?? SET ?`, [table, data]);
  const newId = result.insertId;
  return await findById(table, newId);
};

// 4. update helper
export const update = async (table, id, data) => {
  await pool.query(`UPDATE ?? SET ? WHERE id = ?`, [table, data, id]);
  return await findById(table, id);
};

// 5. delete helper
const _delete = async (table, id) => {
  const [result] = await pool.query(`DELETE FROM ?? WHERE id = ?`, [table, id]);
  return result;
};

// 6. where helper
export const where = async (table, filterFn) => {
  const rows = await findAll(table);
  return rows.filter(filterFn);
};

// 7. getServicesWithProviders helper
export const getServicesWithProviders = async () => {
  const [rows] = await pool.query(`
    SELECT 
      s.*, 
      p.category, 
      p.rating AS provider_rating, 
      p.business_name AS provider_business,
      u.full_name AS provider_name
    FROM services s
    JOIN providers p ON s.provider_id = p.id
    JOIN users u ON p.user_id = u.id
    ORDER BY s.id DESC
  `);
  return rows.map(mapRow);
};

// 8. getBookingsForCustomer helper
export const getBookingsForCustomer = async (customerId) => {
  const [rows] = await pool.query(`
    SELECT 
      b.*, 
      s.title AS service_title, 
      s.duration AS service_duration,
      s.image AS service_image,
      u.full_name AS provider_name, 
      p.business_name AS provider_business
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN providers p ON b.provider_id = p.id
    JOIN users u ON p.user_id = u.id
    WHERE b.customer_id = ?
    ORDER BY b.created_at DESC
  `, [customerId]);
  return rows.map(mapRow);
};

// 9. getBookingsForProvider helper
export const getBookingsForProvider = async (providerId) => {
  const [rows] = await pool.query(`
    SELECT 
      b.*, 
      s.title AS service_title, 
      s.duration AS service_duration,
      s.image AS service_image,
      u.full_name AS customer_name, 
      u.phone AS customer_phone,
      u.email AS customer_email
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN users u ON b.customer_id = u.id
    WHERE b.provider_id = ?
    ORDER BY b.created_at DESC
  `, [providerId]);
  return rows.map(mapRow);
};

// 10. getAllBookingsWithDetails helper
export const getAllBookingsWithDetails = async () => {
  const [rows] = await pool.query(`
    SELECT 
      b.*, 
      s.title AS service_title, 
      cust.full_name AS customer_name, 
      prov_u.full_name AS provider_name,
      prov.business_name AS provider_business
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN users cust ON b.customer_id = cust.id
    JOIN providers prov ON b.provider_id = prov.id
    JOIN users prov_u ON prov.user_id = prov_u.id
    ORDER BY b.created_at DESC
  `);
  return rows.map(mapRow);
};

// 11. getReviewsForProvider helper
export const getReviewsForProvider = async (providerId) => {
  const [rows] = await pool.query(`
    SELECT 
      r.*, 
      u.full_name AS customer_name,
      u.profile_photo AS customer_photo
    FROM reviews r
    JOIN users u ON r.customer_id = u.id
    WHERE r.provider_id = ?
    ORDER BY r.created_at DESC
  `, [providerId]);
  return rows.map(mapRow);
};

// 12. getProviderSummary helper
export const getProviderSummary = async (providerId) => {
  const [providers] = await pool.query(`
    SELECT 
      p.*, 
      u.full_name, 
      u.email, 
      u.phone, 
      u.profile_photo, 
      u.address
    FROM providers p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `, [providerId]);
  
  if (providers.length === 0) return null;
  const provider = mapRow(providers[0]);

  // Fetch and append reviews list
  const reviews = await getReviewsForProvider(providerId);
  provider.reviews = reviews;
  return provider;
};

// 13. getProvidersAggregate helper
export const getProvidersAggregate = async () => {
  const [rows] = await pool.query(`
    SELECT 
      p.*, 
      u.full_name, 
      u.email, 
      u.phone, 
      u.profile_photo, 
      u.address,
      u.is_blocked
    FROM providers p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.id DESC
  `);
  return rows.map(mapRow);
};

export const dbQuery = {
  findAll,
  findById,
  insert,
  update,
  delete: _delete,
  where,
  getServicesWithProviders,
  getBookingsForCustomer,
  getBookingsForProvider,
  getAllBookingsWithDetails,
  getReviewsForProvider,
  getProviderSummary,
  getProvidersAggregate
};