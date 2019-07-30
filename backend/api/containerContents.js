const express = require('express');
const router = express.Router();
const cors = require('cors');
const { Container, Folder, Parameter } = require('@sap/hdi');
const formidable = require('formidable');

router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    return new Promise((resolve,reject)=>{
        let form = new formidable.IncomingForm();
        form.parse(req,(err,fields,file)=>{
            var pass = true;
            var missing = [];
            `dbServerHost,dbServerPort,hdiContainer,hdiDTUser,hdiDTPassword`.split(',').map(e=>{
                if(!fields[e]) {
                    pass = false;
                    missing.push(e);
                }
            })
            if(!pass){
                // Change to reject?
                return reject({
                    success : false,
                    message : `The following required parameters are missing: ${missing.join(',')}`
                });
            }else{
                return resolve({
                    fields,file
                });
            }            
        });
    }).then((data)=>{
        let fields = data.fields;
        console.log(fields);
        return new Promise((resolve,reject)=>{
            let container = new Container(fields.hdiContainer, {
                host : fields.dbServerHost,
                port : fields.dbServerPort,
                user: fields.hdiDTUser,
                password : fields.hdiDTPassword
            },fields.hdiDTUser);

            container.connect((err)=>{
                console.log("Connected");
                if(err) return reject(err);
                resolve(container);
            });
        });
    }).then(container=>{
        return new Promise((resolve,reject)=>{
            container.read([new Folder("/")],[new Parameter('RECURSIVE','TRUE')],(err,results)=>{
                if(err) return reject(err);
                let a = [];
                results.results.map(f=>{
                    a.push({
                        path : f.path,
                        createUserName : f.createUserName
                    });
                });
                resolve({message:a});
            });
        });
    }).then(data=>{
        console.log(data);
        res.status(200);
        res.json(data);
        res.end();
    }).catch(err=>{
        res.status(500);
        res.json(err);
        res.end();
    }); 
});

module.exports = router;