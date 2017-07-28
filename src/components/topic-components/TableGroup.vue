<template>
  <div>
    <div v-if="!!this.$props.options.filters"
         class="mb-horizontal-table-controls"
    >
      <div v-for="(filter, index) in filters"
            :id="'filter-' + index"
            class="inline-block"
      >
        <div class='vertically-centered mb-select-text'>{{ filter.label }}</div>
        <select @change="handleFilterValueChange"
                class="mb-select"
        >
          <optgroup>
            <option v-for="filterValue in filter.values"
                    :value="slugifyFilterValue(filterValue)"
                    class="mb-select-option"
            >
              {{ filterValue.label }}
            </option>
          </optgroup>
        </select>
      </div>
    </div>
    <topic-component-group :topic-components="comps" :item="activeTable" />
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent';
  import TopicComponentGroup from '../TopicComponentGroup';

  export default {
    mixins: [TopicComponent],
    components: {
      TopicComponentGroup
    },
    // some internal state for things local enough that they shouldn't be in
    // vuex if we can avoid it.
    data() {
      // computed props aren't accessible here, so evaluate slot separately
      // const items = this.evaluateSlot(this.slots.items);
      return {
        activeTable: null,
      };
    },
    created() {
      if (this.filters) {
        for (let [index, filter] of this.filters.entries()) {
          const defaultValue = filter.values[0].value || {};
          // console.log(filter);
          this.activeTable = defaultValue;
        }
      }
    },
    computed: {
      comps() {
        return this.options.components;
      },
      filters() {
        return this.options.filters;
      },
      activeFilters() {
        //TODO make this work with not-always-on filters
        return this.filters;
      },
    },
    watch: {
      // when items change, update the activeItem
      // items(items) {
      //   const nextFirstItem = items[0];
      //   const nextActiveKey = this.keyForItem(nextFirstItem);
      //   this.activeItem = nextActiveKey;
      // }
    },
    methods: {
      slugifyFilterValue(filterValue) {
        const { direction, value, unit } = filterValue;
        return [direction, value, unit].join('-');
      },
      deslugifyFilterValue(slug) {
        const parts = slug.split('-');
        const [direction, value, unit] = parts;
        return {value, unit, direction};
      },
      handleFilterValueChange(e) {
        // console.log('handle activeTable value change', e);
        const target = e.target;
        const slug = target.value;
        // deslugify filter value
        const valueObj = this.deslugifyFilterValue(slug);
        // console.log('value obj', valueObj);
        this.activeTable = valueObj.value;
      },
    }
  };
</script>

<style scoped>
  .tabs-panel {
    padding: 20px;
  }

  .inline-block {
    display: inline-block;
  }

  .vertically-centered {
    display: inline-block;
    vertical-align: middle;
  }

  .mb-horizontal-table-controls {
    text-align: center;
    vertical-align: middle;
    margin-bottom: 10px;
  }

  /* dropdown filters */
  .mb-select-text {
    font-size: 16px;
    padding-right: 5px;
    padding-left: 5px;
  }

  .mb-select {
    width: auto;
    height: 40px;
    vertical-align: middle;
    /*padding-right: 20px;*/
  }

  .mb-select-option {
    display: inline-block;
    padding-right: 100px;
    margin-right: 100px;
  }
</style>
