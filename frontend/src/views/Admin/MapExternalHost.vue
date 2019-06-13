<template>
    <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field
          v-model="value.dbServerNode"
          :rules="requiredRules"
          label="System DB Server Node"
          required
        />
        <v-layout row>
            <v-text-field
              v-model="value.authUser"
              :rules="requiredRules"
              label="Administrator User"
              required
            />
            <v-text-field
              v-model="value.authPassword"
              type="password"
              :rules="requiredRules"
              label="Administrator Password"
              required
            />
        </v-layout>
        <v-text-field
          v-model="value.externalHost"
          :rules="requiredRules"
          label="External Hostname/IP"
          required
        />
      </v-form>
</template>

<script>
export default {
    name: 'MapExternalHost',
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
          () => (this.value.userPassword === this.value.confirmpassword) || 'Passwords must match',
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