import { Hono } from 'hono';
import { getRewardsAndProgress } from './rewards';

const api = new Hono();

// ... existing code ...

// Rewards endpoints
api.get('/rewards', getRewardsAndProgress);

export default api; 