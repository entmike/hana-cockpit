<template>
    <v-app>
        <AppNav :appState="appState" :systemInformation="results.backend_information"/>
        <v-content transition="slide-x-transition">
            <router-view :systemProperties="results.M_SYSTEM_OVERVIEW"/> 
        </v-content>
    </v-app>
</template>
<script>
  import AppNav from '@/AppNav';
  import axios from 'axios';
  
  export default {
    name: 'RunningApp',
    components: {
        AppNav
    },
    data () {
      return {
        config : {},
        results: {
          backend_information : {
            user : 'UNKNOWN'
          }
        },
        appState : {
          color : '#009966',
          status : 'initial',
          errMessage :''
        },
        errorVisible : false
      };
    },
    methods : {
     
    },
    mounted(){
        // this.getData();
    }
};
</script>