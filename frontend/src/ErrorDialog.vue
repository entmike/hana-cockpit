<template>
    <v-dialog v-model="value" persistent>
        <v-card>
            <v-card-title primary-title>
                <h3 class="headline mb-0" style="color:red;">{{title}}</h3>
            </v-card-title>
            <v-card-text>
                <json-viewer theme="errDialog" v-if="isJson==true" :value="message"></json-viewer>
                <span v-if="isJson==false">{{errorMessage}}</span>
            </v-card-text>
            <v-card-actions>
              <v-btn flat @click="clickHandler">OK</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import JsonViewer from 'vue-json-viewer';
export default {
    name : 'ErrorDialog',
    components : { JsonViewer },
    methods : {
      clickHandler () {
          // v-model listening for 'input' event
          this.$emit('input', false);
      }
    },
    computed : {
      errorMessage (){
          if(typeof this.message == "object") return JSON.stringify(this.message);
          return this.message;
      },
      isJson (){
          return (typeof this.message == "object");
      }  
    },
    props : {
        message : {
            type : [Error,Object,String],
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