<template>
  <div v-if="items.length">
    <div class="container">
      <h4 v-if="slots.title">
        {{ evaluateSlot(slots.title) }}
      </h4>
      <a class="button overlay-toggle" href="#" v-for="item in items" :data-key="keyForItem(item)"
                @click="handleClick"
                :class="{'active': isActive(item)}">
        {{ keyForItem(item) }}
      </a>
    </div>
  </div>
</template>


<script>
  import TopicComponent from './TopicComponent.vue';

  export default {
    mixins: [TopicComponent],
    computed: {
      items() {
        return this.evaluateSlot(this.slots.items);
      },
    },
    methods: {
      isActive(item) {
        const imageOverlay = this.$store.state.map.imageOverlay;
        const itemKey = this.keyForItem(item);
        return imageOverlay === itemKey;
      },
      keyForItem(item) {
        const getKeyFn = this.options.getKey;
        return getKeyFn(item);
      },
      handleClick(e) {
        const prevImageOverlay = this.$store.state.map.imageOverlay;
        const nextImageOverlay = e.target.getAttribute('data-key');
        // console.log(nextImageOverlay);
        if (prevImageOverlay === nextImageOverlay) {
          this.$store.commit('setImageOverlay', null);
        } else {
          this.$store.commit('setImageOverlay', nextImageOverlay);
        }
      },
    }
  };
</script>

<style scoped>
  .container {
    margin-bottom: 30px;
  }

  .button {
    margin-right: 10px;
    margin-top: 0px;
    margin-bottom: 0px;
  }

  .overlay-toggle {
    border: 1px solid #f99300;
    color: #f99300;
    background: #fff;
  }

  .overlay-toggle.active {
    background: #f99300;
    color: #fff;
  }
</style>
