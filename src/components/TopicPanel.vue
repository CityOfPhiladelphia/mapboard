<template>
  <div class="large-12 columns mb-panel mb-panel-topics" id="topic-panel">
    <div class="row">
    <!-- <div class="row" :class="{ 'row-with-widget': this.$store.state.pictometry.active }"> -->
      <!-- before search -->
      <greeting v-show="!geocode" />

      <!-- after search -->
      <div v-if="geocode">
        <div class="address-spacer" v-if="address">
          <div class="address-header">
            <h1 class="address-header-line-1">{{ address }}</h1>
            <div class="address-header-line-2 small-text">PHILADELPHIA, PA {{ zipCode }}</div>
          </div>
        </div>
        <div class="spacer-div"></div>
        <div class="topics-container">
          <topic v-for="topic in this.$config.topics"
                 :topicKey="topic.key"
                 :key="topic.key"
          />
        </div>
      </div>
    </div>
    <!-- <slot name="pictWidget" /> -->
  </div>
</template>

<script>
  import Greeting from './Greeting.vue';
  import Topic from './Topic.vue';

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
      geocode() {
        return this.$store.state.geocode.data;
      },
      address() {
        const geocode = this.geocode;
        if (!geocode) return null;
        return geocode.properties.street_address;
      },
      zipCode() {
        const geocode = this.geocode;
        if (!geocode) return null;
        const zipCode = geocode.properties.zip_code;
        const zip4 = geocode.properties.zip_4;
        const parts = [zipCode];
        if (zip4) parts.push(zip4);
        return parts.join('-');
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

  .address-spacer {
    position: absolute;
    left: -5px;
    height: 100px;
    width: 49%;
    background-color: white;
  }

  .address-header {
    /*position: absolute;*/
    /*top: 20px;*/
    color: #666;
    border-left: 5px solid #58c04d;
    margin-left: 15px;
    padding-left: 15px;
    margin-bottom: 25px;
    margin-top: 20px;
  }

  .address-header-line-1 {
    margin-bottom: 0;
    margin-top: 0;
  }

  .spacer-div {
    height: 100px;
  }

  .topics-container {
    /*position: relative;*/
    /*overflow-y: auto;*/
    /*max-height: calc(100hv - 80px)*/
    /*overflow: scroll;*/
    /*top: 180px;*/
  }
</style>
