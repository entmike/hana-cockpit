<template>
    <v-form ref="form" v-model="valid" lazy-validation>
        <v-layout row>
          <v-text-field
            v-model="value.dbServerHost"
            :rules="requiredRules"
            label="HDI Enabled Tenant DB Server Host"
            required
          />
          <v-text-field
            v-model="value.dbServerPort"
            :rules="requiredRules"
            label="HDI Enabled Tenant DB Server Port"
            required
          />
          <v-text-field
            v-model="value.hdiContainer"
            :rules="requiredRules"
            label="HDI Container Name"
            required
          />
        </v-layout>
        <v-layout row>
            <v-text-field
              v-model="value.hdiDTUser"
              :rules="requiredRules"
              label="HDI DT User"
              required
            />
            <v-text-field
              v-model="value.hdiDTPassword"
              type="password"
              :rules="requiredRules"
              label="HDI DT Password"
              required
            />
        </v-layout>
      </v-form>
</template>

<script>
export default {
    name: 'ContainerContents',
    props : [ 'value' ],
    data: () => ({
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
    methods: {
      reset () {
        this.$refs.form.reset()
      }
    }
};
</script>

<style scoped>
</style>