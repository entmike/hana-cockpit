<template>
    <v-form ref="form" v-model="valid" lazy-validation>
        <v-layout row>
          <v-text-field
            v-model="value.dbServerNode"
            :rules="requiredRules"
            label="SYSTEMDB Server Node"
            required
          />
          <v-text-field
            v-model="value.hdiContainer"
            :rules="requiredRules"
            label="HDI Container"
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
      </v-form>
</template>

<script>
export default {
    name: 'GrantHDIRole',
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
      passwordConfirmationRules () {
        return [
          () => (this.value.hdiAdminPassword === this.value.confirmpassword) || 'Passwords must match',
          v => !!v || 'Password is required'
        ];
      },
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