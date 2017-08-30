<template>
  <div class="mb-panel-topics-greeting">
    <div class="columns medium-18 medium-centered">
      <div v-if="!components && !hasError">
        <p class="greeting">To start your search, type an address into the search box or click anywhere on the map.</p>
        <!-- <p v-if="hasError" v-html="message"></p> -->
      </div>

      <div v-if="!components && hasError" class="greeting greeting-error" v-html="errorMessage">

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
  import Badge from './topic-components/Badge.vue';
  import HorizontalTable from './topic-components/HorizontalTable.vue';
  import VerticalTable from './topic-components/VerticalTable.vue';
  // import Callout from './topic-components/Callout';
  import Image_ from './topic-components/Image.vue';

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
            We couldn't find
            ${input ? '<strong>' + input + '</strong>' : 'that address'}.
            Are you sure everything was spelled correctly?
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
      }
    }
  };
</script>

<style scoped>
  .mb-panel-topics-greeting {
    padding-top: 20px;
  }
  .greeting {
    font-size: 20px;
    color: #444;
    border-left: 5px solid #58c04d;
    padding: 14px;
  }
  .greeting-error {
    border-left-color: #ff0000;
  }
</style>
