<template>
  <div class="large-12 columns mb-panel mb-panel-topics">
    <div class="row">
    <!-- <div class="row" :class="{ 'row-with-widget': this.$store.state.pictometryActive }"> -->
      <!-- before search -->
      <div class="mb-panel-topics-greeting" v-show="!ais">
        <div class="columns medium-18 medium-centered">
          <div class="callout">
            <p>To start your search, type an address into the search box or click anywhere on the map.</p>
          </div>
        </div>
      </div>

      <!-- after search -->
      <div v-show="ais">
        <h1 v-if="address">{{ address }}</h1>
        <Topic v-for="topic in this.$config.topics"
               :topicKey="topic.key"
               :key="topic.key"
        />
      </div>

    </div>
    <!-- <slot name="pictWidget" /> -->
  </div>
</template>

<script>
  import Topic from './Topic';

  export default {
    components: { Topic },
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
  .mb-panel-topics-greeting {
    padding-top: 20px;
  }

  .row-with-widget {
    height: 50%;
  }

</style>
