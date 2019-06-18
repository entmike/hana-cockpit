<template>
  <div>
    <LoadingDialog v-model="loading.loading" :message="loading.message"/>
    <ErrorDialog v-model="error.error" :message="error.message" :details="error.details"/>
    <v-form ref="form" v-model="valid" lazy-validation>
        <v-card>
            <v-toolbar flat dark color="primary">
                <v-toolbar-title>Configuration File: {{config.location}}</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <span></span>
                <v-text-field required type="password" :rules="requiredRules" label="Backend Password" v-model="backendPassword"/>
                <v-text-field label="Default System DB Node" v-model="config.config.systemDbNode" />
                <v-text-field label="Default Tenant DB Node" v-model="config.config.tenantDbNode"/>
                <v-text-field label="Default Tenant DB Name" v-model="config.config.tenantDbName"/>
                <v-text-field label="Default HDI Admin User" v-model="config.config.hdiAdminUser"/>
                <v-text-field label="Default Authorization User" v-model="config.config.authUser"/>
                <v-divider/>
                <v-text-field label="Default Deploy DB Host" v-model="config.config.deployDbHost" />
                <v-text-field label="Default Deploy DB Port" v-model="config.config.deployDbPort" />
                <v-text-field label="Default Deploy DB Tenant Name" v-model="config.config.deployTenantDB" />
                <v-text-field label="Default Deploy Target Container" v-model="config.config.deployTargetContainer" />
            </v-card-text>
            <v-card-actions>
              <v-btn color="error" flat @click="resetConfig()">Reset</v-btn>
              <v-spacer />
              <v-btn color="primary" flat @click="saveConfig()">Save</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
  </div>
</template>

<script>
    import ErrorDialog from '@/components/ErrorDialog';
    import LoadingDialog from '@/components/LoadingDialog';

    import axios from 'axios';

    export default {
        name: 'Preferences',
        sockets : {
            connect () {
                console.log("Preferences Connection established.");
            },
            disconnect () {
                console.log("Preferences Connection ended.");
            }
        },
        props : { },
        methods : {
            resetConfig () {
                this.config = JSON.parse(JSON.stringify(this.$store.getters.config));
            },
            saveConfig () {
                if(!this.$refs.form.validate()){
                    return;
                }
                this.loading.loading = true;
                this.loading.message = "Saving configuration..."
                console.log(this.config);
                axios.post(process.env.VUE_APP_HANA_APP_BACKEND + '/api/saveconfig/',{
                        backendPassword : this.backendPassword,
                        config : this.config
                    }).then(res=>{
                    this.loading.loading = false;
                    this.$store.commit("SET_CONFIG", this.config);
                },err=>{
                    this.loading.loading = false;
                    this.error.error = true;
                    this.error.details = (err.response)?err.response.data:err;
                    this.error.message = "An Error occured while trying to save the application configuration.  See details for more information.";
                    this.error.allowClose = true;
                });
            }
        },
        mounted () {
            this.resetConfig();
        },
        data: () => ({
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
        }),
        components: { LoadingDialog, ErrorDialog }
    }
</script>