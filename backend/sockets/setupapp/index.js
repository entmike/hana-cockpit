module.exports = (io,socket)=>{
    return (data)=>{
        if(data.backendPassword != process.env.BACKEND_PASSWORD) console.log(`Bad password.`);
        console.log(data);
        console.log(socket.id);
        socket.emit("createuser", "Responding from create user");
    };
};