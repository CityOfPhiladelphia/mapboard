<template>
  <div>
    <ul class="tabs" data-tabs>
      <li class="tabs-title"
          v-for="item in items"
          v-bind:class="{'is-active': itemIsActive(item)}"
          :key="keyForItem(item)"
      >
        <a v-bind:href="'#parcel-' + keyForItem(item)"
           v-on:click="activeItem = keyForItem(item)"
        >
          <!-- {{ titleForItem(item) }} -->
          {{ keyForItem(item) }}
        </a>
      </li>
    </ul>

    <div class="tabs-content">
      <div class="tabs-panel"
           v-for="item in items"
           v-bind:class="{'is-active': itemIsActive(item)}"
           v-bind:id="'parcel-' + keyForItem(item)"
      >
        <!-- TODO render content. should this be treated like a topic body? -->
        Content here for parcel <strong>{{ titleForItem(item) }}</strong>
      </div>
    </div>
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent';

  export default {
    mixins: [TopicComponent],
    // some internal state for things local enough that they shouldn't be in
    // vuex if we can avoid it.
    data() {
      // computed props aren't accessible here, so evaluate slot separately
      const items = this.evaluateSlot(this.slots.items);
      return {
        activeItem: this.keyForItem(items[0]),
      };
    },
    mounted() {
      // REVIEW globals. also is this still needed?
      $(document).foundation();
    },
    beforeUpdate() {
      // when items change, update this component's internal state
      const nextFirstItem = this.items[0];
      const nextActiveKey = this.keyForItem(nextFirstItem);
      this.activeItem = nextActiveKey;
    },
    // props: [],
    computed: {
      items() {
        return this.evaluateSlot(this.slots.items);
      },
      contentComponents() {
        return this.options.contentComponents;
      }
    },
    methods: {
      keyForItem(item) {
        try {
          return this.options.getKey(item);
        } catch (e) {
          return null;
        }
      },
      titleForItem(item) {
        try {
          return this.options.getTitle(item);
        } catch (e) {
          return null;
        }
      },
      itemIsActive(item) {
        const isActive = (this.activeItem === this.keyForItem(item));
        return isActive;
      }
    }
  };
</script>

<style scoped>

</style>
