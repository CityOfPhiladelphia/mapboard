<template>
  <div class="list">
    <ul v-if="evaluateSlot(slots.relatedAddresses)">
      <li v-for="relatedAddress in evaluateSlot(slots.relatedAddresses)"
      >
        <a :href="'#/' + encodeURIComponent(relatedAddress.properties.street_address)"
        >
          {{ relatedAddress.properties.street_address }}
        </a>
      </li>
    </ul>
    <p v-else
       class="message-p"
    >
      No related addresses were found for this address.
    </p>
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent.vue';

  export default {
    mixins: [TopicComponent],
  };
</script>

<style scoped>

.list {
  position: inherit;
  margin-bottom: 0px !important;
}

ul {
  list-style: none;
  padding-left: 0;
  margin-left: 0;
}

.message-p {
  margin-bottom: 0px;
}

/*.topic-body {
  margin-bottom: 0px;
}*/

</style>
