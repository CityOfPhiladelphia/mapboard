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
    <horizontal-table v-for="table in options.tables"
                      v-show="shouldShowTable(table.options.id)"
                      :item="tableGroupData"
                      :options="table.options"
                      :slots="table.slots"
    >
    </horizontal-table>
    <!-- <topic-component-group :topic-components="options.components" :item="item" /> -->
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent.vue';
  import HorizontalTable from './HorizontalTable.vue';
  // import TopicComponentGroup from '../TopicComponentGroup.vue';

  export default {
    // name: 'HorizontalTableGroup',
    mixins: [TopicComponent],
    components: {
      HorizontalTable,
      // TopicComponentGroup
    },
    // some internal state for things local enough that they shouldn't be in
    // vuex if we can avoid it.
    data() {
      const tableGroupData = {
        'tableGroupId': this.options.horizontalTableGroupId,
        'activeTable': null,
        'activeTableId': null,
      };
      // return {
      //   horizontalTableGroupId: this.options.horizontalTableGroupId,
      //   activeTable: null,
      //   activeTableId: null,
      // };
      return {
        tableGroupData
      };
    },
    created() {
      console.log('horizontalTableGroup created is starting, this.tableGroupData:', this.tableGroupData);
      if (this.options.filters) {
        console.log('horizontalTableGroup created, if this.options.filters is running:', this.options.filters, this.options.filters.entries());
        for (let filter of this.options.filters) {
        // for (let [index, filter] of this.options.filters.entries()) {
          console.log('for loop, this.options.filters:', this.options.filters[0]);
          // let filter = this.options.filters[0]
        // for (let [index, filter] of this.options.filters.entries()) {
          console.log('for loop, filter:', filter);
          // console.log('for loop, index:', index, 'filter:', filter);
          const defaultTableName = filter.values[0].value || {};
          console.log('for loop, defaultTableName:', defaultTableName);

          // add activeTable to local data
          this.tableGroupData.activeTable = defaultTableName;
          // add activeTableId to local data
          // console.log('for loop, this.options.components:', this.options.components);
          for (let comp of this.options.tables) {
            if (comp.options.id === defaultTableName) {
              this.tableGroupData.activeTableId = comp._id;
            }
          }
          console.log('horizontalTableGroup this.tableGroupData:', this.tableGroupData);
          this.$store.commit('setHorizontalTableGroupActiveTable', this.tableGroupData);
          // this.$store.commit('setHorizontalTableGroupActiveTableId', this.activeTable);
        }
        console.log('horizontalTableGroup created, if this.options.filters is ending');
      }
      if (this.options.alternate) {
        console.log('horizontalTableGroup created, if this.options.alternate - mainTable', this.options.alternate.mainTable, this.altMainTable, 'dependentTable', this.options.alternate.dependentTable, this.altDepTable);
        const sources = this.$store.state.sources;
        // console.log('Tablegroup source check dep', sources[this.altDepTable.dataSource].data);
        // console.log('Tablegroup source check main', sources[this.altMainTable.dataSource].data);
        if (sources[this.altDepTable.dataSource].data && !sources[this.altMainTable.dataSource].data) {
          // console.log('Tablegroup there is a dep table, and not a main table');
          this.activeTable = this.altDepTable.id;
          this.activeTableId = 'aaa'
          this.$store.commit('setHorizontalTableGroupActiveTable', this.tableGroupData);
          // this.$store.commit('setHorizontalTableGroupActiveTableId', this.activeTable);
        } else if (sources[this.altMainTable.dataSource].data) {
          this.activeTable = this.altMainTable.id;
          this.activeTableId = 'bbb'
          this.$store.commit('setHorizontalTableGroupActiveTable', this.tableGroupData);
          // this.$store.commit('setHorizontalTableGroupActiveTableId', this.activeTable);
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
      shouldShowTable(id) {
        let result = true;

        // if the table is in a tab group or table group, it will have an "item" in props
        // if (this.item) {
          // if it is in a table group, the item will contain an "activeTable" for the group
          // if (this.activeTable) {
            // const id = this.options.id;
            if (this.tableGroupData.activeTable != id) {
              result = false
            }
          // }
        // }
        // if there is no data, and the table should not show at all if it is empty
        // if (this.options.showOnlyIfData && this.tableGroupData.length === 0) {
        //   result = false;
        // }

        return result;
      },
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
        console.log('handle activeTable value change', e);
        const target = e.target;
        const slug = target.value;
        // deslugify filter value
        const valueObj = this.deslugifyFilterValue(slug);
        const tableName = valueObj.value;

        // add activeTable to local data
        this.tableGroupData.activeTable = tableName;

        // add activeTableId to local data
        for (let comp of this.options.tables) {
          console.log('tableName:', tableName, 'comp.options.id:', comp.options.id, 'comp:', comp);
          if (comp.options.id === tableName) {
            this.tableGroupData.activeTableId = comp._id;
          }
        }

        console.log('handleFilterValueChange, this.tableGroupData:', this.tableGroupData);
        this.$store.commit('setHorizontalTableGroupActiveTable', this.tableGroupData);
        // this.$store.commit('setHorizontalTableGroupActiveTableId', this.activeTable);
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
