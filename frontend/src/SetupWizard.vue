<template>
    <v-app>
      <LoadingDialog v-model="loading" :message="loadingMessage"/>
      <ErrorDialog v-model="error" :message="errorMessage"/>
      <!-- Login Dialog -->
      <v-dialog v-model="authDialogVisible" persistent>
        <v-card>
          <v-card-title primary-title><h3 class="headline mb-0" >Authenticate</h3></v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <span>Enter your backend password to begin setup.</span>
            <v-form @submit="backendLogin()">
              <v-text-field v-model="backendPassword" type="password" :rules="requiredRules" label="Backend App Password" required/>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="blue darken-1" flat @click="backendLogin()">Authenticate</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- Setup Form -->
      <v-form v-show="authenticated" ref="form">
      <v-card>
        <v-card-title primary-title><h3 class="headline mb-0" >Application Setup</h3></v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <span>The following HANA parameter will be used during setup..</span>
            <v-list two-line>
              <template v-for="(item,index) in hanaenv">
                <v-list-tile :key="index">
                  <v-list-tile-content>
                    <v-list-tile-title v-html="item.field"></v-list-tile-title>
                    <v-list-tile-sub-title v-html="item.value"></v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>
            </v-list>
            <v-divider></v-divider>
            <span>Fill in the following user credentials in order to set up your application.</span>
            <v-layout row>
              <v-text-field
                v-model="formdata.users.systemDbServerNode"
                :rules="requiredRules"
                label="SYSTEMDB Server Node"
                required
              />
              <v-text-field
                v-model="formdata.users.systemDbAuthUser"
                :rules="requiredRules"
                label="SYSTEM DB Security Grantor User"
                required
              />
              <v-text-field
                v-model="formdata.users.systemDbAuthPassword"
                type="password"
                :rules="requiredRules"
                label="SYSTEM DB Security Grantor Password"
                required
              />
            </v-layout>
            <v-layout row>
              <v-text-field
                v-model="formdata.users.tenantDbAuthUser"
                :rules="requiredRules"
                label="TENANT DB Security Grantor User"
                required
              />
              <v-text-field
                v-model="formdata.users.tenantDbAuthPassword"
                type="password"
                :rules="requiredRules"
                label="TENANT DB Security Grantor Password"
                required
              />
            </v-layout>
          </v-card-text>
          <v-btn color="primary" @click="go">Next</v-btn>
        </v-card>
      </v-form>
    </v-app>
</template>

<script>
import axios from 'axios';
import LoadingDialog from '@/LoadingDialog';
import ErrorDialog from '@/ErrorDialog';
export default {
  name: 'SetupWizard',
  components : { LoadingDialog, ErrorDialog },
  props : { },
  computed : {
    hanaenv () {
      let a = [];
      if(this.config.env){
        `HANA_SERVERNODE,HANA_HDI_CONTAINER,HANA_UID`.split(',').map(f=>{
          a.push({
            field : f,
            value : this.config.env[f]
          });
        });        
      }
      return a;
    }
  },
  methods : {
    go(){
      this.$socket.emit('setupapp', {
        backendPassword : this.backendPassword,
        parameters : this.formdata
      });
    },
    backendLogin () {
      this.loadingMessage = "Authenticating...";
      this.loading = true;
      axios.post(process.env.VUE_APP_HANA_APP_BACKEND + '/api/getallconfig/',{backendPassword:this.backendPassword}).then(res=>{
        this.loading = false;
        this.config = res.data;
        this.authenticated = true;
        this.authDialogVisible = false;
      },err=>{
        this.loading = false;
        this.error = true;
        this.errorMessage = err;
      });
    }
  },
  data () {
    return { 
      formdata : {
        users : {
          systemDbAuthUser : "SYSTEM",
          tenantDbAuthUser : "SYSTEM"
        }
      },
      config : {},
      loading : false,
      loadingMessage : "",
      error : false,
      errorMessage : "",
      authDialogVisible : true,
      backendPassword : '',
      authenticated : false,
      e1: 0,
      requiredRules: [
          v => !!v || 'Field is required'
      ]
    };
  }
};
</script>

<style scoped>
</style>