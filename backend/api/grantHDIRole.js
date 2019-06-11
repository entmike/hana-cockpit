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
    `hdiDTUser,hdiDTPassword,dbServerNode,user`.split(',').map(e=>{
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
    conn.connect({
        serverNode  : req.body.dbServerNode,
        uid         : req.body.hdiDTUser,
        pwd         : req.body.hdiDTPassword
    }, function(err) {
        if (err) {
            conn.disconnect();
            console.log(`Error connecting: ${JSON.stringify(err)}`);
            res.status(500);
            res.json(err);
            res.end();
        }else{
            return `set schema "${req.body.hdiContainer}#DI";
            CREATE LOCAL TEMPORARY COLUMN TABLE #ROLES LIKE _SYS_DI.TT_SCHEMA_ROLES;
            INSERT INTO #ROLES ( ROLE_NAME, PRINCIPAL_SCHEMA_NAME, PRINCIPAL_NAME ) VALUES ( '${req.body.role}', '', '${req.body.user}' );
            CALL ${req.body.hdiContainer}#DI.GRANT_CONTAINER_SCHEMA_ROLES(#ROLES, _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);`
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
            }, Promise.resolve()).then(data=>{
                let log = [];
                let error = false;
                data.map(row=>{
                    if(row.SEVERITY=='ERROR') error = true;
                    log.push(row.MESSAGE);
                })
                let errLog = log.join('\n');
                if(error) throw errLog;
                console.log(log.join('\n'));
                console.log("Grant suceeded");
                res.status(200);
                res.json({
                    success : true,
                    message : `Role '${req.body.role}' grant to  '${req.body.user}' successful'.`
                });
                res.end();
            }).catch(err=>{
                console.log(`Grant failed\n\n${JSON.stringify(err)}`);
                res.status(500);
                res.json(err);
                res.end();
            });
        }
    });
});

module.exports = router;