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
          // console.log('tablegroup this.item', this.item);
          this.$store.commit('setTableGroupActiveTable', this.item)
        }
      }
      if (this.options.alternate) {
        // console.log('TableGroup created - mainTable', this.options.alternate.mainTable, this.altMainTable, 'dependentTable', this.options.alternate.dependentTable, this.altDepTable);
        const sources = this.$store.state.sources;
        // console.log('Tablegroup source check dep', sources[this.altDepTable.dataSource].data);
        // console.log('Tablegroup source check main', sources[this.altMainTable.dataSource].data);
        if (sources[this.altDepTable.dataSource].data && !sources[this.altMainTable.dataSource].data) {
          // console.log('Tablegroup there is a dep table, and not a main table');
          this.item.activeTable = this.altDepTable.id;
          this.item.activeTableId = 'aaa'
          this.$store.commit('setTableGroupActiveTable', this.item);
        } else if (sources[this.altMainTable.dataSource].data) {
          this.item.activeTable = this.altMainTable.id;
          this.item.activeTableId = 'bbb'
          this.$store.commit('setTableGroupActiveTable', this.item);
        }
      }
      if (this.options.showBoth) {
        console.log('tableGroup showBoth');
      }
    },
    computed: {
      altMainTable() {
        if (this.options.alternate) {
          return this.options.alternate.mainTable;
        } else {
          return null
        }
      },
      altDepTable() {
        if (this.options.alternate) {
          return this.options.alternate.dependentTable;
        } else {
          return null
        }
      },
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
