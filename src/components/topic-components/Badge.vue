<template>
  <!-- REVIEW this uses patterns -->
  <div class="mb-badge panel center">
    <div class="mb-badge-header" :style="style">
      {{ evaluateSlot(slots.title) }}
    </div>
    <div class="mb-badge-body">
      <h1>{{ evaluateSlot(slots.value) }}</h1>
      <strong>{{ evaluateSlot(slots.description) }}</strong>
    </div>
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent.vue';

  export default {
    computed: {
      style() {
        const titleBackgroundValOrFn = (this.options || {}).titleBackground;
        let titleBackground;

        if (titleBackgroundValOrFn) {
          if (typeof titleBackgroundValOrFn === 'function') {
            titleBackground = titleBackgroundValOrFn(this.$store.state);
          } else {
            titleBackground = titleBackgroundValOrFn;
          }
        } else {
          titleBackground = '#444';
        }

        return { background: titleBackground };
      }
    },
    mixins: [TopicComponent]
  };
</script>

<style scoped>
  .mb-badge {
    /*width: 300px;*/
    padding: 0;
    margin: 0 auto;
    margin-bottom: inherit;
  }

  @media (max-width: 640px) {
    .mb-badge {
      width: 100%;
    }
  }

  /*REVIEW this should use foundation classes*/
  @media (min-width: 640px) {
    .mb-badge {
      width: 325px;
    }
  }

  .mb-badge-header {
    color: #fff;
    font-weight: bold;
    text-align: center;
    padding-top: 2px;
    padding-bottom: 2px;
  }

  .mb-badge-body {
    padding: 12px;
  }

  .mb-badge-body > h1 {
    margin: 0;
    margin-bottom: 5px;
  }
</style>
