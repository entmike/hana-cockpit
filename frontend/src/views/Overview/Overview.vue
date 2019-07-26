<template>
  <div>
    <LoadingDialog v-model="loading.loading" :message="loading.message"/>
    <ErrorDialog v-model="error.error" :message="error.message" :details="error.details"/>
        <v-card>
            <v-card-text>
                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-layout row>
                        <v-text-field v-model="value.tenantDBNode" :rules="requiredRules" label="DB Server Node" required />
                        <v-text-field v-model="value.authUser" :rules="requiredRules" label="HANA User" required />
                        <v-text-field v-model="value.authPassword"  type="password" :rules="requiredRules" label="HANA Password" required />
                    </v-layout>
                    <v-btn color="primary" flat @click="getOverview()">Get Overview</v-btn>
                </v-form>
            </v-card-text>
        </v-card>

        <v-card v-if="overview.success">
            <v-toolbar flat dark color="primary">
                <v-toolbar-title>Overview</v-toolbar-title>
            </v-toolbar>
            <v-tabs vertical>
                <v-tab>Overview</v-tab>
                <v-tab-item>
                    <v-card flat>
                        <v-card-text>
                            <v-list two-line>
                            <template v-for="(item,index) in overview.systemOverview">
                                <v-list-tile :key="index">
                                <v-list-tile-content>
                                    <v-list-tile-title v-html="item.KEY"></v-list-tile-title>
                                    <v-list-tile-sub-title v-html="item.VAL"></v-list-tile-sub-title>
                                </v-list-tile-content>
                                </v-list-tile>
                            </template>
                            </v-list>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
                <v-tab>Landscape</v-tab>
                <v-tab-item>
                    <v-card flat>
                        <v-card-text>
                            <v-data-table
                                :headers="headers.services"
                                :items="overview.services"
                                :pagination.sync="paginationOptions"
                                class="elevation-1">
                                <template v-slot:items="props">
                                    <td>{{props.item.ACTIVE_STATUS}}</td>
                                    <td>{{props.item.HOST}}</td>
                                    <td>{{props.item.PORT}}</td>
                                    <td>{{props.item.SERVICE_NAME}}</td>
                                    <td>{{props.item.DETAIL}}</td>
                                    <td>{{props.item.PROCESS_ID}}</td>
                                    <td>{{Math.round(props.item.TOTAL_MEMORY_USED_SIZE / 1024 / 1024 / 1024 * 10) / 10 }} GB</td>
                                    <td>{{Math.round(props.item.EFFECTIVE_ALLOCATION_LIMIT / 1024 / 1024 / 1024 * 10) / 10 }} GB</td>
                                    <td>{{Math.round(props.item.PHYSICAL_MEMORY_SIZE / 1024 / 1024 / 1024 * 10) / 10 }} GB</td>                                    
                                </template>
                            </v-data-table>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
                <v-tab>Volumes</v-tab>
                <v-tab-item>
                    <v-card flat>
                        <v-card-text>
                            <v-data-table
                                :headers="headers.volumes"
                                :items="overview.volumes"
                                :pagination.sync="paginationOptions"
                                class="elevation-1">
                                <template v-slot:items="props">
                                    <td>{{props.item.HOST}}</td>
                                    <td>{{props.item.PORT}}</td>
                                    <td>{{props.item.SERVICE_NAME}}</td>
                                    <td>{{props.item.VOLUME_ID}}</td>
                                    <td>{{props.item.SIZE}}</td>
                                    <td>{{props.item.DISK_ID}}</td>
                                    <td>{{props.item.USAGE_TYPE}}</td>
                                    <td>{{props.item.PATH}}</td>
                                    <td>{{props.item.FILE_NAME}}</td>
                                    <td>{{props.item.USED_SIZE}}</td>
                                </template>
                            </v-data-table>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
            </v-tabs>
        </v-card>
  </div>
</template>

<script>
    import ErrorDialog from '@/components/ErrorDialog';
    import LoadingDialog from '@/components/LoadingDialog';

    import axios from 'axios';

    export default {
        name: 'Overview',
        sockets : {
            connect () {
                // console.log("Overview Connection established.");
            },
            disconnect () {
                // console.log("Overview Connection ended.");
            }
        },
        props : { },
        methods : {
            getOverview () {
                if(!this.$refs.form.validate()){
                    return;
                }
                this.loading.loading = true;
                this.loading.message = "Getting Overview..."
                axios.post(process.env.VUE_APP_HANA_APP_BACKEND + '/api/overview/',{
                    dbServerNode : this.value.tenantDBNode,
                    authUser : this.value.authUser,
                    authPassword : this.value.authPassword                        
                }).then((res)=>{
                    this.loading.loading = false;
                    this.overview = res.data;
                },err=>{
                    this.loading.loading = false;
                    this.error.error = true;
                    this.error.details = (err.response)?err.response.data:err;
                    this.error.message = "An Error occured while trying to save get the database overview.";
                    this.error.allowClose = true;
                });
            }
        },
        mounted () { },
        data () {
            let systemDBNode = this.$store.getters.config.config.systemDbNode || process.env.VUE_APP_HANA_SYSTEMNODE || 'localhost:39017';
            let tenantDBNode = this.$store.getters.config.config.tenantDbNode || process.env.VUE_APP_HANA_TENANTNODE || 'localhost:39041';
            let tenantDBName = this.$store.getters.config.config.tenantDbName || process.env.VUE_APP_HANA_TENANTDBNAME || 'HXE'; 
            let authUser = this.$store.getters.config.config.authUser || process.env.VUE_APP_HANA_AUTHUSER || 'SYSTEM';  
            return {
                value : {
                    systemDBNode, tenantDBNode, tenantDBName, authUser
                },
                paginationOptions : {
                    rowsPerPage:-1
                },
                headers : {
                    services : [
                        {text : "Active", value : "ACTIVE_STATUS"},
                        {text : "Host", value : "HOST"},
                        {text : "Port", value : "PORT"},
                        {text : "Service", value: "SERVICE_NAME"},
                        {text : "Detail", value: "DETAIL"},
                        {text : "Process ID", value: "PROCESS_ID"},
                        {text : "Total Memory Used (GB)", value: "TOTAL_MEMORY_USED_SIZE"},
                        {text : "Effective Alloc. Limit (GB)", value: "EFFECTIVE_ALLOCATION_LIMIT"},
                        {text : "Physical Memory Size (GB)", value: "PHYSICAL_MEMORY_SIZE"}
                    ],
                    volumes : [
                        {text : "Host", value : "HOST"},
                        {text : "Port", value : "PORT"},
                        {text : "Service/Volume", value : "SERVICE_NAME"},
                        {text : "Volume ID", value : "VOLUME_ID"},
                        {text : "Volume Size", value : "SIZE"},
                        {text : "Disk ID", value : "DISK_ID"},
                        {text : "Disk Usage Type", value : "USAGE_TYPE"},
                        {text : "Disk Path", value : "PATH"},
                        {text : "File Name", value : "FILE_NAME"},
                        {text : "File Size", value : "USED_SIZE"}
                    ]
                },
                overview : { },
                valid : true,
                backendPassword : '',
                requiredRules: [
                    v => !!v || 'Field is required'
                ],
                loading : {
                    loading : false,
                    message : "Loading"
                },
                config : {
                    config : {}
                },
                error : {
                    error: false,
                    message : '',
                    allowClose: true
                }
            };
        },
        components: { LoadingDialog, ErrorDialog }
    }
</script>