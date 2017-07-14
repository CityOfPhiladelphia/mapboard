<template>
  <tr :class="{ active: item._featureId === activeFeature }"
      @mouseover="handleRowMouseover"
      @mouseout="handleRowMouseout"
  >
    <td v-for="field in fields"
        v-html="evaluateSlot(field.value, field.transforms)"
    />
  </tr>
</template>

<script>
  import TopicComponent from './TopicComponent';

  export default {
    mixins: [TopicComponent],
    props: ['fields', 'hasOverlay'],
    computed: {
      activeFeature() {
        return this.$store.state.activeFeature
      },
      isActive() {
        return this.activeFeature === this.$props.item._featureId
      },
    },
    watch: {
      isActive(value) {
        if (value === true) {
          const el = this.$el
          const inVp = this.inViewport(el);
          if (!inVp) {
            el.scrollIntoView();
          }
        }
      }
    },
    methods: {
      handleRowMouseover(e) {
        if (!this.hasOverlay) return;

        const featureId = this.item._featureId;
        this.$store.commit('setActiveFeature', featureId);
      },
      handleRowMouseout(e) {
        if (!this.hasOverlay) return;
        this.$store.commit('setActiveFeature', null);
      },
      inViewport(el) {
        var rect = el.getBoundingClientRect();
        return (
         rect.top >= 0 &&
         rect.left >= 0 &&
         rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
         rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
        );
        // return (
        //     elRect.top >= parRect.top &&
        //     elRect.left >= parRect.left &&
        //     elRect.bottom <= parRect.bottom &&
        //     elRect.right <= parRect.right
        // );
      }
    }
  };
</script>

<style scoped>
  .active {
    background: #F3D661;
  }

  td {
    font-size: 15px;
    text-align: left;
  }
</style>
