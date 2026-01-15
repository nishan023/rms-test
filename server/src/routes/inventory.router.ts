import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller.js'; // Check extension
import { isAdmin } from '../middleware/auth.middleware.js'; 

const router = Router();

router.get('/', inventoryController.getInventory);
router.post('/purchase', inventoryController.recordPurchase);
router.get('/:itemId/transactions', inventoryController.getTransactions);

export default router;
