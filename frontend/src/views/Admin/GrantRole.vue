<template>
    <v-form ref="form" v-model="valid" lazy-validation>
        <v-layout row>
          <v-text-field
            v-model="value.dbServerNode"
            :rules="requiredRules"
            label="SYSTEMDB Server Node"
            required
          />
        </v-layout>
        <v-layout row>
            <v-text-field
              v-model="value.authUser"
              :rules="requiredRules"
              label="Grantor User"
              required
            />
            <v-text-field
              v-model="value.authPassword"
              type="password"
              :rules="requiredRules"
              label="Grantor Password"
              required
            />
        </v-layout>
        <v-text-field
          v-model="value.user"
          :rules="requiredRules"
          label="Grantee User"
          required
        />
        <v-text-field
          v-model="value.role"
          :counter="10"
          :rules="requiredRules"
          label="Role"
          required
        />
        <v-checkbox v-model="value.withGrant" label="With Grant Option" />
      </v-form>
</template>

<script>
export default {
    name: 'GrantRole',
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