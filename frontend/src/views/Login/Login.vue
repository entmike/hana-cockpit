<template>
  <div>
    <LoginDialog v-model="login"/>
  </div>
</template>

<script>
import LoginDialog from '@/components/LoginDialog';

import axios from 'axios';
export default {
  name: 'Login',
  sockets : {
    connect () {
      console.log("Login Connection established.");
    },
    disconnect () {
      console.log("Login Connection ended.");
    }
  },
  props : { }, 
  methods : { },
  mounted () {
    
   },
  data () {
    return {
      login : true,
      loading : {
        loading : false
      }
    };
  },
  components: {
    LoginDialog
  }
}
</script>
<style scoped>
</style>