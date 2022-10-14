const express = require('express');
const router = express.Router();    /// router acts as middleware for api/v1/users api requests
const userController = require('./../controllers/userController');

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;