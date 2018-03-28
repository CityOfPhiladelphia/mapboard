<template>
  <!-- REVIEW this uses patterns -->
  <div class="mb-badge panel center">
    <div class="mb-badge-header" :style="style">
      {{ evaluateSlot(slots.title) }}
    </div>
    <!-- <div class="mb-badge-body"
         v-if="this.value"
    >
      <h1>{{ evaluateSlot(slots.value) }}</h1>
      <strong>{{ evaluateSlot(slots.description) }}</strong>
    </div> -->
    <!-- <div class="mb-badge-body"
         v-if="this.data"
    > -->
      <topic-component-group :topic-components="options.components" :item="item" />
    <!-- </div> -->
  </div>
</template>

<script>
  // console.log('in Badge.vue script');
  import TopicComponent from './TopicComponent.vue';
  import TopicComponentGroup from '../TopicComponentGroup.vue';
  // console.log('in Badge.vue - TopicComponentGroup:', TopicComponentGroup);

  export default {
    mixins: [TopicComponent],
    // components: {
    //   TopicComponentGroup
    // },
    beforeCreate() {
      // console.log('in Badge.vue beforeCreate, TopicComponentGroup')
      this.$options.components.TopicComponentGroup = TopicComponentGroup;
    },
    computed: {
      // data() {
      //   return this.$props.slots.data;
      // },
      // value() {
      //   if (this.$props.slots.value) {
      //     return evaluateSlot(this.$props.slots.value);
      //   }
      // },
      // description() {
      //   if (this.$props.slots.description) {
      //     return evaluateSlot(this.$props.slots.description);
      //   }
      // },
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
    }
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
