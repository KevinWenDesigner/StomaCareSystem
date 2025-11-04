require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'stoma_care_jwt_secret_key_2025',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  algorithm: 'HS256'
};



