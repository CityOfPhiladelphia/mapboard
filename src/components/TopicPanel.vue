<template>
  <div class="large-12 columns mb-panel mb-panel-topics">
    <div class="row">
    <!-- <div class="row" :class="{ 'row-with-widget': this.$store.state.pictometryActive }"> -->
      <!-- before search -->
      <greeting v-show="!ais" />

      <!-- after search -->
      <div v-if="ais">
        <h1 v-if="address">{{ address }}</h1>
        <topic v-for="topic in this.$config.topics"
               :topicKey="topic.key"
               :key="topic.key"
        />
      </div>
    </div>
    <!-- <slot name="pictWidget" /> -->
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
    methods: {
      shouldShowTopic(topic) {
        const requiredSources = topic.dataSources || [];

        // if there aren't any required topics, show it
        if (requiredSources.length === 0) {
          return true;
        }

        const sources = this.$store.state.sources;
        return requiredSources.every(key => sources[key].data)
      }
    },
    computed: {
      ais() {
        return this.$store.state.geocode.data;
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
