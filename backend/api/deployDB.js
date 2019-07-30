const express = require('express');
const router = express.Router();
const cors = require('cors');
const { spawn } = require('child_process');

const formidable = require('formidable');
const admzip = require('adm-zip');
const uuidv3 = require('uuid/v3');
const fs = require('fs');

router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    let workingdir = '';
    let fields = {};
    return new Promise((resolve,reject)=>{
        let form = new formidable.IncomingForm();
        form.parse(req,(err,fields,file)=>{
            if(err) return reject(err);
            return resolve({
                fields,file
            });
        });
    })
    .then(data=>{
        console.log(data);
        let pass = true;
        let missing = [];
        fields = data.fields;
        `dbServerHost,dbServerPort,tenantDB,hdiContainer,hdiDTUser,hdiDTPassword,hdiRTUser,hdiRTPassword,dbZip`.split(',').map(e=>{
            if((!data.fields || !data.fields[e]) && 
            (!data.file || !data.file[e])) {
                pass = false;
                missing.push(e);
            }
        });
        if(!pass){
            res.status(400).json({
                success : false,
                message : `The following require parameters are missing: ${missing.join(',')}`
            }).end();
            return;
        }
        let zipfile = data.file.dbZip.path;
        let zip = new admzip(zipfile);
        let uuid = uuidv3(zipfile, uuidv3.DNS);
        workingdir = './tmp/' + uuid        
        zip.extractAllTo(workingdir, true);
        return new Promise((resolve, reject)=>{
            fs.writeFile(`${workingdir}/package.json`,JSON.stringify({
                "name": "deploy",
                "dependencies": {
                    "@sap/hdi-deploy": "3.10.0"
                },
                "scripts": {
                    "start": "node node_modules/@sap/hdi-deploy/deploy.js"
                }
            },null,2),err=>{
                if(err) return reject(err);
                resolve();
            });
        });
    })
    .then(()=>{
        return new Promise((resolve,reject)=>{ 
            const child = spawn('npm', ['i'], {
                shell: true,
                cwd: workingdir
            });
            child.stdout.on('data',data=>{
                console.log(data.toString());
            });
            child.stderr.on('data',data=>{
                console.error(data.toString());
                reject(data.toString());
            });
            child.stdout.on('close',code=>{
                resolve(code);
            })
        });
    })
    .then(()=>{
        return new Promise((resolve,reject)=>{
            const { spawn } = require('child_process');
            let log = '';
            let childEnv = JSON.parse(JSON.stringify(process.env));
            childEnv.HDI_DEPLOY_OPTIONS = JSON.stringify({
                auto_undeploy : true,
                exit : true
            });
            childEnv.TARGET_CONTAINER = fields.hdiContainer;
            childEnv.VCAP_SERVICES = JSON.stringify({
                "hana": [ {
                    "name": fields.hdiContainer,
                    "label": "hana",
                    "tags": [ "hana", "database", "relational" ],
                    "plan": "hdi-shared",
                    "credentials": {
                        "schema": fields.hdiContainer,
                        "user": fields.hdiRTUser,
                        "password": fields.hdiRTPassword,
                        "hdi_user": fields.hdiDTUser,
                        "hdi_password": fields.hdiDTPassword,
                        "host" : fields.dbServerHost,
                        "port" : fields.dbServerPort,
                        "tenant_name": fields.tenantDB,
                        "db_hosts": [{
                            "port": parseInt(fields.dbServerPort),
                            "host": fields.dbServerHost
                        }],
                        "url": `jdbc:sap://${fields.dbServerHost}:${fields.dbServerPort}/?currentschema=${fields.hdiContainer}`,
                        "driver": "com.sap.db.jdbc.Driver",
                        "encrypt": false
                    }
                } ]});
            const child = spawn('npm', ['run', 'start'], {
                shell: true,
                cwd: workingdir,
                env : childEnv
            });
            child.stdout.on('data',data=>{
                log+=data.toString();
                console.log(data.toString());
            });
            child.stderr.on('data',data=>{
                log+=data.toString();
                console.error(data.toString());
                reject(data.toString());
            });
            child.stdout.on('close',code=>{
                resolve({code, log});
            });
        });
    })
    .then(data=>{
        console.log(`Child process exited with code ${data.code}.`);
        res.status(200).json({message : data.log}).end();
    })
    .catch((err)=>{
        console.log(`An error occured while trying to deploy:\n${JSON.stringify(err)}`);
        res.status(500);
        res.json(err);
        console.log(err);
        res.end();
    });
});

module.exports = router;