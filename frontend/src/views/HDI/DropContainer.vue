<template>
    <v-form ref="form" v-model="valid" lazy-validation>
        <v-layout row>
          <v-text-field
            v-model="value.dbServerNode"
            :rules="requiredRules"
            label="HDI Enabled Tenant DB Server Node"
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
              v-model="value.hdiAdmin"
              :rules="requiredRules"
              label="HDI Administrator"
              required
            />
            <v-text-field
              v-model="value.hdiAdminPassword"
              type="password"
              :rules="requiredRules"
              label="HDI Administrator Password"
              required
            />
        </v-layout>
        
      </v-form>
</template>

<script>
export default {
    name: 'DropContainer',
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
          () => (this.value.hdiUserPassword === this.value.confirmpassword) || 'Passwords must match',
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