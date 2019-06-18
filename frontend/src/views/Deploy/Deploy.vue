<template>
  <div>
    <ErrorDialog v-model="error.error" :message="error.message" :details="error.details"/>
    <LoadingDialog v-model="loading" message="Loading, please wait..."/>
    <v-dialog v-model="complete" scrollable width="70%">
      <v-card>
        <v-card-title>{{apiResults.status}}</v-card-title>
        <v-divider></v-divider>
        <v-card-text><pre class='terminal'>{{apiResults.message}}</pre></v-card-text>
      </v-card>
    </v-dialog>
    <v-list two-line>
      <template v-for="(item,index) in deployOptions">
        <v-list-tile :key="index" @click="openDialog(item)">
          <v-list-tile-content>
            <v-list-tile-title v-html="item.option"></v-list-tile-title>
            <v-list-tile-sub-title v-html="item.description"></v-list-tile-sub-title>
          </v-list-tile-content>
          <v-dialog v-model="item.dialog" width="80%">
          <v-card>
            <v-toolbar flat dark color="primary">
              <v-toolbar-title>{{item.option}}</v-toolbar-title>
            </v-toolbar>
            <v-card-title><span>{{item.description}}</span></v-card-title>
            <v-card-text>
              <component :ref="item.option" v-bind:is="item.component" v-model="item.data"></component>
            </v-card-text>
            <v-card-actions>
              <v-btn color="error" flat @click="item.dialog=false">Close</v-btn>
              <v-spacer />
              <v-btn color="primary" flat @click="saveSomething(item)">Run</v-btn>
            </v-card-actions>
          </v-card>
          </v-dialog>
        </v-list-tile>
      </template>
    </v-list>
  </div>
</template>

<script>
import DeployDB from '@/views/Deploy/DeployDB';
import ErrorDialog from '@/components/ErrorDialog';
import LoadingDialog from '@/components/LoadingDialog';

import axios from 'axios';
export default {
  name: 'Deploy',
  sockets : {
    connect () {
      console.log("Deploy Connection established.");
    },
    disconnect () {
      console.log("Deploy Connection ended.");
    }
  },
  props : { },
  methods : {
    saveSomething(item){
      if(!this.$refs[item.option][0].$refs.form.validate()){
         return;
      }
      let comp = this.$refs[item.option][0];
      let formData = new FormData();
      for(let field in item.data){
        formData.append(field, item.data[field]);
        console.log(`Appending ${field}.`);
        console.log(item.data[field]);
      }
      if(item.fileFields){
        for(let field of item.fileFields){
          if(!comp[field]) return;
          formData.append(field, comp[field]);
          console.log(`Appending ${field}.`);
          console.log(comp[field]);
        }
      }
      console.log(formData);
      this.loading=true;
      this.loadingMessage=item.loadingMessage;
      axios.post(`${process.env.VUE_APP_HANA_APP_BACKEND}${item.endpoint}`,formData,item.endpointHeaders||{}).then(res=>{
        item.dialog = false;
        this.loading=false;
        this.complete=true;
        this.apiResults={
          status : "Success",
          message : res.data.message
        }
      }, err=> {
        this.loading=false;
        // this.complete=true;
        this.error.error=true;
        this.error.message = `Could not successfully complete the task '${item.option}.'`;
        this.error.details = (err.response)?(err.response.data)?err.response.data:err.response:err
      });
    },
    openDialog(item){
      this.$refs[item.option][0].$refs.form.resetValidation();
      item.data=JSON.parse(JSON.stringify(item.defaults));
      item.dialog=true;
    }
  },
  mounted () { },
  data () {
    let dbHost = this.$store.getters.config.config.deployDbHost || process.env.VUE_APP_HANA_DEPLOYDBHOST || 'localhost';
    let dbPort = this.$store.getters.config.config.deployDbPort || process.env.VUE_APP_HANA_DEPLOYDBPORT || '39041';
    let dbName = this.$store.getters.config.config.deployTenantDb || process.env.VUE_APP_HANA_DEPLOYTENANTDB || 'HXE'; 
    let targetContainer = this.$store.getters.config.config.deployTargetContainer || process.env.VUE_APP_HANA_DEPLOYTARGETCONTAINER || 'CONTAINER_NAME'; 

    return {
    loading : false,
    loadingMessage : '',
    apiResults : {},
    complete : false,
    error : {
      error : false,
      message : null,
      details : null
    },    
    deployOptions : [
      {
        option : "Deploy a DB Module",
        // socket : true,
        description : "Deploy a DB module to an HDI Container",
        loadingMessage : "Deploying Module...",
        dialog : false,
        component : DeployDB,
        data : { },
        endpoint : '/api/deployDB',
        endpointHeaders : {
          'Content-Type': 'multipart/form-data'
        },
        fileFields : ["dbZip"],
        defaults : {
          dbServerHost : dbHost,
          dbServerPort : dbPort,
          tenantDB : dbName,
          hdiContainer : targetContainer,
          hdiDTUser : `${targetContainer}_USER_DT`,
          hdiRTUser : `${targetContainer}_USER_RT`
        }
      }
    ]
  };},
  components: {
    ErrorDialog, LoadingDialog
  }
}
</script>
<style scoped>
  .terminal {
    background-color: #222;
    color: #eee;
    padding : 5px;
    white-space: pre-wrap;       /* Since CSS 2.1 */
    white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
    white-space: -pre-wrap;      /* Opera 4-6 */
    white-space: -o-pre-wrap;    /* Opera 7 */
    word-wrap: break-word;       /* Internet Explorer 5.5+ */
  }
</style>