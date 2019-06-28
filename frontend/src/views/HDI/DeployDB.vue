
<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-layout row>
      <v-text-field
        v-model="value.dbServerHost"
        :rules="requiredRules"
        label="DB Server Host"
        required
      />
      <v-text-field
        v-model="value.dbServerPort"
        :rules="requiredRules"
        label="DB Server Port"
        required
      />
      <v-text-field
        v-model="value.tenantDB"
        :rules="requiredRules"
        label="Tenant DB Name"
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
    <v-layout row>
      <v-text-field
        v-model="value.hdiRTUser"
        :rules="requiredRules"
        label="HDI RT User"
        required
      />
      <v-text-field
        v-model="value.hdiRTPassword"
        type="password"
        :rules="requiredRules"
        label="HDI RT Password"
        required
      />
    </v-layout>
    <v-checkbox v-model="value.autoUndeploy" label="Auto Undeploy" />
    <UploadButton ref="dbZip" @file-update="update" title="Select a DB Module ZIP File"/>
  </v-form>
</template>

<script>
import UploadButton from 'vuetify-upload-button';

export default {
    name: 'DeployDB',
    props : [ 'value' ],
    data: () => ({
      dbZip : '',
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
      update (file) {
        console.log(file);
        this.dbZip = file;
      },
      reset () {
        this.$refs.form.reset()
      }
    },
    components : { UploadButton }
};
</script>

<style scoped>
</style>