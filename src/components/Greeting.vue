<template>
  <div class="mb-panel-topics-greeting">
    <div class="columns medium-18 medium-centered">
      <div v-if="!components && !hasError" class="callout">
        <p>To start your search, type an address into the search box or click anywhere on the map.</p>
        <!-- <p v-if="hasError" v-html="message"></p> -->
      </div>

      <div v-if="!components && hasError" class="callout callout-error" v-html="errorMessage">

      </div>
      <component v-if="components"
                 v-for="(topicComp, topicCompIndex) in components"
                 :is="topicComp.type"
                 class="topic-comp"
                 :slots="topicComp.slots"
                 :key="'greeting'"
      />
    </div>
  </div>
</template>

<script>
  // TODO find a less explicit way of importing everything
  import Badge from './topic-components/Badge';
  import HorizontalTable from './topic-components/HorizontalTable';
  import VerticalTable from './topic-components/VerticalTable';
  import Callout from './topic-components/Callout';
  import Image_ from './topic-components/Image';

  export default {
    components: {
      Image_
    },
    computed: {
      components() {
        const greetingConfig = this.$config.greeting || {};
        return greetingConfig.components;
      },
      hasError() {
        return this.$store.state.geocode.status === 'error';
      },
      errorMessage() {
        const input = this.$store.state.geocode.input;
        return `
          <p>
            We couldn't find <strong>${input}</strong>. Are you sure everything was spelled correctly?
          </p>
          <p>
            Here are some examples of things you can search for:
          </p>
          <ul>
            <li>1234 Market St</li>
            <li>1001 Pine Street #201</li>
            <li>12th & Market</li>
          </ul>
        `;
      },
      calloutClass() {
        return {
          'callout': true,
          'callout-error': this.hasError
        };
      }
    }
  };
</script>

<style scope>
  .mb-panel-topics-greeting {
    padding-top: 20px;
  }
  .callout {
    font-size: 20px;
    /*vertical-align: middle;*/
  }
  .callout p {
    color: #444;
  }
  .callout-error {
    border-left-color: #ff0000;
    /*background: #ffc4c4;*/
  }
  .callout ul {
    /*font-size: 20px;*/
    /*color: #222;*/
  }
</style>
