<template>
  <div>
    <div v-if="!!this.$props.options.filters"
         class="mb-horizontal-table-controls"
    >
      <div v-for="(filter, index) in this.$props.options.filters"
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
    <topic-component-group :topic-components="options.components" :item="item" />
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent.vue';
  import TopicComponentGroup from '../TopicComponentGroup.vue';

  export default {
    mixins: [TopicComponent],
    components: {
      TopicComponentGroup
    },
    // some internal state for things local enough that they shouldn't be in
    // vuex if we can avoid it.
    data() {
      const item = {
        'tableGroupId': this.options.tableGroupId,
        'activeTable': null,
        'activeTableId': null
      }
      return {
        item
      };
    },
    created() {
      if (this.options.filters) {
        for (let [index, filter] of this.options.filters.entries()) {
          const defaultTableName = filter.values[0].value || {};

          // add activeTable to local data
          this.item.activeTable = defaultTableName;
          // add activeTableId to local data
          for (let comp of this.options.components) {
            if (comp.options.id === defaultTableName) {
              this.item.activeTableId = comp._id;
            }
          }

          this.$store.commit('setTableGroupActiveTable', this.item)
        }
      }
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
        const tableName = valueObj.value;

        // add activeTable to local data
        this.item.activeTable = tableName;

        // add activeTableId to local data
        for (let comp of this.options.components) {
          if (comp.options.id === tableName) {
            this.item.activeTableId = comp._id;
          }
        }

        this.$store.commit('setTableGroupActiveTable', this.item)
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
