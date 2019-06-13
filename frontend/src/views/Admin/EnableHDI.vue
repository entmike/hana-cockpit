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
            v-model="value.dbServerNode"
            :rules="requiredRules"
            label="TENANT DB Server Node"
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
              label="SYSTEM DB Security Grantor User"
              required
            />
            <v-text-field
              v-model="value.authPassword"
              type="password"
              :rules="requiredRules"
              label="SYSTEM DB Security Grantor Password"
              required
            />
        </v-layout>
        <v-layout row>
            <v-text-field
              v-model="value.tenantAuthUser"
              :rules="requiredRules"
              label="TENANT DB Security Grantor User"
              required
            />
            <v-text-field
              v-model="value.tenantAuthPassword"
              type="password"
              :rules="requiredRules"
              label="TENANT DB Security Grantor Password"
              required
            />
        </v-layout>
        <v-text-field
          v-model="value.hdiAdmin"
          :counter="10"
          :rules="userRules"
          label="TENANT DB HDI Administrator User (Will be created if missing)"
          required
        />
        <v-text-field
          v-model="value.hdiAdminPassword"
          type="password"
          :counter="30"
          :rules='passwordRules'
          label="HDI Administrator Password"
          required
        />
        <v-text-field
          v-model="value.confirmpassword"
          type="password"
          :counter="30"
          :rules='passwordConfirmationRules'
          label="Verify Password"
          required
        />
      </v-form>
</template>

<script>
export default {
    name: 'CreateUser',
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