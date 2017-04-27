<template>
  <div class="large-12 columns mb-panel mb-panel-topics">
    <div class="row">
      <!-- before search -->
      <greeting v-show="!ais" />

      <!-- after search -->
      <div v-show="ais">
        <h1 v-if="address">{{ address }}</h1>
        <Topic v-for="topic in this.$config.topics"
               :topicKey="topic.key"
               :key="topic.key"
        />
      </div>

    </div>
  </div>
</template>

<script>
  import Greeting from './Greeting';
  import Topic from './Topic';

  export default {
    components: {
      Greeting,
      Topic
    },
    computed: {
      ais() {
        return this.$store.state.ais;
      },
      address() {
        const ais = this.ais;
        if (!ais) return null;
        return ais.properties.street_address;
      }
    }
  };
</script>

<style>
  .mb-panel-topics {
    background: #fff;
    padding-left: 20px !important;
    padding-right: 20px !important;
    overflow-y: auto;
  }
</style>
