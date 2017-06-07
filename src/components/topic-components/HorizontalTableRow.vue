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
