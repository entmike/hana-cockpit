const express = require('express'),
path = require('path');
module.exports = {
    server (options) {
        let app = express();
        app.set('port', options.port || 29999);
        app.use(express.static(path.join(__dirname, './dist')));
        return app;
    }
}