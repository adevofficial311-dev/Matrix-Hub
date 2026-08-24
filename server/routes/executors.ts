import { Router } from 'express';

const router = Router();

// Current centralized executor compatibility data
const executorData = {
  working: [
    'Potassium',
    'Delta',
    'Opiumware',
    'Madium',
    'Real'
  ],
  notWorking: [
    'Xeno',
    'Solara'
  ],
  lastUpdated: new Date().toISOString().split('T')[0],
  statusMessage: 'All working executors are actively verified with the latest CokeBoys Client build.'
};

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.json({
    ...executorData,
    source: 'api'
  });
});

export default router;
