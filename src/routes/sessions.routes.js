const { Router } = require('express');

const { SessionsController } = require('../controllers/SessionsController2');
const sessionsController = new SessionsController();

const sessionsRoutes = Router();
sessionsRoutes.post('/', sessionsController.create);

module.exports = sessionsRoutes;
