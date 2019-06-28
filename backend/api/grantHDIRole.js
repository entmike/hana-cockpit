const express = require('express');
const router = express.Router();
const cors = require('cors');
const hana = require('@sap/hana-client');
const formidable = require('formidable');

router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    const utils = require('../utils')({
        spam : true    // Set to true to debug on console
    });
    let conn = hana.createConnection();
    let fields = null;
    return new Promise((resolve,reject)=>{
        let form = new formidable.IncomingForm();
        form.parse(req,(err,fields,file)=>{
            var pass = true;
            var missing = [];
            `hdiDTUser,hdiDTPassword,dbServerNode,user`.split(',').map(e=>{
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
        return new Promise((resolve,reject)=>{
            conn.connect({
                serverNode  : fields.dbServerNode,
                uid         : fields.hdiDTUser,
                pwd         : fields.hdiDTPassword
            }, function(err) {
                if (err) return(reject(err));
                resolve();
            });
        });
    }).then(()=>{
        return `SET SCHEMA "${fields.hdiContainer}#DI";
        CREATE LOCAL TEMPORARY COLUMN TABLE #ROLES LIKE _SYS_DI.TT_SCHEMA_ROLES;
        INSERT INTO #ROLES ( ROLE_NAME, PRINCIPAL_SCHEMA_NAME, PRINCIPAL_NAME ) VALUES ( '${fields.role}', '', '${fields.user}' );
        CALL ${fields.hdiContainer}#DI.GRANT_CONTAINER_SCHEMA_ROLES(#ROLES, _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);`
        .split('\n').reduce( async (previousPromise, nextLine) => {
            let nextStatement = nextLine.replace(/^[ \t]+/,'');
            await previousPromise;
            return new Promise((resolve,reject)=>{
                utils.log(`Running:\t${nextStatement}...`)
                conn.exec(nextStatement,null,(err,results)=>{
                    if(err && err.code != 331) {
                        console.log(`Failed on command ${nextStatement} with error: ${JSON.stringify(err)}`);
                        return reject(err);
                    }else{
                        return resolve(results);
                    }
                });
            });
        }, Promise.resolve())
    }).then(data=>{
        let log = [];
        let error = false;
        data.map(row=>{
            if(row.SEVERITY=='ERROR') error = true;
            log.push(row.MESSAGE);
        })
        let errLog = log.join('\n');
        if(error) throw errLog;
        utils.log(log.join('\n'));
        res.status(200);
        res.json({
            success : true,
            message : utils.log().join('\n')
        });
        res.end();
    }).catch(err=>{
        console.log(`Grant failed\n\n${JSON.stringify(err)}`);
        res.status(500);
        res.json(err);
        res.end();
    });
});

module.exports = router;