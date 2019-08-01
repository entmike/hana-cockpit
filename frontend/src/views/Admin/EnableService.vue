<template>
    <v-form ref="form" v-model="valid" lazy-validation>
        <v-layout row>
          <v-text-field
            v-model="value.systemDBServerNode"
            :rules="requiredRules"
            label="SYSTEM DB Server Node"
            required
          />
          <v-text-field
            v-model="value.tenantDB"
            :rules="requiredRules"
            label="Tenant DB Name"
            required
          />
        </v-layout>
        <v-layout row>
            <v-text-field
              v-model="value.authUser"
              :rules="requiredRules"
              label="SYSTEM DB User"
              required
            />
            <v-text-field
              v-model="value.authPassword"
              type="password"
              :rules="requiredRules"
              label="SYSTEM DB Password"
              required
            />
        </v-layout>
        <v-select
          :items="services"
          label="Service"
          solo
          v-model="value.service"
          :rules="requiredRules"
        />
      </v-form>
</template>

<script>
export default {
    name: 'EnableService',
    props : [ 'value' ],
    data: () => ({
      services : ["dpserver","scriptserver","docstore"],
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