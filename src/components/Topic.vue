<template>
  <div>
    <a href="#"
       class="topic-header"
       @click="setActiveTopic"
       v-if="shouldShowHeader"
    >
      <span v-show="status === 'waiting'" class="loading-badge">
        Loading...
      </span>
      <i :class="['fa', 'fa-' + icon, 'topic-header-icon']"
         aria-hidden="true"
      />
      {{ topic.label }}
    </a>

    <!-- success -->
    <div class="topic-body" v-if="shouldShowBody">
      <component v-for="(topicComp, topicCompIndex) in topic.components"
                 :is="topicComp.type"
                 class="topic-comp"
                 :slots="topicComp.slots"
                 :key="`topic-comp-${topic.key}-${topicCompIndex}`"
      />
    </div>

    <!-- error -->
    <div class="topic-body" v-show="shouldShowError">
      Error loading topic.
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
      },
      isActive() {
        const key = this.topic.key;
        const activeTopic = this.$store.state.activeTopic;
        // console.log('is active?', key === activeTopic);
        return activeTopic === key;
      },
      shouldShowHeader() {
        return this.$config.topics.length > 1;
      },
      shouldShowBody() {
        const hasData = this.status === 'success';
        const should = hasData && this.isActive;
        console.log('should show body?', should, hasData, this.isActive);
        return should;
      },
      shouldShowError() {
        return this.status === 'error';
      },
      // REVIEW this is getting cached and not updating when the deps update
      status: {
        cache: false,
        get() {
          // get the status of each source
          const dataSources = this.topic.dataSources || [];

          // if no sources, return success
          if (dataSources.length === 0) {
            return 'success';
          }

          let topicStatus;

          const sourceStatuses = dataSources.map(dataSource => {
            // this is what should be observed. when it changes,
            // it's not causing this to re-evaluate.
            return this.$store.state.sources[dataSource].status;
          });

          // if any sources are still waiting, return waiting
          if (sourceStatuses.some(x => x === 'waiting')) {
            topicStatus = 'waiting';
          }

          // if any sources have errors, return error
          else if (sourceStatuses.some(x => x === 'error')) {
            topicStatus = 'error';
          }

          else {
            topicStatus = 'success';
          }

          console.log('topic status', topicStatus)

          return topicStatus;
        }
      },
    },
    methods: {
      // TODO use mapMuptations for less boilerplate
      setActiveTopic() {
        const topic = this.$props.topicKey;
        this.$store.commit('setActiveTopic', { topic });
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

  .loading-badge {
    font-style: italic;
    float: right;
  }
</style>
