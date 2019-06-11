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
    `dbServerNode,tenantAuthUser,tenantAuthPassword,tenantDB,authUser,authPassword,systemDBServerNode,hdiAdmin,hdiAdminPassword`.split(',').map(e=>{
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
    }).then(data=>{
        return new Promise((resolve,reject)=>{
            // Get Service counts for tenant DB
            conn.exec(`SELECT
            SUM(CASE WHEN SERVICE_NAME = 'diserver' THEN 1 ELSE 0 END) AS diserver,
            SUM(CASE WHEN SERVICE_NAME = 'docstore' THEN 1 ELSE 0 END) AS docstore,
            SUM(CASE WHEN SERVICE_NAME = 'scriptserver' THEN 1 ELSE 0 END) AS scriptserver,
            SUM(CASE WHEN SERVICE_NAME = 'dpserver' THEN 1 ELSE 0 END) AS dpserver
            FROM SYS_DATABASES.M_SERVICES 
            WHERE DATABASE_NAME='${req.body.tenantDB}' AND ACTIVE_STATUS = 'YES'
            ;`, null, (err, results)=>{ 
                if (err) return reject(err);
                // We can run these all async so let's make a Promise array
                let promises = [];
                console.log(`Service counts: ${JSON.stringify(results[0])}`);
                // Only make a promise if the service count is 0.
                if(results[0].DISERVER==0){
                    promises.push(new Promise((resolve,reject)=>{
                        console.log(`Enabling diserver for Tenant DB ${req.body.tenantDB}...`);
                        conn.exec(`ALTER DATABASE HXE ADD 'diserver';`, null, (err,results)=>{
                            if(err) return reject(err);
                            console.log(`diserver added.`);
                            resolve(`diserver added.`);
                        });                        
                    }));
                }
                // Only make a promise if the service count is 0.
                if(results[0].DPSERVER==0){
                    promises.push(new Promise((resolve,reject)=>{
                        console.log(`Enabling dpserver for Tenant DB ${req.body.tenantDB}...`);
                        conn.exec(`ALTER DATABASE HXE ADD 'dpserver';`, null, (err,results)=>{
                            if(err) return reject(err);
                            console.log(`dpserver added.`);
                            resolve(`dpserver added.`);
                        });                        
                    }));
                }
                // Only make a promise if the service count is 0.
                if(results[0].DOCSTORE==0){
                    promises.push(new Promise((resolve,reject)=>{
                        console.log(`Enabling docstore for Tenant DB ${req.body.tenantDB}...`);
                        conn.exec(`ALTER DATABASE HXE ADD 'docstore';`, null, (err,results)=>{
                            if(err) return reject(err);
                            console.log(`docstore added.`);
                            resolve(`docstore added.`);
                        });                        
                    }));
                }
                // Only make a promise if the service count is 0.
                if(results[0].SCRIPTSERVER==0){
                    promises.push(new Promise((resolve,reject)=>{
                        console.log(`Enabling scriptserver for Tenant DB ${req.body.tenantDB}...`);
                        conn.exec(`ALTER DATABASE HXE ADD 'scriptserver';`, null, (err,results)=>{
                            if(err) return reject(err);
                            console.log(`scriptserver added.`);
                            resolve(`scriptserver added.`);
                        });
                    }));
                }
                return Promise.all(promises).then(data=>{
                    console.log(`Activated the following services that were needed:\n${JSON.stringify(data)}`);
                    resolve(data);
                })
                .catch(err=>{
                    console.log(`An error occurred while enabling services:\n${JSON.stringify(err)}`);
                    reject(err);
                })
            });
        });
    }).then(data=>{
        conn.disconnect();
        console.log(`Connecting to Tenant DB Node ${req.body.dbServerNode} as ${req.body.tenantAuthUser}...`);
        
        return new Promise((resolve,reject)=>{
            conn.connect({
                serverNode  : req.body.dbServerNode,
                uid         : req.body.tenantAuthUser,
                pwd         : req.body.tenantAuthPassword
            }, function(err) {
                if (err) return reject(err);
                resolve(conn);
            });
        });
    }).then(data=>{
        console.log(`Creating HDI Administrator ${req.body.hdiAdmin} and assigning rights...`);
        return `CREATE USER ${req.body.hdiAdmin} PASSWORD "${req.body.hdiAdminPassword}" NO FORCE_FIRST_PASSWORD_CHANGE;
            GRANT USER ADMIN to ${req.body.hdiAdmin};
            CREATE LOCAL TEMPORARY TABLE #PRIVILEGES LIKE _SYS_DI.TT_API_PRIVILEGES;
            INSERT INTO #PRIVILEGES (PRINCIPAL_NAME, PRIVILEGE_NAME, OBJECT_NAME) SELECT '${req.body.tenantAuthUser}', PRIVILEGE_NAME, OBJECT_NAME FROM _SYS_DI.T_DEFAULT_DI_ADMIN_PRIVILEGES;
            INSERT INTO #PRIVILEGES (PRINCIPAL_NAME, PRIVILEGE_NAME, OBJECT_NAME) SELECT '${req.body.hdiAdmin}', PRIVILEGE_NAME, OBJECT_NAME FROM _SYS_DI.T_DEFAULT_DI_ADMIN_PRIVILEGES;
            CALL _SYS_DI.GRANT_CONTAINER_GROUP_API_PRIVILEGES('_SYS_DI', #PRIVILEGES, _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);
            DROP TABLE #PRIVILEGES;`.split('\n').reduce( async (previousPromise, nextStatement) => {
                await previousPromise;
                return new Promise((resolve,reject)=>{
                    console.log(`Running:\t${nextStatement}...`);
                    conn.exec(nextStatement,null,(err,results)=>{
                        if(err && err.code != 331) {
                            console.log(`Failed on command ${nextStatement} with error: ${JSON.stringify(err)}`);
                            return reject(err);
                        }else{
                            resolve(results);
                        }
                    });
                });
            }, Promise.resolve());
    }).then(data=>{
        console.log(`Done creating ${req.body.hdiAdmin} and assigning rights`);
        res.status(200);
        res.json({
            success : true,
            message : "All tasks completed."
        });
        res.end();
    }).catch((err)=>{
        console.log(`An error occured while trying to read services:\n${JSON.stringify(err)}`);
        res.status(500);
        res.json(err);
        console.log(err);
        res.end();
    });
});

module.exports = router;