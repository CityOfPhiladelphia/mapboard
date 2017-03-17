<template>
  <div>
    <a href="#" class="topic-header" @click="setTopic">{{ topic.label }}</a>
    <div class="topic-body" v-show="this.$store.state.topic === topic.key">
      <div class="topic-comp" v-for="topicComp in topic.components">
        I'm a {{ topicComp.type }}.
      </div>
    </div>
  </div>
</template>

<script>
  // import { mapMutations } from 'vuex';

  export default {
    props: ['topic'],
    methods: {
      // TODO use mapMuptations for less boilerplate
      setTopic() {
        const topic = this.$props.topic.key;
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
