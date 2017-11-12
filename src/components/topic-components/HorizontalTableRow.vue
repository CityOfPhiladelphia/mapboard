<template>
  <tr :class="{ active: item._featureId === activeFeature.featureId &&
                        tableId === activeFeature.tableId
             }"
      @mouseover="handleRowMouseover"
      @click="handleRowClick"
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
        return this.$store.state.activeFeature;
      },
      isActive() {
        return this.activeFeature.featureId === this.$props.item._featureId;
      },
      isMobileOrTablet() {
        return this.$store.state.is_mobile_or_tablet;
      },
    },
    watch: {
      isActive(value) {
        if (value === true) {
          const el = this.$el;
          const visible = this.isElementInViewport(el);

          console.log('visible?', visible ? 'YES' : 'NO');

          if (!visible) {
            el.scrollIntoView();
          }
        }
      }
    },
    methods: {
      handleRowMouseover(e) {
        console.log('handleRowMouseover is starting');
        if(!this.isMobileOrTablet) {
          console.log('handleRowMouseover actions are running');
          if (!this.hasOverlay) return;

          const featureId = this.item._featureId;
          const tableId = this.tableId;
          this.$store.commit('setActiveFeature', { featureId, tableId });
        }
      },
      handleRowClick(e) {
        console.log('handleRowClick is starting');
        if(this.isMobileOrTablet) {
          console.log('handleRowClick actions are running');
          if (!this.hasOverlay) return;

          const featureId = this.item._featureId;
          const tableId = this.tableId;
          this.$store.commit('setActiveFeature', { featureId, tableId });
        }
      },
      handleRowMouseout(e) {
        console.log('handleRowMouseout is starting');
        // if(!this.isMobileOrTablet) {
          console.log('handleRowMouseout actions are running');
          if (!this.hasOverlay) return;
          this.$store.commit('setActiveFeature', null);
        // }
      },
      // REVIEW there's very similar code in the controller. if these can be
      // the same thing, make it into a util.
      isElementInViewport(el) {
        const rect = el.getBoundingClientRect();

        console.log('bounding box', rect);

        const visibility = {
          // TODO the 108 below is account for the combined height of the
          // app header and address header. this is not a good long-term
          // solution - instead, use the `bottom` value of the address header's
          // bounding rect. however, this should only fire on small devices,
          // which would require again hard-coding screen breakpoints from
          // standards or some other magic, which might not a huge
          // improvement in terms of decoupling logic and presentation. hmm.
          top: rect.top >= 108,
          left: rect.left >= 0,
          bottom: rect.bottom <= (window.innerHeight || document.documentElement.clientHeight),
          right: rect.right <= (window.innerWidth || document.documentElement.clientWidth),
        };

        console.log('visibility', visibility);

        // return if all sides are visible
        return Object.values(visibility).every(val => val);
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
