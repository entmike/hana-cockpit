<template>
  <div>
    <v-dialog v-model="complete" scrollable max-width="300px">
      <v-card>
        <v-card-title>{{apiResults.status}}</v-card-title>
        <v-divider></v-divider>
        <v-card-text>{{apiResults.message}}</v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="loading" persistent width="300px" >
      <v-card color="primary">
        <v-card-text>
          <span>{{loadingMessage}}</span>
          <v-progress-linear indeterminate color="white" class="mb-0" />
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-list two-line>
      <template v-for="(item,index) in adminOptions">
        <v-list-tile :key="index" @click="openDialog(item)">
          <v-list-tile-content>
            <v-list-tile-title v-html="item.option"></v-list-tile-title>
            <v-list-tile-sub-title v-html="item.description"></v-list-tile-sub-title>
          </v-list-tile-content>
          <v-dialog v-model="item.dialog">
          <v-card>
            <v-toolbar>
              <v-toolbar-title>{{item.option}}</v-toolbar-title>
            </v-toolbar>
            <v-card-title><span>{{item.description}}</span></v-card-title>
            <v-card-text>
              <component :ref="item.option" v-bind:is="item.component" v-model="item.data"></component>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" flat @click="item.dialog=false">Close</v-btn>
              <v-btn color="blue darken-1" flat @click="saveSomething(item)">Save</v-btn>
            </v-card-actions>
          </v-card>
          </v-dialog>
        </v-list-tile>
      </template>
    </v-list>
  </div>
</template>

<script>
import CreateUser from '@/CreateUser';
import ResetPassword from '@/ResetPassword';
import EnableHDI from '@/EnableHDI';
import CreateContainer from '@/CreateContainer';
import GrantHDIRole from '@/GrantHDIRole';
import MapExternalHost from '@/MapExternalHost';
let systemDBNode = process.env.VUE_APP_HANA_SYSTEMNODE || 'localhost:39017';
let tenantDBNode = process.env.VUE_APP_HANA_TENANTNODE || 'localhost:39041';
let authUser = process.env.VUE_APP_HANA_AUTHUSER || 'SYSTEM';
let hdiAdminUser = process.env.VUE_APP_HANA_HDIADMINUSER || 'HDI_ADMIN';
let tenantDBName = process.env.VUE_APP_HANA_TENANTDBNAME || 'HXE';

import axios from 'axios';
export default {
  name: 'Admin',
  sockets : {
    connect () {
      console.log("Admin Connection established.");
    },
    createuser (data){
      console.log(data);
    },
    disconnect () {
      console.log("Admin Connection ended.");
    }
  },
  props : { },
  methods : {
    saveSomething(item){
      if(!this.$refs[item.option][0].$refs.form.validate()){
         return;
      }
      if(item.socket){
        this.$socket.emit('createuser',item.data);
        console.log(this.sockets);
        return;
      }
      this.loading=true;
      this.loadingMessage=item.loadingMessage;
      axios.post(`${process.env.VUE_APP_HANA_APP_BACKEND}${item.endpoint}`,item.data).then(res=>{
        item.dialog = false;
        this.loading=false;
        this.complete=true;
        this.apiResults={
          status : "Success",
          message : res.data.message
        }
      }, err=> {
        this.loading=false;
        this.complete=true;
        this.apiResults={
          status : "Error",
          message : (err.response)?(err.response.data)?err.response.data:err.response:err
        }
      });
    },
    openDialog(item){
      this.$refs[item.option][0].$refs.form.resetValidation();
      item.data=JSON.parse(JSON.stringify(item.defaults));
      item.dialog=true;
    }
  },
  mounted : () => { },
  data: () => ({
    loading : false,
    loadingMessage : '',
    apiResults : {},
    complete : false,
    adminOptions : [
      {
        option : "Create a User",
        // socket : true,
        description : "Create an SAP HANA DB User",
        loadingMessage : "Creating User...",
        dialog : false,
        component : CreateUser,
        data : { },
        endpoint : '/api/createUser',
        defaults : {
          dbServerNode : tenantDBNode,
          authUser : authUser,
          mustChange : false
        }
      },{
        option : "Reset User Password",
        // socket : true,
        description : "Reset SAP HANA DB User Password",
        loadingMessage : "Resetting User Password...",
        dialog : false,
        component : ResetPassword,
        data : { },
        endpoint : '/api/resetPassword',
        defaults : {
          dbServerNode : tenantDBNode,
          authUser : authUser,
          mustChange : false
        }
      },{
        option : "HDI Enable a Tenant DB",
        description : "Enable an SAP HANA DB for HDI",
        loadingMessage : "Enabling HDI...",
        dialog : false,
        component : EnableHDI,
        data : { },
        endpoint : '/api/enableHDI',
        defaults : {
          systemDBServerNode : systemDBNode,
          dbServerNode : tenantDBNode,
          authUser : authUser,
          tenantAuthUser : authUser,
          hdiAdmin : hdiAdminUser,
          tenantDB : tenantDBName
        }
      },{
        option : "Create an HDI Container",
        description : "Create an HDI Container in an HDI-Enabled Tenant DB",
        loadingMessage : "Creating Container...",
        dialog : false,
        component : CreateContainer,
        data : { },
        endpoint : '/api/createContainer',
        defaults : {
          dbServerNode : tenantDBNode,
          authUser : authUser,
          hdiAdmin : hdiAdminUser
        }
      },{
        option : "Grant HDI Role",
        description : "Grant an HDI Container Role to a HANA DB User",
        loadingMessage : "Granting Role...",
        dialog : false,
        component : GrantHDIRole,
        data : { },
        endpoint : '/api/grantHDIRole',
        defaults : {
          dbServerNode : tenantDBNode,
          hdiDTUser : 'CONTAINERNAME_USER_DT'
        }
      },{
        option : "Map External Host",
        description : "Map External Hostname/IP (Useful for Cloud, Docker-Machine Containers, and NATed HANA DBs)",
        loadingMessage : "Mapping...",
        dialog : false,
        component : MapExternalHost,
        data : { },
        endpoint : '/api/mapExternalHost',
        defaults : {
          dbServerNode : systemDBNode,
          authUser : authUser
        }
      }
    ]
  }),
  components: {
    
  }
}
</script>