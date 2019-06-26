<template>
    <v-form ref="form" v-model="valid" lazy-validation>
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
              label="Security Grantor User"
              required
            />
            <v-text-field
              v-model="value.authPassword"
              type="password"
              :rules="requiredRules"
              label="Security Grantor Password"
              required
            />
        </v-layout>
        <v-text-field
          v-model="value.name"
          :rules="requiredRules"
          label="Collection Name"
          required
        />
        <v-select
          :items="items"
          label="Purpose"
          solo
          v-model="value.purpose"
          :rules="requiredRules"
        />
      </v-form>
</template>

<script>
export default {
    name: 'CreatePSE',
    props : [ 'value' ],
    data: () => ({
      items : ["SAML","SAP LOGON","X509","SSL/TLS","DATABASE REPLICATION","JWT"],
      valid: true,
      requiredRules: [
        v => !!v || 'Field is required'
      ]
    }),
    methods: {
      reset () {
        this.$refs.form.reset()
      }
    }
};
</script>

<style scoped>
</style>