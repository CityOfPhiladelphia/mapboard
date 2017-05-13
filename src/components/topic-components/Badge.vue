<template>
  <!-- REVIEW this uses patterns -->
  <div class="mb-badge panel center">
    <div class="mb-badge-header">
      <h4 class="alternate">{{ this.title }}</h4>
    </div>
    <div class="mb-badge-body">
      <h1>{{ evaluateSlot(slots.code) }}</h1>
      <strong>{{ evaluateSlot(slots.description) }}</strong>
    </div>
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent';

  export default {
    mixins: [TopicComponent],
    props: ['slots'],
    computed: {
      // TODO make abstract base class or mixin for Topic Comps that
      // handles/evaluates slots and sets these programmatically
      title() {
        return this.$props.slots.title;
      },
      value() {
        return this.$props.slots.value;
      },
      description() {
        return this.$props.slots.description;
      },
    }
  };
</script>

<style scoped>
  .mb-badge {
    width: 300px;
    padding: 0;
    margin: 0 auto;
    margin-bottom: inherit;
  }

  .mb-badge-header {
    /*REVIEW*/
    background: #58c04d;
    color: #eee;
    /*margin: 0;*/
    text-align: center;
  }

  .mb-badge-header h4 {
    margin: 0;
  }

  .mb-badge-body {
    padding: 10px;
  }

  .mb-badge-body > h1 {
    margin: 0;
    margin-bottom: 5px;
  }
</style>
