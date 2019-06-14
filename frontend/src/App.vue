<template>
  <div>
    <v-app>
      <LoadingDialog v-model="loading" message="Loading, please wait..."/>
      <ErrorDialog v-model="error" :message="errorMessage" :details="errorDetails" :allowClose="errorAllowClose"/>
      <RunningApp v-if="config.config.configured == true"/>
      <!--<SetupWizard v-if="config.status == 'initial'"/>-->
      <MissingEnv :title="missing.title" :message="missing.message" :missing="missing.items" v-if="missing.missing == true"/>
    </v-app>
  </div>
</template>
<script>
  import SetupWizard from '@/SetupWizard';
  import RunningApp from '@/RunningApp';
  import LoadingDialog from '@/components/LoadingDialog';
  import ErrorDialog from '@/components/ErrorDialog';
  import MissingEnv from '@/MissingEnv';

  import axios from 'axios';
  export default {
    name: 'App',
    components: {
        RunningApp, SetupWizard, LoadingDialog, ErrorDialog, MissingEnv
    },
    data () {
      return {
        loading : true,
        error : false,
        errorDetails : null,
        errorMessage : '',
        errorAllowClose : true,
        missing : {
          missing : false,
          title : "Missing Configuration",
          message : "Missing Message"
        },
        config : {
          config : {}
        }
      };
    },
    methods : {
      getConfig (){
        axios.post(process.env.VUE_APP_HANA_APP_BACKEND + '/api/getconfig/',{ }).then(res=>{
          this.loading = false;
          this.config = res.data;
          this.$store.commit("SET_CONFIG", res.data);
          // this.config.title="Missing Backend Environment Variables";
          // this.config.message=`The following environment variables need to be set in your backend application running on ${process.env.VUE_APP_HANA_APP_BACKEND}.`;
        },err=>{
          this.errorDetails = (err.response)?err.response.data:err;
          this.loading = false;
          if(this.errorDetails.status=="missingenv"){
            this.missing.missing=true;
            this.missing.message="The following environment variables need to be set in your backend.";
            this.missing.items = this.errorDetails.missing;
            this.missing.title = "Missing Backend Enviornment Variables";
          }else{
            this.error = true;
            this.errorMessage = "An Error occured while trying to read the application configuration.  Please ensure your application configuration is pointing to a valid directory.";
            this.errorAllowClose = false;
          }
        });
      }
    },
    mounted(){
      if(!process.env.VUE_APP_HANA_APP_BACKEND) {
        this.loading = false;
        this.error = true;
        this.missing.missing=true;
        this.missing.message="The following environment variables need to be set in your frontend application.";
        this.missing.title="Missing Frontend Environment Variables";
        this.missing.items=[{
          field : "VUE_APP_HANA_APP_BACKEND",
          desc : "Backend hostname:[port]"
        }];
      }else{
        this.getConfig();
      }
    }
};
</script>