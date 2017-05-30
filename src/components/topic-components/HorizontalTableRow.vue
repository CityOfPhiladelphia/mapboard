<template>
  <tr :class="{ active: item._featureId === activeFeature }"
      @mouseover="handleRowMouseover"
      @mouseout="handleRowMouseout"
  >
    <td v-for="field in fields"
        v-html="evaluateSlot(field.value)"
    >
      <!-- {{ evaluateSlot(field.value) }} -->
    </td>
  </tr>
</template>

<script>
  import TopicComponent from './TopicComponent';

  export default {
    mixins: [TopicComponent],
    props: ['fields'],
    computed: {
      activeFeature() {
        return this.$store.state.activeFeature
      }
    },
    methods: {
      handleRowMouseover(e) {
        const featureId = this.item._featureId;
        this.$store.commit('setActiveFeature', featureId);
      },
      handleRowMouseout(e) {
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
