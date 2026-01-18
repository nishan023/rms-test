import express from 'express';
import { createOrder, getOrder } from '../controllers/order.controller.ts';

const router = express.Router();

// Logging to verify router is loaded
console.log('Order Router loaded');

router.post('/', createOrder);
router.get('/:id', getOrder);

export default router;
