<template>
    <div>
    <ErrorDialog v-model="error.error" :message="error.message" :details="error.details"/>
    <LoadingDialog v-model="loading.loading" message="Authenticating..."/>
    <v-dialog v-model="value" persistent :width="width">
        <v-card v-model="initial">
            <v-card-title primary-title>
                <h3 class="headline mb-0" style="color:#009966;">Log In</h3>
            </v-card-title>
            <v-card-text>
                <span>Enter your application password</span>
                <v-form ref="form">
                    <v-text-field
                        v-model="fields.appPassword"
                        type="password"
                        :rules="requiredRules"
                        label="Application Password"
                        required
                    />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn flat color="primary" @click="login">Log In</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    </div>
</template>
<script>
import ErrorDialog from '@/components/ErrorDialog.vue';
import LoadingDialog from '@/components/LoadingDialog.vue';
import axios from 'axios';

export default { 
    name : 'LoginDialog',
    components : { LoadingDialog, ErrorDialog },
    methods : {
        login () {
            if(!this.$refs.form.validate()){
                return;
            }
            this.loading.loading=true;
            axios.post(process.env.VUE_APP_HANA_APP_BACKEND + '/api/login/',{
                appPassword : this.fields.appPassword
            }).then(res=>{
                this.loading.loading = false;
                localStorage.setItem("appPassword",this.fields.appPassword);
                this.$store.commit("SET_PASSWORD", this.fields.appPassword);
                this.$router.push('/');
            },err=>{
                this.loading.loading = false;
                this.error.error = true;
                this.error.details = (err.response)?err.response.data:err;
                this.error.message = "An Error occured while trying to log in.  See details for more information.";
                this.error.allowClose = true;
            });
        },
        clickHandler () {

        // this.$emit('input', false);
        }
    },
    watch : {
        value () { }
    },
    computed : { 
      btnShowDetails(){
        if(this.showDetails){
            return "Hide Details";
        }else{
            return "Show Details";
        }
      },
      errorDetails (){
          if(typeof this.details == "object") return JSON.stringify(this.details);
          return this.details;
      },
      isJson (){
          return (typeof this.details == "object");
      }  
    },
    data () {
        return {
            fields : {
                appPassword : null
            },
            loading : {
                loading : false,
                message : "Authenticating..."
            },
            error : {
                error : false,
                message : "",
                details : {},
                allowClose : false
            },
            initial : false,
            showDetails : false,
            valid: true,
            requiredRules: [
                v => !!v || 'Field is required'
            ]
        }
    },
    props : {
        width : {
            type : [Number, String],
            default : "70%"
        },
        details : {
            type : [Error,Object,String],
            default : null
        },
        allowClose : {
            type : [Boolean],
            default : true
        },
        message : {
            type : [String],
            default : "An error occurred."
        },
        title : {
            type : [String],
            default : "Error"
        },
        value : {
            type : Boolean,
            default : false
        }
    }
}
</script>
<style scoped>
    .errDialog {
        background-color : clear;
    }
</style>