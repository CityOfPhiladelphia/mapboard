<template>
  <div>
    <a href="#" class="topic-header" @click="setTopic">
      <i :class="['fa', 'fa-' + icon, 'topic-header-icon']"
         aria-hidden="true"
      />
      {{ topic.label }}
    </a>
    <div class="topic-body" v-show="this.$store.state.topic === topicKey">
      <component v-for="(topicComp, topicCompIndex) in topic.components"
                 :is="topicComp.type"
                 class="topic-comp"
                 :slots="topicComp.slots"
                 :key="`topic-comp-${topic.key}-${topicCompIndex}`"
      />
    </div>
  </div>
</template>

<script>
  // import { mapMutations } from 'vuex';

  import Badge from './topic-components/Badge';
  import HorizontalTable from './topic-components/HorizontalTable';
  import VerticalTable from './topic-components/VerticalTable';
  import Callout from './topic-components/Callout';
  import Image_ from './topic-components/Image';

  export default {
    props: ['topicKey'],
    components: {
      Badge,
      HorizontalTable,
      VerticalTable,
      Callout,
      Image_
    },
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
      },
      icon() {
        return this.topic.icon;
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
  /*REVIEW these aren't prefixed `mb-`because they're scoped, but it feels
  inconsistent?*/
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

  .topic-header-icon {
    padding-left: 10px;
    padding-right: 10px;
  }

  .topic-body {
    padding: 10px;
    margin-bottom: 20px;
  }

  .topic-comp {
    margin-bottom: 10px;
  }
</style>
