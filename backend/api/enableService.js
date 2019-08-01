const express = require('express');
const router = express.Router();
const cors = require('cors');
const hana = require('@sap/hana-client');
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    var pass = true;
    var missing = [];
    `systemDBServerNode,tenantDB,authUser,authPassword,service`.split(',').map(e=>{
        if(!req.body || !req.body[e]) {
            pass = false;
            missing.push(e);
        }
    })
    if(!pass){
        res.status(400);
        res.json({
            success : false,
            message : `The following require parameters are missing: ${missing.join(',')}`
        });
        res.end();
        return;
    }
    let conn = hana.createConnection();
    
    new Promise((resolve,reject)=>{
        console.log(`Connecting to System DB Node ${req.body.systemDBServerNode} as ${req.body.authUser}...`);
        conn.connect({
            serverNode  : req.body.systemDBServerNode,
            uid         : req.body.authUser,
            pwd         : req.body.authPassword
        }, function(err) {
            if (err) return reject(err);
            resolve(conn);
        });
    }).then(()=>{
        return new Promise((resolve,reject)=>{
            conn.exec(`SELECT * FROM SYS_DATABASES.M_SERVICES
            WHERE DATABASE_NAME='${req.body.tenantDB}' AND ACTIVE_STATUS = 'YES' AND SERVICE_NAME='${req.body.service}'
            `, null, (err,results)=>{
                if(err) return resolve(err);
                resolve(results);
            });
        });
    }).then((results)=>{
        if(results.length>0){
            let errmsg = `Service '${req.body.service}' already exists on '${req.body.tenantDB}.  PID: ${results[0].PROCESS_ID} Port: PID: ${results[0].PORT}`;
            console.log(errmsg);
            throw(errmsg);
        }else{
            return new Promise((resolve,reject)=>{
                conn.exec(`ALTER DATABASE ${req.body.tenantDB} ADD '${req.body.service}';`,null,(err,results)=>{
                    if(err) return reject(err);
                    resolve(results);
                })
            });
        }
    })
    .then(data=>{
        console.log(`Done enabling service '${req.body.service}'`);
        res.status(200);
        res.json({
            success : true,
            message : `Done enabling service '${req.body.service}'`
        });
        res.end();
    })
    .catch((err)=>{
        console.log(`An error occured while trying to create service:\n${JSON.stringify(err)}`);
        res.status(500);
        res.json(err);
        console.log(err);
        res.end();
    });
});

module.exports = router;