const server=require('./index.js').app();
server.listen(process.env.BACKEND_PORT || 19999, ()=>{
    console.log(`Backend Server started on port ${process.env.BACKEND_PORT || 19999}`);
});