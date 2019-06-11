<template>
    <v-dialog v-model="value" persistent width="300px" >
        <v-card color="primary">
            <v-card-text>
                <span>{{message}}</span>
            <v-progress-linear indeterminate color="white" class="mb-0" />
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
export default {
    name : 'LoadingDialog',
    props : {
        message : {
            type : String,
            default : "Loading..."
        },
        value : {
            type : Boolean,
            default : false
        }
    }
}
</script>