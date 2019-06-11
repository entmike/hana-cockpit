<template>
  <div>
    <v-app>
      <v-card>
        <v-card-title primary-title>
            <h3 class="headline mb-0" >{{title}}</h3>
        </v-card-title>
        <v-card-text>
          <span>{{message}}</span>
          <v-list two-line>
            <template v-for="(item,index) in missing">
              <v-list-tile :key="index">
                <v-list-tile-content>
                  <v-list-tile-title v-html="item.field"></v-list-tile-title>
                  <v-list-tile-sub-title v-html="item.desc"></v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-card-text>
      </v-card>
    </v-app>
  </div>
</template>

<script>
export default {
  name: 'MissingEnv',
  props : {
    title : {
      type : String,
      default : "Title"
    },
    message : {
      type : String,
      default : "Message"
    },
    missing : {
      type : Array,
      default () {[];}
    }
  },
  data () {
    return {};
  },
  components: { },
  methods : { }
};
</script>