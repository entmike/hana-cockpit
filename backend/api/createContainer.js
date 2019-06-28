const express = require('express');
const formidable = require('formidable');
const router = express.Router();
const cors = require('cors');
const hana = require('@sap/hana-client');

router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    const utils = require('../utils')({
        spam : false    // Set to true to debug on console
    });
    let conn = hana.createConnection();
    let fields = null;
    new Promise((resolve,reject)=>{
        let form = new formidable.IncomingForm();
        form.parse(req,(err,fields,file)=>{
            var pass = true;
            var missing = [];
            `authUser,authPassword,hdiAdmin,hdiAdminPassword,dbServerNode,hdiContainer,hdiUserPassword`.split(',').map(e=>{
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
                return resolve({fields,file});
            }            
        });
    }).then(data=>{
        fields = data.fields;
        utils.log(`Logging in as ${fields.authUser} to create DT/RT users...`);
        return new Promise((resolve,reject)=>{
            conn.connect({
                serverNode  : fields.dbServerNode,
                uid         : fields.authUser,
                pwd         : fields.authPassword
            }, err => {
                if(err) return reject(err); 
                return resolve();
            });
        })
    }).then(()=>{
        utils.log(`Connected as ${fields.authUser}.`);
        return Promise.all([
            new Promise((resolve,reject)=>{
                utils.log(`Creating user '${fields.hdiContainer}_USER_DT'...`);
                conn.exec(`CREATE USER ${fields.hdiContainer}_USER_DT PASSWORD "${fields.hdiUserPassword}" NO FORCE_FIRST_PASSWORD_CHANGE;`,null,(err,results)=>{
                    if(err && err.code!=331) return reject(err);
                    return resolve(results);
                });
            }),
            new Promise((resolve,reject)=>{
                utils.log(`Creating user '${fields.hdiContainer}_USER_RT'...`);
                conn.exec(`CREATE USER ${fields.hdiContainer}_USER_RT PASSWORD "${fields.hdiUserPassword}" NO FORCE_FIRST_PASSWORD_CHANGE;`,null,(err,results)=>{
                    if(err && err.code!=331) return reject(err);
                    return resolve(results);
                });
            })
        ]);
    }).then(data=>{
        utils.log(`User creation complete.  Logging out as ${fields.authUser}`);
        conn.disconnect();
        return new Promise((resolve,reject)=>{
            utils.log(`Logging in as ${fields.hdiAdmin} to create container '${fields.hdiContainer}'...`);
            conn.connect({
                serverNode  : fields.dbServerNode,
                uid         : fields.authUser,
                pwd         : fields.authPassword
            }, err => {
                if(err) return reject(err); 
                return resolve(conn);
            });
        });
    }).then(conn=>{
        utils.log(`Connected as ${fields.hdiAdmin}.`);
        utils.log(`Creating HDI Container "${fields.hdiContainer}"...`);
        return new Promise((resolve,reject)=>{
            conn.exec(`CALL _SYS_DI.CREATE_CONTAINER('${fields.hdiContainer}', _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);`,null,(err,results)=>{
                if(err) return reject(err);
                return resolve(results);
            });
        });
    }).then(data=>{
        utils.log(`HDI Container "${fields.hdiContainer}" creation task complete.`);
        let log = [];
        let error = false;
        data.map(row=>{
            if(row.SEVERITY=='ERROR') error = true;
            log.push(row.MESSAGE);
        })
        let errLog = log.join('\n');
        if(error) throw errLog;
        utils.log(log.join('\n'));
        
        utils.log(`Assigning privileges to HDI Users (RT/DT)...`);
        return `CREATE LOCAL TEMPORARY TABLE #PRIVILEGES LIKE _SYS_DI.TT_API_PRIVILEGES;
        INSERT INTO #PRIVILEGES (PRIVILEGE_NAME, OBJECT_NAME, PRINCIPAL_NAME) SELECT PRIVILEGE_NAME, OBJECT_NAME, '${fields.hdiContainer}_USER_DT' AS PRINCIPAL_NAME FROM _SYS_DI.T_DEFAULT_CONTAINER_ADMIN_PRIVILEGES;
        CALL _SYS_DI.GRANT_CONTAINER_API_PRIVILEGES('${fields.hdiContainer}', #PRIVILEGES, _SYS_DI.T_NO_PARAMETERS, ?, ?, ?)
        DROP TABLE #PRIVILEGES;
        CREATE LOCAL TEMPORARY TABLE #SCHEMA_PRIV LIKE _SYS_DI.TT_SCHEMA_PRIVILEGES;
        INSERT INTO #SCHEMA_PRIV VALUES ('SELECT', '', '${fields.hdiContainer}_USER_RT');
        CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${fields.hdiContainer}', #SCHEMA_PRIV, _SYS_DI.T_NO_PARAMETERS, ?, ?, ?)
        DROP TABLE #SCHEMA_PRIV`
        .split('\n').reduce( async (previousPromise, nextLine) => {
            let nextStatement = nextLine.replace(/^[ \t]+/,'');
            await previousPromise;
            return new Promise((resolve,reject)=>{
                utils.log(`Running:\t${nextStatement}...`)
                conn.exec(nextStatement,null,(err,results)=>{
                    if(err && err.code != 331) {
                        utils.log(`Failed on command ${nextStatement} with error: ${JSON.stringify(err)}`);
                        return reject(err);
                    }else{
                        return resolve(results);
                    }
                });
            });
        }, Promise.resolve());
    }).then(data=>{
        utils.log(`Logging out as ${fields.hdiAdmin}`);
        conn.disconnect();
        return new Promise((resolve,reject)=>{
           utils.log(`Logging in as ${fields.hdiContainer}_USER_DT...`);
           conn.connect({
                serverNode  : fields.dbServerNode,
                uid         : `${fields.hdiContainer}_USER_DT`,
                pwd         : fields.hdiUserPassword
            }, err => {
                if(err) return reject(err); 
                return resolve(conn);
            });
        });
    }).then(data=>{
        utils.log(`Configuring default libraries for HDI Container "${fields.hdiContainer}"...`);
        return new Promise((resolve,reject)=>{
            conn.exec(`CALL ${fields.hdiContainer}#DI.CONFIGURE_LIBRARIES(_SYS_DI.T_DEFAULT_LIBRARIES, _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);`,null,(err,results)=>{
                if(err) return reject(err);
                return resolve(results);
            });
        });
    }).then(data=>{
        utils.log(`HDI Container libraries configured.  Job complete.`);
        res.status(200);
        res.json({
            success : true,
            message : utils.log().join("\n")
        });
        res.end();
    })
    .catch(err=>{
        utils.log('AN ERROR OCCURED.\n\n');
        console.log(err);
        res.status(500);
        res.json(err);
        res.end();
    });
});

module.exports = router;