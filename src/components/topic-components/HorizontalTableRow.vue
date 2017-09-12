<template>
  <tr :class="{ active: item._featureId === activeFeature.featureId &&
                        tableId === activeFeature.tableId
             }"
      @mouseover="handleRowMouseover"
      @mouseout="handleRowMouseout"
  >
    <td v-for="field in fields"
        v-html="evaluateSlot(field.value, field.transforms, field.nullValue)"
    />
  </tr>
</template>

<script>
  import TopicComponent from './TopicComponent.vue';

  export default {
    mixins: [TopicComponent],
    props: ['fields', 'hasOverlay', 'tableId'],
    computed: {
      activeFeature() {
        return this.$store.state.activeFeature
      },
      isActive() {
        return this.activeFeature.featureId === this.$props.item._featureId
      },
    },
    watch: {
      isActive(value) {
        if (value === true) {
          const el = this.$el
          const inVp = this.inViewport(el);
          if (!inVp) {
            el.scrollIntoView();
            // el.scrollIntoView({block: "end", inline: "nearest"});
          }
        }
      }
    },
    methods: {
      handleRowMouseover(e) {
        if (!this.hasOverlay) return;

        const featureId = this.item._featureId;
        const tableId = this.tableId;
        this.$store.commit('setActiveFeature', { featureId, tableId });
      },
      handleRowMouseout(e) {
        if (!this.hasOverlay) return;
        this.$store.commit('setActiveFeature', null);
      },
      inViewport(el) {
        var rect = el.getBoundingClientRect();
        return (
         rect.top >= parseInt(this.$config.rootStyle.top.replace('px', '')) + 100 &&
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
      },
      featuresMatch(a, b) {
        return a.featureId === b.featureId && a.tableId === b.tableId;
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
