<template>
    <v-form ref="form" v-model="valid" lazy-validation>
        <v-layout row>
            <v-text-field v-model="value.dbServerNode" :rules="requiredRules" label="Tenant DB Server Node" required />
            <v-text-field v-model="value.authUser" :rules="requiredRules" label="Authorized DB User" required />
            <v-text-field v-model="value.authPassword" type="password" :rules="requiredRules" label="Authorized DB Password" required />
        </v-layout>
        <v-layout row>
            <v-text-field v-model="value.agentName" :rules="requiredRules" label="DP Agent Name" required />
            <v-text-field v-model="value.host" :rules="requiredRules" label="DP Agent Host" required />
            <v-text-field v-model="value.port" :rules="requiredRules" label="DP Agent Port" required />
            <v-select :items="protocols" label="Protocol" solo v-model="value.protocol" :rules="requiredRules" />
        </v-layout>
      </v-form>
</template>

<script>
export default {
    name: 'Create Agent',
    props : [ 'value' ],
    data: () => ({
      protocols : ["TCP","HTTP"],
      valid: true,
      requiredRules: [
        v => !!v || 'Field is required'
      ],
      passwordRules: [
        v => !!v || 'Password is required'
      ],
      userRules: [
        v => !!v || 'User Name is required',
        v => (v && v.length > 3) || 'User Name must be more than 3 characters'
      ]
    }),
    computed: {
      
    },
    methods: {
      reset () {
        this.$refs.form.reset()
      }
    }
};
</script>

<style scoped>
</style>