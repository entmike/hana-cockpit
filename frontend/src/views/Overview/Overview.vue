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
                        <v-text-field v-model="value.authPassword"  type="password":rules="requiredRules" label="HANA Password" required />
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
                <!-- TO DO
                <v-tab>Landscape</v-tab>
                <v-tab-item>
                    <v-card flat>
                        <v-card-text>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
                -->
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