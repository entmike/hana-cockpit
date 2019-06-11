const express = require('express');
const app = express();
const bodyParser = require('body-parser');

require('dotenv').config();
module.exports = {
    app () {
        let server = require('http').createServer(app);
        // TODO: Actually do something with socket
        let io = require('socket.io')(server,{
            origin : '*:*'
        });
        io.on('connection', function(socket){
            console.log("New Connection established.");
            socket.on('createuser', require('./sockets/setupapp')(io,socket));
            socket.on('disconnect', data=>{
                console.log('Connection terminated.');
            });
        });
        app.use('/api/getconfig', require('./api/getconfig'));
        app.use('/api/enableHDI', require('./api/enableHDI'));
        app.use('/api/createContainer', require('./api/createContainer'));
        app.use('/api/createUser', require('./api/createUser'));
        app.use('/api/grantHDIRole', require('./api/grantHDIRole'));
        app.use('/api/mapExternalHost', require('./api/mapExternalHost'));

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended : true
        }));
        
        return server;
    }
}