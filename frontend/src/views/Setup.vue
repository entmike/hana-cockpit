<template>
  <div>
    <v-btn color="primary" raised @click="showEnv()">Environment Details</v-btn>
    <v-btn color="primary" :disabled="backendButtonDisabled" raised @click="showBackendEnv()">Backend Environment Details</v-btn>
    <!-- Error Dialog -->
    <v-dialog v-model="showError" persistent max-width="300">
      <v-card>
        <v-card-title class="headline">{{errorTitle}}</v-card-title>
        <v-card-text>{{errorMessage}}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="darken-1" flat @click="showError = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Environment Variables Dialog Box -->
    <v-dialog v-model="backendEnvVisible">
      <v-card>
        <v-card-title>Backend Environment</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-list two-line v-if="backendAuthed == true">
            <template v-for="(item,index) in backendEnvVars">
              <v-list-tile :key="index">
                <v-list-tile-content>
                  <v-list-tile-title v-html="item.key"></v-list-tile-title>
                  <v-list-tile-sub-title v-html="item.value"></v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
            </v-list>
            <v-form v-else @submit="backendLogin()">
              <v-text-field
                  v-model="backendPassword"
                  type="password"
                  :rules="requiredRules"
                  label="Backend App Password"
                  required/>
            </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click="backendEnvVisible=false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click="backendLogin()" v-show="backendAuthed==false">Authenticate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Environment Variables Dialog Box -->
    <v-dialog v-model="envVisible">
      <v-list two-line>
        <template v-for="(item,index) in envVars">
          <v-list-tile :key="index">
            <v-list-tile-content>
              <v-list-tile-title v-html="item.key"></v-list-tile-title>
              <v-list-tile-sub-title v-html="item.value"></v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
    </v-dialog>
    <!-- Loading Dialog Box -->
    <v-dialog v-model="loading" persistent width="300px" >
      <v-card color="primary">
        <v-card-text>
          <span>{{loadingMessage}}</span>
          <v-progress-linear indeterminate color="white" class="mb-0" />
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- Problem Details Dialog Box -->
    <v-dialog v-model="detailsVisible" scrollable max-width="300px">
      <v-card>
        <v-card-title>{{details.status}}</v-card-title>
        <v-divider></v-divider>
        <v-card-text>{{details.message}}</v-card-text>
      </v-card>
    </v-dialog>
    <!-- Fix Dialog Box -->
    <v-dialog v-model="fixVisible" scrollable>
      <v-card>
        <v-toolbar>
          <v-toolbar-title>Fix {{details.text}}</v-toolbar-title>
        </v-toolbar>
        <v-card-title><span>{{details.remedy.message}}</span></v-card-title>
        <v-card-text>
          <component ref="FixForm" :is="currentRemedy" v-model="details.remedy.defaults"/>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click="fixVisible=false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click="runRemedy(details)">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Check List -->
    <v-list two-line>
      <template v-for="(check,index) in checks">
        <v-list-tile :key="index">
          <v-list-tile-avatar>
            <v-icon
              :class="[check.iconClass]"
              v-text="check.icon"
            ></v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title v-html="check.text"></v-list-tile-title>
            <v-list-tile-sub-title v-html="check.message"></v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action v-show="check.remedy.component !== undefined">
            <v-btn color="info" ripple @click="openRemedy(index)">Fix</v-btn>
          </v-list-tile-action>
          <v-list-tile-action>
            <v-btn icon ripple @click="showDetails(index)"><v-icon color="blue lighten-1">info</v-icon></v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </template>
    </v-list>
  </div>
</template>

<script>
import axios from 'axios';
import SetupUser from './SetupUser';
export default {
  name: 'Error',
  data () {
    return {
      checks : [],
      details : {
        remedy : {}
      },
      currentRemedy: '',
      detailsVisible : false,
      fixVisible : false,
      loading : false,
      loadingMessage : '',
      envVisible : false,
      envVars : [],
      backendButtonDisabled : true,
      backendEnvVisible : false,
      backendEnvVars : [],
      backendAuthed : false,
      backendPassword : '',
      valid: true,
      showError: false,
      errorMessage : '',
      errorTitle : '',
      requiredRules: [
        v => !!v || 'Field is required'
      ],
    }
  },
  components: { 
    SetupUser
  },
  methods : {
    showEnv () {
      this.envVisible = true;
    },
    showBackendEnv () {
      this.backendEnvVisible = true;
    },
    openRemedy (index) {
      this.details = this.checks[index];
      this.currentRemedy = this.checks[index].remedy.component;
      this.fixVisible = true;
      if(this.$refs['FixForm']) this.$refs['FixForm'].$refs.form.resetValidation();
    },
    backendLogin () {
      this.loading=true;
      this.loadingMessage=`Authenticating...`;
      axios.post(`${process.env.VUE_APP_HANA_APP_BACKEND}/api/backendenv`,{backendPassword:this.backendPassword}).then(res=>{
        this.loading=false;
        this.backendAuthed = true;
        for(let key in res.data) {
          this.backendEnvVars.push({
            key : key,
            value : res.data[key]});
        }
        // alert(JSON.stringify(res.data));
      }, err=> {
        this.loading=false;
        this.showError = true;
        this.errorTitle = `Could not authenticate with password.`
        this.errorMessage = (err.response)?(err.response.data)?err.response.data:err.response:err;
      });
    },
    runRemedy(check){
       if(!this.$refs['FixForm'].$refs.form.validate()){
         return;
       }
      this.loading=true;
      this.loadingMessage=`Running Fix...`;
      axios.post(`${process.env.VUE_APP_HANA_APP_BACKEND}${check.remedy.endpoint}`,this.$refs['FixForm'].value).then(res=>{
        this.fixVisible = false;
        this.loading=false;
        //this.complete=true;
        /*this.apiResults={
          status : "Success",
          message : res.data.message
        }*/
      }, err=> {
        this.loading=false;
        this.showError = true;
        this.errorTitle = `Could not fix issue.`
        this.errorMessage = (err.response)?(err.response.data)?err.response.data:err.response:err;
      });
    },
    showDetails (index) {
      this.details = this.checks[index];
      this.detailsVisible = true;
    },
    parse(checks) {
      for(let check of checks){
        switch (check.status.toLowerCase()){
          case "pass":
          case "passed":
            check.iconClass = "green white--text"
            check.icon="check";
            break;
          case "fail":
          case "failed":
            check.iconClass = "red white--text"
            check.icon="error";
            break;
          default:
            check.iconClass = "grey white--text"
            check.icon="assignment";
        }
      }
      return checks;
    },
    diagnose () {
      this.loadingMessage = `Diagnosing application issues...`;
      this.loading = true;
      axios.post(`${process.env.VUE_APP_HANA_APP_BACKEND}/api/diagnose/`,{ }).then(res=>{
        this.loading = false;
        this.checks = this.parse(res.data);
        this.backendButtonDisabled = false;
      }, err=>{
        this.loading = false;
        this.checks = this.parse([{
            text : `Backend Connectivity Test`,
            status : `Fail`,
            message : `Could not connect with backend application API on ${process.env.VUE_APP_HANA_APP_BACKEND}.  Make sure that your application configuration is correct and the backend is running.`,
            remedy : { },
            data : {
              err : err
            }
        }]);
      });
    }
  },
  mounted () {
    for(let key in process.env) {
      this.envVars.push({
        key : key,
        value : process.env[key]});
    }
    this.diagnose();
  }
}
</script>