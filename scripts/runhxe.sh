#!/bin/bash

docker run --rm --env-file=./.env \
    --name hxe \
    --hostname hxe \
    -v $1:/hana/mounts \
    -p 39013:39013 \
    -p 39015:39015 \
    -p 39017:39017 \
    -p 39041:39041 \
    -p 8090:8090 \
    store/saplabs/hanaexpress:2.00.036.00.20190223.1
