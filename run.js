require('dotenv').config();

const backendport = process.env.BACKEND_PORT || 19999;
const frontendport = process.env.FRONTEND_PORT || 29999;

const cockpit = require('./index')({
    frontendport, backendport
});

cockpit.listen();
