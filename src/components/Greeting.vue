<template>
  <div class="mb-panel-topics-greeting">
    <div class="columns medium-20 medium-centered">

      <address-input v-if="this.shouldShowAddressInput" />
      <address-candidate-list v-if="this.addressAutocompleteEnabled && this.shouldShowAddressInput"/>

      <div v-if="!components && !hasError" class="greeting" v-html="initialMessage">
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
  import philaVueComps from '@cityofphiladelphia/phila-vue-comps';
  const Image_ = philaVueComps.Image;
  const AddressInput = philaVueComps.AddressInput;
  const AddressCandidateList = philaVueComps.AddressCandidateList;

  export default {
    components: {
      Image_,
      AddressInput,
      AddressCandidateList,
    },
    computed: {
      shouldShowAddressInput() {
        if (this.$config.addressInputLocation == 'topics') {
          return true;
        } else {
          return false;
        }
      },
      addressAutocompleteEnabled() {
        // TODO tidy up the code
        if (this.$config.addressAutocomplete.enabled === true) {
          return true;
        } else {
          return false;
        }
      },
      components() {
        const greetingConfig = this.$config.greeting || {};
        return greetingConfig.components;
      },
      hasError() {
        return this.$store.state.geocode.status === 'error';
      },
      initialMessage() {
        const greetingConfig = this.$config.greeting || {};
        return greetingConfig.initialMessage;
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
    padding: 14px;
  }

  .greeting-error {
    border-left-color: #ff0000;
  }

  /*medium*/
  @media screen and (min-width: 750px) {
    .mb-panel-topics-greeting {
      /*make this scroll on medium screens*/
      /*REVIEW this is a little hacky. the 120px shouldn't be hard-coded.*/
      height: calc(100vh - 120px);
      overflow: auto;
    }
  }
</style>
