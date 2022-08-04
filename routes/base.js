const express = require('express');
const baseController = require('../controllers/baseController');

const router = express.Router();

router.route('/').get(baseController.getAll);

module.exports = router;
