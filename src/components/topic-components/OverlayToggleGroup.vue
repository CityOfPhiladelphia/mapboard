<template>
  <div v-if="items.length">
    <div class="container">
      <h4 v-if="slots.title">
        {{ evaluateSlot(slots.title) }}
      </h4>
      <a class="button overlay-toggle" href="#" v-for="item in items" :data-key="keyForItem(item)"
                @click="handleClick"
                @mouseover="handleMouseover(keyForItem(item))"
                @mouseout="handleMouseout"
                :class="{'active': isActive(item), 'mouseover': isMousedover(item)}">
        {{ keyForItem(item) }}
      </a>
    </div>
  </div>
</template>


<script>
  import TopicComponent from './TopicComponent.vue';

  export default {
    mixins: [TopicComponent],
    data() {
      return {
        mouseover: null
      }
    },
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
        e.preventDefault();
        const prevImageOverlay = this.$store.state.map.imageOverlay;
        const nextImageOverlay = e.target.getAttribute('data-key');
        // console.log(nextImageOverlay);
        if (prevImageOverlay === nextImageOverlay) {
          this.$store.commit('setImageOverlay', null);
        } else {
          this.$store.commit('setImageOverlay', nextImageOverlay);
        }
      },
      handleMouseover(key) {
        this.mouseover = key;
      },
      handleMouseout() {
        this.mouseover = null;
      },
      isMousedover(item) {
        const itemKey = this.keyForItem(item);
        if (itemKey === this.mouseover) {
          return true;
        } else {
          return false;
        }
      }
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
    border: 1px solid #f99300 !important;
    color: #f99300 !important;
    background: #fff !important;
  }

  .overlay-toggle.mouseover {
    background: #444 !important;
    color: white !important;
  }

  .overlay-toggle.active {
    background: #f99300 !important;
    color: #fff !important;
  }
</style>
