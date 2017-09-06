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
    <p v-else>
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
}

ul {
  list-style: none;
  padding-left: 0;
  margin-left: 0;
}

</style>
