const db = require('../config/db');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('Seeding database...');

    // Clear existing data
    await db.query('DELETE FROM interactions');
    await db.query('DELETE FROM customers');
    await db.query('DELETE FROM users');

    // Hash admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Insert admin user
    const adminResult = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['admin', 'admin@crm.com', hashedPassword, 'admin']
    );

    const adminId = adminResult.rows[0].id;
    console.log(`Created admin user with ID: ${adminId}`);

    // Insert sample customers
    const customers = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '555-1234',
        company: 'ABC Corp',
        notes: 'Important client'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '555-5678',
        company: 'XYZ Inc',
        notes: 'Potential lead'
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        phone: '555-9012',
        company: 'Tech Solutions',
        notes: 'Long-term partner'
      }
    ];

    for (const customer of customers) {
      const result = await db.query(
        'INSERT INTO customers (name, email, phone, company, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [customer.name, customer.email, customer.phone, customer.company, customer.notes]
      );
      console.log(`Created customer: ${customer.name} with ID: ${result.rows[0].id}`);
    }

    // Insert sample interactions
    const interactions = [
      {
        customer_id: 1,
        type: 'call',
        notes: 'Discussed new project requirements'
      },
      {
        customer_id: 1,
        type: 'email',
        notes: 'Sent proposal document'
      },
      {
        customer_id: 2,
        type: 'meeting',
        notes: 'In-person meeting at client office'
      },
      {
        customer_id: 3,
        type: 'call',
        notes: 'Follow-up on previous discussion'
      }
    ];

    for (const interaction of interactions) {
      const result = await db.query(
        'INSERT INTO interactions (customer_id, type, notes) VALUES ($1, $2, $3) RETURNING id',
        [interaction.customer_id, interaction.type, interaction.notes]
      );
      console.log(`Created interaction for customer ${interaction.customer_id} with ID: ${result.rows[0].id}`);
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

seedData();