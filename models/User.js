const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async getAll() {
    const result = await db.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async getByEmail(email) {
    const result = await db.query(
      'SELECT id, username, email, password, role FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async create({ username, email, password, role = 'user' }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const result = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [username, email, hashedPassword, role]
    );
    return result.rows[0];
  }

  static async update(id, { username, email, password, role }) {
    let query, params;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query = 'UPDATE users SET username = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING id, username, email, role, created_at';
      params = [username, email, hashedPassword, role, id];
    } else {
      query = 'UPDATE users SET username = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, username, email, role, created_at';
      params = [username, email, role, id];
    }
    
    const result = await db.query(query, params);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows.length > 0;
  }
}

module.exports = User;