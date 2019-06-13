<template>
  <div>
    <v-app v-if="config.status==undefined">
      <LoadingDialog v-model="loading" message="Loading, please wait..."/>
      <ErrorDialog v-model="error" :message="errorMessage" :details="errorDetails"/>
    </v-app>
    <RunningApp v-if="config.status == 'configured'"/>
    <SetupWizard v-if="config.status == 'initial'"/>
    <MissingEnv :title=this.config.title :message=this.config.message :missing=this.config.missing v-if="config.status == 'missingenv'"/>
  </div>
</template>
<script>
  import SetupWizard from '@/SetupWizard';
  import RunningApp from '@/RunningApp';
  import LoadingDialog from '@/LoadingDialog';
  import ErrorDialog from '@/ErrorDialog';
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
        config : {}
      };
    },
    methods : {
      getConfig (){
        axios.post(process.env.VUE_APP_HANA_APP_BACKEND + '/api/getconfig/',{ }).then(res=>{
          this.loading = false;
          this.config = res.data;
          this.config.title="Missing Backend Environment Variables";
          this.config.message=`The following environment variables need to be set in your backend application running on {{process.env.VUE_APP_HANA_APP_BACKEND}}.`;
        },err=>{
          this.loading = false;
          this.error = true;
          this.errorDetails = (err.response)?err.response.data:err;
          this.errorMessage = "An Error occured while trying to communcate with the backend.";
        });
      }
    },
    mounted(){
      if(!process.env.VUE_APP_HANA_APP_BACKEND) {
        this.loading = false;
        this.error = true;
        this.config.status="missingenv";
        this.config.message="The following environment variables need to be set in your frontend application.";
        this.config.title="Missing Frontend Environment Variables";
        this.config.missing=[{
          field : "VUE_APP_HANA_APP_BACKEND",
          desc : "Backend hostname:[port]"
        }];
      }else{
        this.getConfig();
      }
    }
};
</script>