<template>
  <div class="callout"> <!--v-html="this.message">-->
    <p v-html="this.message" />
    <!-- <p>{{ evaluateSlot(slots.text) }}</p> -->
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent.vue';

  export default {
    mixins: [TopicComponent],
    computed: {
      message() {
        return this.evaluateSlot(this.$props.slots.text)
      }
    }
  };
</script>

<style scoped>

.callout {
  position: inherit;
}
</style>
