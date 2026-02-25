const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { addReview, getProductReviews } = require('../controllers/reviewController');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, upload.array('images', 6), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 6), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
