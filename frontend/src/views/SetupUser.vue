<template>
    <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field
            v-model="value.authUser"
            :rules="requiredRules"
            label="User Administrator Username"
            required
        />
        <v-text-field
            v-model="value.authPassword"
            type="password"
            :rules="requiredRules"
            label="User Administrator Password"
            required
        />
      </v-form>
</template>

<script>
export default {
    name: 'SetupUser',
    props : [ 'value' ],
    data: () => ({
      authUser : "SYSTEM",
      authPassword : "",
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