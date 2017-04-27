<template>
  <div class="large-12 columns mb-panel mb-panel-topics">
    <div class="row">
      <!-- before search -->
      <greeting v-show="!ais" />

      <!-- after search -->
      <div v-if="ais">
        <h1 v-if="address">{{ address }}</h1>
        <topic v-for="topic in this.$config.topics"
               v-if="shouldShowTopic(topic)"
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
<<<<<<< HEAD
    components: {
      Greeting,
      Topic
=======
    components: { Topic },
    methods: {
      shouldShowTopic(topic) {
        const requiredTopicKeys = topic.dataSources || [];

        // if there aren't any required topics, show it
        if (requiredTopicKeys.length === 0) {
          return true;
        }

        const topicData = this.$store.state.topicData;
        return requiredTopicKeys.every(key => topicData[key])
      }
>>>>>>> 0b77a2aabdefaed3c16dc045ff5767fd696ba914
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
