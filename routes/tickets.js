const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const requireAuth = require('../middleware/auth');

// generates ticket ids 
async function generateTicketId() {
  const [rows] = await db.query('SELECT COUNT(*) as count FROM tickets');
  const count = rows[0].count + 1;
  return `TKT-${String(count).padStart(3, '0')}`;
}

// get / dashboard 
router.get('/', requireAuth, async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status = 'Open') AS open,
        SUM(status = 'In Progress') AS in_progress,
        SUM(status = 'Closed') AS closed
      FROM tickets
    `);
    const [recent] = await db.query(
      'SELECT ticket_id, customer_name, subject, status, created_at FROM tickets ORDER BY created_at DESC LIMIT 5'
    );
    res.render('dashboard', { stats, recent });
  } catch (err) {
    console.error(err);
    res.render('dashboard', { stats: { total: 0, open: 0, in_progress: 0, closed: 0 }, recent: [] });
  }
});

// get / tickets gets all the tickets throgh search bar 
router.get('/tickets', requireAuth, async (req, res) => {
  const { search = '', status = '' } = req.query;
  try {
    let query = 'SELECT ticket_id, customer_name, customer_email, subject, status, created_at FROM tickets WHERE 1=1';
    const params = [];
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (search) {
      query += ' AND (customer_name LIKE ? OR customer_email LIKE ? OR ticket_id LIKE ? OR subject LIKE ? OR description LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like, like, like);
    }
    query += ' ORDER BY created_at DESC';
    const [tickets] = await db.query(query, params);
    res.render('tickets', { tickets, search, status });
  } catch (err) {
    console.error(err);
    res.render('tickets', { tickets: [], search, status });
  }
});

// get/ticcket/new 
router.get('/tickets/new', requireAuth, (req, res) => {
  res.render('new-ticket', { error: null });
});

// post/ ticket /new 
router.post('/tickets/new', requireAuth, async (req, res) => {
  const { customer_name, customer_email, subject, description } = req.body;
  if (!customer_name || !customer_email || !subject) {
    return res.render('new-ticket', { error: 'Name, email, and subject are required.' });
  }
  try {
    const ticket_id = await generateTicketId();
    await db.query(
      'INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [ticket_id, customer_name.trim(), customer_email.trim().toLowerCase(), subject.trim(), description?.trim() || '', req.session.user.id]
    );
    res.redirect(`/tickets/${ticket_id}`);
  } catch (err) {
    console.error(err);
    res.render('new-ticket', { error: 'Failed to create ticket. Try again.' });
  }
});

// ticket id 
router.get('/tickets/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tickets WHERE ticket_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).render('404');
    const ticket = rows[0];
    const [notes] = await db.query(
      'SELECT * FROM notes WHERE ticket_id = ? ORDER BY created_at ASC',
      [req.params.id]
    );
    res.render('ticket-detail', { ticket, notes, error: null, success: null });
  } catch (err) {
    console.error(err);
    res.status(500).render('404');
  }
});

// update status or add notre 
router.post('/tickets/:id', requireAuth, async (req, res) => {
  const { status, note_text } = req.body;
  const ticket_id = req.params.id;
  try {
    const [rows] = await db.query('SELECT * FROM tickets WHERE ticket_id = ?', [ticket_id]);
    if (rows.length === 0) return res.status(404).render('404');

    if (status) {
      await db.query('UPDATE tickets SET status = ? WHERE ticket_id = ?', [status, ticket_id]);
    }
    if (note_text && note_text.trim()) {
      await db.query(
        'INSERT INTO notes (ticket_id, note_text, author) VALUES (?, ?, ?)',
        [ticket_id, note_text.trim(), req.session.user.name]
      );
    }

    const [updated] = await db.query('SELECT * FROM tickets WHERE ticket_id = ?', [ticket_id]);
    const [notes] = await db.query('SELECT * FROM notes WHERE ticket_id = ? ORDER BY created_at ASC', [ticket_id]);
    res.render('ticket-detail', { ticket: updated[0], notes, error: null, success: 'Ticket updated.' });
  } catch (err) {
    console.error(err);
    const [rows] = await db.query('SELECT * FROM tickets WHERE ticket_id = ?', [ticket_id]);
    const [notes] = await db.query('SELECT * FROM notes WHERE ticket_id = ? ORDER BY created_at ASC', [ticket_id]);
    res.render('ticket-detail', { ticket: rows[0], notes, error: 'Update failed.', success: null });
  }
});
 
// all the rest apis 

// post/api/tickets 
router.post('/api/tickets', async (req, res) => {
  const { customer_name, customer_email, subject, description } = req.body;
  if (!customer_name || !customer_email || !subject) {
    return res.status(400).json({ error: 'customer_name, customer_email, and subject are required.' });
  }
  try {
    const ticket_id = await generateTicketId();
    await db.query(
      'INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description) VALUES (?, ?, ?, ?, ?)',
      [ticket_id, customer_name.trim(), customer_email.trim().toLowerCase(), subject.trim(), description?.trim() || '']
    );
    const [[ticket]] = await db.query('SELECT ticket_id, created_at FROM tickets WHERE ticket_id = ?', [ticket_id]);
    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// get/api/ticketv 
router.get('/api/tickets', async (req, res) => {
  const { status, search } = req.query;
  try {
    let query = 'SELECT ticket_id, customer_name, customer_email, subject, status, created_at FROM tickets WHERE 1=1';
    const params = [];
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (search) {
      query += ' AND (customer_name LIKE ? OR customer_email LIKE ? OR ticket_id LIKE ? OR subject LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }
    query += ' ORDER BY created_at DESC';
    const [tickets] = await db.query(query, params);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// get/api/ticket/id 
router.get('/api/tickets/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tickets WHERE ticket_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found.' });
    const [notes] = await db.query('SELECT * FROM notes WHERE ticket_id = ? ORDER BY created_at ASC', [req.params.id]);
    res.json({ ...rows[0], notes });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// put//api/tickets/id
router.put('/api/tickets/:id', async (req, res) => {
  const { status, note_text } = req.body;
  try {
    const [rows] = await db.query('SELECT id FROM tickets WHERE ticket_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found.' });
    if (status) await db.query('UPDATE tickets SET status = ? WHERE ticket_id = ?', [status, req.params.id]);
    if (note_text) await db.query('INSERT INTO notes (ticket_id, note_text) VALUES (?, ?)', [req.params.id, note_text]);
    const [[updated]] = await db.query('SELECT updated_at FROM tickets WHERE ticket_id = ?', [req.params.id]);
    res.json({ success: true, updated_at: updated.updated_at });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
