<template>
  <div v-show="this.activeTopic === this.$props.topic">
    <div class='legend'>
      <ul class='legend-list'>
        <li v-for='key in this.keys'>
          <i class='legend-box' :style='"background: " + items[key]'></i>
          {{key}}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import Control from '../leaflet/Control.vue';
  const {props, methods} = Control;

  export default {
    props: [
      'position',
      'topic',
      'items'
    ],
    computed: {
      keys() {
        return Object.keys(this.$props.items);
      },
      activeTopic() {
        return this.$store.state.activeTopic;
      },
    },
    methods: Object.assign(methods)
  };
</script>

<style>
.legend {
  display: inline-block;
  padding: 6px 8px;
  font: 14px/16px Arial, Helvetica, sans-serif;
  background: white;
  background: rgba(255,255,255,1);
  box-shadow: 0 0 15px rgba(0,0,0,0.2);
  border-radius: 5px;
  line-height: 18px;
  color: #555;
}

.legend-box {
  width: 18px;
  height: 18px;
  float: left;
  margin-right: 8px;
  opacity: 1;
}

.legend-list {
  list-style: none;
  padding-top: 2px;
  padding-left: 2px;
  margin-left: 0px;
}
</style>
