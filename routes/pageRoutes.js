const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', (req, res) => {
    res.render('pages/welcome');
});

router.get('/user/login', (req, res) => {
    res.render('pages/login');
});

router.get('/user/register', (req, res) => {
    res.render('pages/register');
});

router.get('/dashboard', (req, res) => {
    res.render('pages/dashboard', { user: req.user });
});

router.get('/history', (req, res) => {
    res.render('pages/history', { user: req.user });
});

module.exports = router;