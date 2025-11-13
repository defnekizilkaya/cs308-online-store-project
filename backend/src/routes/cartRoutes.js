const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth');

router.post('/cart/add', requireAuth, cartController.addToCart);
router.get('/cart', requireAuth, cartController.getCart);
router.put('/cart/items/:id', requireAuth, cartController.updateQuantity);
router.delete('/cart/items/:id', requireAuth, cartController.removeItem);

module.exports = router;
