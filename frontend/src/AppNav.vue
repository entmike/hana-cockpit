<template>
    <v-toolbar flat app :color="appState.color" dark>
        <v-toolbar-title>HANA Cockpit</v-toolbar-title>
        <template v-for="(item,index) in items">
            <v-btn v-if="typeof item.link === 'undefined'" :key=index flat :to="'/' + item.title">{{item.title}}</v-btn>
            <v-btn v-else :key=index flat :to="'/' + item.link">{{item.title}}</v-btn>
        </template>
        <v-spacer />
        <v-btn flat to="/Preferences">Preferences</v-btn>
    </v-toolbar>
</template>

<script>
export default {
    name: 'AppNav',
    props : {
        systemInformation : Object,
        appState : Object
    },
    data(){
        return{
            appTitle: 'HANA Sandbox',
            drawer: false,
            items: [
                { title: 'Administration', link: '' },
                { title: 'SQL', link: 'sql' }
            ]
        };
    }
};
</script>

<style scoped>
</style>