<template>
  <div v-if="shouldShowTopic">
  <!-- <div> -->
    <a href="#"
       class="topic-header"
       @click.prevent="handleTopicHeaderClick"
       v-if="shouldShowHeader"
       :data-topic-key="topicKey"
    >
      <span v-show="status === 'waiting'" class="loading">
        <i class="fa fa-spinner fa-lg spin"></i>
      </span>
      <i :class="['fa', 'fa-' + icon, 'topic-header-icon']"
         aria-hidden="true"
      />
      {{ topic.label }}
    </a>

    <!-- success -->
    <transition name="topic-body">
      <div class="topic-body"
           v-if="shouldShowBody"
           :data-topic-key="topicKey"
      >
        <topic-component-group :topic-components="topic.components" />
      </div>
    </transition>

    <!-- error -->
    <div class="topic-body"
         v-show="shouldShowError"
         v-html="this.errorMessage"
    >
    <!-- Could not locate records for that address. -->
    </div>
  </div>
</template>

<script>
  import philaVueComps from '@cityofphiladelphia/phila-vue-comps';

  const TopicComponentGroup = philaVueComps.TopicComponentGroup;
  // import TopicComponentGroup from './TopicComponentGroup.vue';

  export default {
    props: ['topicKey'],
    components: {
      TopicComponentGroup
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
        return activeTopic === key;
      },
      shouldShowHeader() {
        return this.$config.topics.length > 1;
      },
      dataSources() {
        return this.topic.dataSources || [];
      },
      hasData() {
        // console.log(this.topicKey, '-', 'hasData?', this.dataSources);

        // make sure the following is true for all data sources
        const hasData = this.dataSources.every(dataSource => {
          const targetsFn = this.$config.dataSources[dataSource].targets;

          // if the data source is configured for targets
          if (targetsFn) {
            const targetsMap = this.$store.state.sources[dataSource].targets;
            const targets = Object.values(targetsMap);

            // but there are no targets for this address, return false
            if (targets.length === 0) {
              return false;
            }

            // if there are targets for this address, make sure none of them
            // are "waiting"
            return targets.every(target => target.status !== 'waiting');

          // if the data source is not configured for targets, just check that
          // it has data
          } else {
            return !!this.$store.state.sources[dataSource].data;
          }
        });

        return hasData;
      },
      shouldShowBody() {
        const succeeded = this.status === 'success';
        const hasData = this.hasData;
        const should = succeeded && hasData && this.isActive;
        return should;
      },
      shouldShowTopic() {
        if (!this.topic.onlyShowTopicIfDataExists) {
          return true;
        } else {
          let result = true;
          const requiredDataSources = Object.keys(this.topic.onlyShowTopicIfDataExists);
          // console.log('requiredDataSources', requiredDataSources);
          for (let requiredDataSource of requiredDataSources) {
            const dataSource = this.topic.onlyShowTopicIfDataExists[requiredDataSource];
            const pathToDataArray = dataSource.pathToDataArray;
            const minDataLength = dataSource.minDataLength;
            // console.log('requiredDataSource', requiredDataSource, 'dataSource', dataSource);
            let dataArray;
            if (!this.$store.state.sources[requiredDataSource].data) {
              // if there is no data (yet)
              return false;
            } else {
              if (!pathToDataArray) {
                dataArray = this.$store.state.sources[requiredDataSource].data;
              } else if (pathToDataArray.length === 1) {
                dataArray = this.$store.state.sources[requiredDataSource].data[pathToDataArray[0]];
              }
              // TODO - implement system if the path to the data is longer than a single step
              // else {
                //   dataArray = this.$store.state.sources[requiredDataSource].data[pathToDataArray[0]].[pathToDataArray[1]];
                // }
              if (dataArray.length < minDataLength) {
                result = false
              }
            }
          }
          return result;
        }
      },
      shouldShowError() {
        const shouldShowError = (
          // topic must be active and
          this.isActive && (
            // there either has to be an error or
            this.status === 'error' ||
            // we got the response and it's empty
            (this.status !== 'waiting' && !this.hasData)
          )
        );
        shouldShowError && console.log('BINGO BINGO BINGO:', this.topicKey, 'shouldShowError:', shouldShowError, 'status:', this.status, 'hasData:', this.hasData);
        return shouldShowError;
      },
      errorMessage() {
        if (this.topic.errorMessage) {
          return this.topic.errorMessage(this.$store.state);
        } else {
          return 'Could not locate records for that address.';
        }
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
            const targetsFn = this.$config.dataSources[dataSource].targets;

            // if the data source is configured for targets
            if (targetsFn) {
              const targetsMap = this.$store.state.sources[dataSource].targets;
              const targets = Object.values(targetsMap);

              // but there are no targets for this address, return false
              if (targets.length === 0) {
                return;
              }

              // if there are targets for this address, make sure none of them
              // are "waiting"
              return targets.map(target => {
                return target.status
              });

            // if the data source is not configured for targets, just check that
            // it has data
            } else {
              return [this.$store.state.sources[dataSource].status];
            }
          });

          let flatArray = []
          for (let sourceStatus of sourceStatuses) {
            if (sourceStatus) {
              for (let sourceStatusValue of sourceStatus) {
                flatArray.push(sourceStatusValue);
              }
            }
          }

          if (flatArray.includes('waiting')) {
            topicStatus = 'waiting';
          } else if (flatArray.includes('error')) {
            topicStatus = 'error';
          } else {
            topicStatus = 'success';
          }
          return topicStatus;
        }
      },
    },
    methods: {
      configForBasemap(key) {
        return this.$config.map.basemaps[key];
      },

      handleTopicHeaderClick(e) {
        const topic = this.$props.topicKey;
        let nextTopic;

        if (topic !== this.$store.state.activeTopic) {
          nextTopic = topic;
        }

        // notify controller (which will handle routing)
        this.$controller.handleTopicHeaderClick(nextTopic);
      },
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
    padding: 5px;
    margin-bottom: 10px;
  }

  .loading {
    float: right;
  }

  .topic-body-enter-active, .topic-body-leave-active {
    transition: opacity 0.18s;
  }

  .topic-body-enter, .topic-body-leave-to {
    opacity: 0;
  }
</style>
