<template>
  <div>
    <v-list two-line>
      <template v-for="(item,index) in systemProperties">
        <v-list-tile :key="index">
          <v-list-tile-content>
            <v-list-tile-title v-html="item.KEY"></v-list-tile-title>
            <v-list-tile-sub-title v-html="item.VAL"></v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
    </v-list>
  </div>
</template>

<script>
export default {
  name: 'Overview',
  props : {
    systemProperties : Array
  },
  data: () => ({ }),
  components: {}
}
</script>