import express from 'express';
import { getWishlist, toggleWishlist, checkWishlist } from '../controllers/wishlistController.js';

const router = express.Router();

router.get('/:userId', getWishlist);
router.post('/toggle', toggleWishlist);
router.get('/check/:userId/:productId', checkWishlist);

export default router;