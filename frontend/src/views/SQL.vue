<template>
    <div>
     <LoadingDialog v-model="loading" message="Loading, please wait..."/>
     <ErrorDialog v-model="error.error" :message="error.message" :details="error.details"/>
     <v-form ref="form" v-model="valid" lazy-validation>
         <v-card>
            <v-card-text>
                <v-text-field
                v-model="value.dbServerNode"
                :rules="requiredRules"
                label="DB Server Node"
                required
                />
                <v-layout row>
                    <v-text-field
                    v-model="value.authUser"
                    :rules="requiredRules"
                    label="DB User"
                    required
                    />
                    <v-text-field
                    v-model="value.authPassword"
                    type="password"
                    :rules="requiredRules"
                    label="DB Password"
                    required
                    />
                </v-layout>
                <codemirror v-model="value.sql"/>
            </v-card-text>
        </v-card>
    </v-form>
    
    <div class="codemirror">
    </div>
      <v-toolbar>
        <v-btn @click="getData" color="success">Run</v-btn>
        <download-excel :data = "resultsComputed"><v-btn color="success">Download</v-btn></download-excel>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="results"
        :loading="loading"
        :rows-per-page="rowsPerPage"
        class="elevation-1">
        <template v-slot:items="props">
          <td :key="field + index" v-for="(field,index) of props.item">{{ field }}</td>
        </template>
      </v-data-table>
    </div>
</template>

<script>
  let tenantDBNode = process.env.VUE_APP_HANA_TENANTNODE || 'localhost:39041';
  let authUser = process.env.VUE_APP_HANA_AUTHUSER || 'SYSTEM';
  import LoadingDialog from '@/components/LoadingDialog';
  import ErrorDialog from '@/components/ErrorDialog';
  import axios from 'axios';
  import 'codemirror/mode/sql/sql.js'
  import 'codemirror/theme/solarized.css'
  import 'codemirror/theme/base16-dark.css'
 
  export default {
    data: () => ({
      valid: true,
      loading : false,
      error : {
        error : false,
        message : '',
        details : ''
      },
      requiredRules: [
        v => !!v || 'Field is required'
      ],
      value : {
          dbServerNode : tenantDBNode,
          authUser : authUser,
          sql : `-- Simple Test
SELECT CURRENT_USER FROM DUMMY;
`
      },
      headers: [],
      results: [],
      rowsPerPage : "-1",
      loading : false
    }),
    computed : {
        resultsComputed (){
            return [];
        }
    },
    components : {LoadingDialog, ErrorDialog},
    methods: {
      getData: function(){
        if(!this.$refs.form.validate()){
            return;
        }
        this.loading=true;
        axios.post(`${process.env.VUE_APP_HANA_APP_BACKEND}/api/sql/`,this.value).then(res=>{
          this.loading=false;
          this.headers = [];
          if(res.data && res.data.length>0){
            let row = res.data[0];
            for(var field in row) this.headers.push({text: field, value: field});
          }
          this.results = res.data;
        }, err=> {
          this.loading = false;
          this.error.error = true;
          this.error.message = 'An error occurred when trying to execute the SQL Statement';
          this.error.details = err.response.data;
        }).catch(err=>{
          alert(`An error occured communicating with the backend.
          ${err}`);
        })
      }
    },
    mounted(){
      
    }
  }
</script>