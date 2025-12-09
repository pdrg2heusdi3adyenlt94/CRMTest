const db = require('../config/db');

class Interaction {
  static async getAll() {
    const result = await db.query(
      `SELECT i.id, i.customer_id, i.type, i.notes, i.date, i.created_at, 
              c.name as customer_name 
       FROM interactions i 
       LEFT JOIN customers c ON i.customer_id = c.id 
       ORDER BY i.date DESC`
    );
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(
      `SELECT i.id, i.customer_id, i.type, i.notes, i.date, i.created_at, 
              c.name as customer_name 
       FROM interactions i 
       LEFT JOIN customers c ON i.customer_id = c.id 
       WHERE i.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async create({ customer_id, type, notes, date }) {
    const result = await db.query(
      'INSERT INTO interactions (customer_id, type, notes, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [customer_id, type, notes, date]
    );
    return result.rows[0];
  }

  static async update(id, { customer_id, type, notes, date }) {
    const result = await db.query(
      'UPDATE interactions SET customer_id = $1, type = $2, notes = $3, date = $4 WHERE id = $5 RETURNING *',
      [customer_id, type, notes, date, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(
      'DELETE FROM interactions WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows.length > 0;
  }
}

module.exports = Interaction;