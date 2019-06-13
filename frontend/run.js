const port = process.env.FRONTEND_PORT || 29999;
const server=require('./index.js').server({ port: port });
server.listen(port, ()=>{
    console.log(`Frontend Server serving static assets on port ${port}`);
});