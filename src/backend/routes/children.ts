import { Router } from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/auth';
import { calculateAgeRange } from '../utils/ageUtils';

const router = Router();

// Get all children for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM children WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// Create a new child
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, birthdate, gender, avatar_url } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Calculate age range based on birthdate
    const ageRange = birthdate ? calculateAgeRange(new Date(birthdate)) : 'Unknown';

    const result = await pool.query(
      `INSERT INTO children (user_id, name, birthdate, gender, avatar_url, age_range)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, name, birthdate, gender, avatar_url, ageRange]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating child:', error);
    res.status(500).json({ error: 'Failed to create child' });
  }
});

// Update a child
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const childId = req.params.id;
    const { name, birthdate, gender, avatar_url } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Verify the child belongs to the user
    const childCheck = await pool.query(
      'SELECT * FROM children WHERE id = $1 AND user_id = $2',
      [childId, userId]
    );

    if (childCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Calculate age range based on birthdate
    const ageRange = birthdate ? calculateAgeRange(new Date(birthdate)) : 'Unknown';

    const result = await pool.query(
      `UPDATE children
       SET name = $1, birthdate = $2, gender = $3, avatar_url = $4, age_range = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [name, birthdate, gender, avatar_url, ageRange, childId, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating child:', error);
    res.status(500).json({ error: 'Failed to update child' });
  }
});

// Delete a child
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const childId = req.params.id;

    // Verify the child belongs to the user
    const childCheck = await pool.query(
      'SELECT * FROM children WHERE id = $1 AND user_id = $2',
      [childId, userId]
    );

    if (childCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }

    await pool.query(
      'DELETE FROM children WHERE id = $1 AND user_id = $2',
      [childId, userId]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting child:', error);
    res.status(500).json({ error: 'Failed to delete child' });
  }
});

export default router; 