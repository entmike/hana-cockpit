module.exports = (options=>{
    let obj = {
        backend : require('./backend').app(),
        frontend : require('./frontend').server({ port: options.frontendport }),
        listen () {
            this.backend.listen(options.backendport, ()=>{
                console.log(`Backend Server started on port ${options.backendport}`);
            });
            this.frontend.listen(options.frontendport,()=>{
                console.log(`Frontend server listening on ${options.frontendport}`);
            });
        }
    };
    return obj;
});
