<template>
  <!-- REVIEW this uses patterns -->
  <div class="mb-badge panel center">
    <div class="mb-badge-header" :style="style">
      <h4 class="alternate">{{ evaluateSlot(slots.title) }}</h4>
    </div>
    <div class="mb-badge-body">
      <h1>{{ evaluateSlot(slots.value) }}</h1>
      <strong>{{ evaluateSlot(slots.description) }}</strong>
    </div>
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent';

  export default {
    computed: {
      style() {
        const titleBackgroundValOrFn = this.options.titleBackground;
        let titleBackground;
        if (typeof titleBackgroundValOrFn === 'function') {
          titleBackground = titleBackgroundValOrFn(this.$store.state);
        } else {
          titleBackground = titleBackgroundValOrFn;
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

  @media (min-width: 640px) {
    .mb-badge {
      width: 300px;
    }
  }

  .mb-badge-header {
    /*REVIEW*/
    /*background: #58c04d;*/
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
