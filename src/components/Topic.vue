<template>
  <div>
    <a href="#" class="topic-header" @click="setTopic">{{ topic.label }}</a>
    <div class="topic-body" v-show="this.$store.state.topic === topicKey">
      <div class="topic-comp" v-for="topicComp in topic.components">
        <!-- I'm a {{ topicComp.type }}. -->
        Data goes here.
      </div>
    </div>
  </div>
</template>

<script>
  // import { mapMutations } from 'vuex';

  export default {
    props: ['topicKey'],
    computed: {
      // returns the full config object for the topic
      topic() {
        const topicKey = this.$props.topicKey;
        const topicsFiltered = this.$config.topics.filter((topic) => {
          return topic.key === this.$props.topicKey;
        });
        if (topicsFiltered.length !== 1) {
          throw `Could not get single config object for topic '${topicKey}'.`;
        }
        const config = topicsFiltered[0];
        return config;
      }
    },
    methods: {
      // TODO use mapMuptations for less boilerplate
      setTopic() {
        const topic = this.$props.topicKey;
        this.$store.commit('setTopic', { topic });
      }
    }
  };
</script>

<style scoped>
  .topic-header {
    background: #f5f5f5;
    border: 1px solid #ddd;
    display: block;
    font-size: 18px;
    font-weight: normal;
    height: 70px;
    line-height: 45px;
    padding: 10px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    margin-bottom: 8px;
  }

  .topic-header:hover {
    background: #fff;
    color: inherit;
  }

  .topic-body {
    padding: 10px;
    margin-bottom: 10px;
  }
</style>
