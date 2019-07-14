#!/bin/bash

docker run --rm --env-file=./.env \
    --name hxe \
    --hostname hxe \
    -v $1:/hana/mounts \
    store/saplabs/hanaexpress:2.00.036.00.20190223.1 \
    --agree-to-sap-license \
    --master-password $2
