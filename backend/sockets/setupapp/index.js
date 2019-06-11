module.exports = (io)=>{
    return (data)=>{
        if(data.backendPassword != process.env.BACKEND_PASSWORD) console.log(`Bad password.`);
        console.log(data);
        io.emit("setupapp", data);
    };
};