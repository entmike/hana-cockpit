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
    `authUser,authPassword,hdiAdmin,hdiAdminPassword,dbServerNode,hdiContainer,hdiUserPassword`.split(',').map(e=>{
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
    
    let containerName = req.body.hdiContainer;
    let hdiDTPassword = req.body.hdiUserPassword;
    let hdiRTPassword = req.body.hdiUserPassword;
    let hdiContainer = req.body.hdiContainer;
    let conn = hana.createConnection();
    
    new Promise((resolve,reject)=>{
        console.log(`Logging in as ${req.body.authUser}...`);
        conn.connect({
            serverNode  : req.body.dbServerNode,
            uid         : req.body.authUser,
            pwd         : req.body.authPassword
        }, err => {
            if(err) return reject(err); 
            return resolve(conn);
        })
    }).then(conn=>{
        console.log(`Connected as ${req.body.authPassword}.`);
        return Promise.all([
            new Promise((resolve,reject)=>{
                conn.exec(`CREATE USER ${hdiContainer}_USER_DT PASSWORD "${hdiDTPassword}" NO FORCE_FIRST_PASSWORD_CHANGE;`,null,(err,results)=>{
                    if(err && err.code!=331) return reject(err);
                    return resolve(results);
                });
            }),
            new Promise((resolve,reject)=>{
                conn.exec(`CREATE USER ${hdiContainer}_USER_RT PASSWORD "${hdiRTPassword}" NO FORCE_FIRST_PASSWORD_CHANGE;`,null,(err,results)=>{
                    if(err && err.code!=331) return reject(err);
                    return resolve(results);
                });
            }),
            new Promise((resolve,reject)=>{
                conn.exec(`CREATE USER ${hdiContainer}_ADMIN PASSWORD "${hdiRTPassword}" NO FORCE_FIRST_PASSWORD_CHANGE;`,null,(err,results)=>{
                    if(err && err.code!=331) return reject(err);
                    return resolve(results);
                });
            })
        ]);
    }).then(data=>{
        console.log('User creation complete.');
        conn.disconnect();
        return new Promise((resolve,reject)=>{
            console.log(`Logging in as ${req.body.hdiAdmin}...`);
            conn.connect({
                serverNode  : req.body.dbServerNode,
                uid         : req.body.authUser,
                pwd         : req.body.authPassword
            }, err => {
                if(err) return reject(err); 
                return resolve(conn);
            });
        });
    }).then(conn=>{
        console.log(`Connected as ${req.body.hdiAdmin}.`);
        console.log(`Creating HDI Container "${req.body.hdiContainer}"...`);
        return new Promise((resolve,reject)=>{
            conn.exec(`CALL _SYS_DI.CREATE_CONTAINER('${req.body.hdiContainer}', _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);`,null,(err,results)=>{
                if(err) return reject(err);
                return resolve(results);
            });
        });
    }).then(data=>{
        let log = [];
        let error = false;
        data.map(row=>{
            if(row.SEVERITY=='ERROR') error = true;
            log.push(row.MESSAGE);
        })
        let errLog = log.join('\n');
        if(error) throw errLog;
        console.log(`HDI Container "${req.body.hdiContainer}" created.`);
        console.log(log.join('\n'));
        
        console.log(`Assigning privileges to HDI Users (RT/DT)...`);
        return `CREATE LOCAL TEMPORARY TABLE #PRIVILEGES LIKE _SYS_DI.TT_API_PRIVILEGES;
        INSERT INTO #PRIVILEGES (PRIVILEGE_NAME, OBJECT_NAME, PRINCIPAL_NAME) SELECT PRIVILEGE_NAME, OBJECT_NAME, '${hdiContainer}_USER_DT' AS PRINCIPAL_NAME FROM _SYS_DI.T_DEFAULT_CONTAINER_ADMIN_PRIVILEGES;
        CALL _SYS_DI.GRANT_CONTAINER_API_PRIVILEGES('${hdiContainer}', #PRIVILEGES, _SYS_DI.T_NO_PARAMETERS, ?, ?, ?)
        DROP TABLE #PRIVILEGES;
        CREATE LOCAL TEMPORARY TABLE #SCHEMA_PRIV LIKE _SYS_DI.TT_SCHEMA_PRIVILEGES;
        INSERT INTO #SCHEMA_PRIV VALUES ('SELECT', '', '${hdiContainer}_USER_RT');
        CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${hdiContainer}', #SCHEMA_PRIV, _SYS_DI.T_NO_PARAMETERS, ?, ?, ?)
        DROP TABLE #SCHEMA_PRIV`
        .split('\n').reduce( async (previousPromise, nextStatement) => {
            await previousPromise;
            return new Promise((resolve,reject)=>{
                console.log(`Running:\t${nextStatement}...`)
                conn.exec(nextStatement,null,(err,results)=>{
                    if(err && err.code != 331) {
                        console.log(`Failed on command ${nextStatement} with error: ${JSON.stringify(err)}`);
                        return reject(err);
                    }else{
                        return resolve(results);
                    }
                });
            });
        }, Promise.resolve());
    }).then(data=>{
        conn.disconnect();
        return new Promise((resolve,reject)=>{
           console.log(`Logging in as ${req.body.hdiContainer}_USER_DT...`);
           conn.connect({
                serverNode  : req.body.dbServerNode,
                uid         : `${req.body.hdiContainer}_USER_DT`,
                pwd         : hdiDTPassword
            }, err => {
                if(err) return reject(err); 
                return resolve(conn);
            });
        });
    }).then(data=>{
        console.log(`HDI Container created!`);
        console.log(`Configuring default libraries for HDI Container "${req.body.hdiContainer}"...`);
        return new Promise((resolve,reject)=>{
            conn.exec(`CALL ${hdiContainer}#DI.CONFIGURE_LIBRARIES(_SYS_DI.T_DEFAULT_LIBRARIES, _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);`,null,(err,results)=>{
                if(err) return reject(err);
                return resolve(results);
            });
        });
    }).then(data=>{
        console.log(`HDI Container libraries configured.`);
        res.status(200);
        res.json({
            success : true,
            message : `HDI Container "${hdiContainer} created.`
        });
        res.end();
    })
    .catch(err=>{
        console.log('AN ERROR OCCURED.\n\n');
        console.log(err);
        res.status(500);
        res.json(err);
        res.end();
    });
});

module.exports = router;