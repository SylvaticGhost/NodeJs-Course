const {body} = require('express-validator');

const validateNote = [
    body('title').notEmpty().withMessage('Title is required'),
    body('title').isLength({max: 30}).withMessage('Title cannot be more than 30 characters'),
];

const validateUserLogin = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const validateUserRegister = [
    ...validateUserLogin,
    body('password').isLength({
        min: 6,
        max: 16
    }).withMessage('Password length should be [6-16] characters'),
    body('username').isLength({max: 20}).withMessage('Username cannot be more than 20 characters'),
    body('username').isAlphanumeric().withMessage('Username should be alphanumeric'),
];

module.exports = {
    validateNote,
    validateUserLogin,
    validateUserRegister,
};
