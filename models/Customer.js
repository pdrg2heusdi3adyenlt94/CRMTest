const db = require('../config/db');

class Customer {
  static async getAll() {
    const result = await db.query(
      'SELECT id, name, email, phone, company, notes, created_at FROM customers ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(
      'SELECT id, name, email, phone, company, notes, created_at FROM customers WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async create({ name, email, phone, company, notes }) {
    const result = await db.query(
      'INSERT INTO customers (name, email, phone, company, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, phone, company, notes]
    );
    return result.rows[0];
  }

  static async update(id, { name, email, phone, company, notes }) {
    const result = await db.query(
      'UPDATE customers SET name = $1, email = $2, phone = $3, company = $4, notes = $5 WHERE id = $6 RETURNING *',
      [name, email, phone, company, notes, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(
      'DELETE FROM customers WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows.length > 0;
  }
}

module.exports = Customer;