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
    let obj = {};
    return new Promise((resolve,reject)=>{
        let form = new formidable.IncomingForm();
        form.parse(req,(err,fields,file)=>{
            var pass = true;
            var missing = [];
            `authUser,authPassword,dbServerNode`.split(',').map(e=>{
                if(!fields[e]) {
                    pass = false;
                    missing.push(e);
                }
            });
            if(!pass){
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
                uid         : fields.authUser,
                pwd         : fields.authPassword
            }, function(err) {
                if (err) return(reject(err));
                resolve();
            });
        });
    }).then(()=>{
        return new Promise((resolve,reject)=>{
            conn.exec(`SELECT NAME AS KEY, VALUE AS VAL FROM M_SYSTEM_OVERVIEW;`, null, (err,results)=>{
                if (err) return reject(err);
                resolve(results);
            });
        });
    }).then((data)=>{
        obj.systemOverview = data;
        utils.log(`System Overview read succeeded.`);
        return new Promise((resolve,reject)=>{
            conn.exec(`SELECT s.ACTIVE_STATUS, s.HOST, s.PORT, s.SERVICE_NAME, s.PROCESS_ID, s.DETAIL, s.SQL_PORT, s.COORDINATOR_TYPE,
                m.PHYSICAL_MEMORY_SIZE, m.TOTAL_MEMORY_USED_SIZE, m.EFFECTIVE_ALLOCATION_LIMIT FROM M_SERVICES s 
                LEFT OUTER JOIN M_SERVICE_MEMORY m ON s.HOST = m.HOST AND s.PORT = m.PORT AND s.SERVICE_NAME = m.SERVICE_NAME;`.replace(/\n/g,''), null, (err,results)=>{
                if (err) return reject(err);
                resolve(results);
            });
        });
    }).then((data)=>{
        obj.services = data;
        utils.log(`Services read succeeded.`);
        return new Promise((resolve,reject)=>{
            conn.exec(`SELECT v.HOST, v.PORT, v.SERVICE_NAME, v.VOLUME_ID, f.FILE_NAME, f.USED_SIZE, s.DISK_ID, d.PATH, d.USAGE_TYPE, s.DISK_ID, s.LOG_SIZE as SIZE
            FROM M_VOLUMES v 
            LEFT OUTER JOIN M_VOLUME_SIZES s ON v.VOLUME_ID = s.VOLUME_ID
            LEFT OUTER JOIN M_VOLUME_files f ON v.VOLUME_ID = f.VOLUME_ID
            LEFT OUTER JOIN M_DISKS d ON d.DISK_ID = s.DISK_ID
            WHERE d.USAGE_TYPE = 'LOG' AND f.FILE_TYPE = 'LOG'
         UNION
         SELECT v.HOST, v.PORT, v.SERVICE_NAME, v.VOLUME_ID, f.FILE_NAME, f.USED_SIZE, s.DISK_ID, d.PATH, d.USAGE_TYPE, s.DISK_ID, s.DATA_SIZE as SIZE
            FROM M_VOLUMES v 
            LEFT OUTER JOIN M_VOLUME_SIZES s ON v.VOLUME_ID = s.VOLUME_ID
            LEFT OUTER JOIN M_VOLUME_files f ON v.VOLUME_ID = f.VOLUME_ID
            LEFT OUTER JOIN M_DISKS d ON d.DISK_ID = s.DISK_ID
            WHERE d.USAGE_TYPE = 'DATA' AND f.FILE_TYPE = 'DATA';`.replace(/\n/g,''), null, (err,results)=>{
                if (err) return reject(err);
                resolve(results);
            });
        });
    }).then(data=>{
        obj.volumes = data;
        utils.log(`Volumes read succeeded.`);
        console.log(data);
        obj.success = true;
        res.status(200);
        res.json(obj);
        res.end();
    }).catch(err=>{
        utils.log(`Overview failed\n\n${JSON.stringify(err)}`);
        res.status(500);
        res.json(err);
        res.end();
    });
});

module.exports = router;