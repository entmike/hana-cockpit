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
          label="Certificate Comment"
          v-model="value.comment"
          :rules="requiredRules"
        />
        <v-text-field
          label="Add to Collection/PSE (Optional)"
          v-model="value.pse"
        />
        <v-textarea
          solo
          class="terminal"
          label="Certificate"
          v-model="value.certificate"
        ></v-textarea>
      </v-form>
</template>

<script>
export default {
    name: 'CreateCertificate',
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
.terminal {
  font-family:Consolas;
}
</style>