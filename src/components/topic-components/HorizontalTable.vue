<template>
  <div v-if="shouldShowTable ? slots.data === shouldShowTable: true">
    <!-- controls -->
    <div class="mb-horizontal-table-controls">
        <div v-if="!!this.$props.options.filters"
             class="vertically-centered"
        >
          <!-- TODO the ids for filter spans should incorporate some sort of topic comp
          to make them globally unique -->
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

        <form @submit.prevent="handleFilterFormX"
              v-if="!!this.$props.options.filterFieldsByText"
              class="vertically-centered"
        >
          <input :class="this.inputClass"
                 placeholder="Search for text"
                 id="theInput"
                 @keyup="handleFilterFormKeyup"
          />
          <button v-if="this.filterWords !=''"
                  class="mb-search-control-button"
          >
            <i class="fa fa-times fa-lg"></i>
          </button>
        </form>
    </div> <!-- end of mb-horizontal-table-controls block -->

    <div class="mb-horizontal-table-body">
      <h4 v-if="slots.title">
        {{ evaluateSlot(slots.title) }} {{ count }}
      </h4>

      <table role="grid" class="tablesaw tablesaw-stack" data-tablesaw-mode="stack">
        <thead>
          <tr>
            <th v-for="field in fields">{{ evaluateSlot(field.label) }}</th>
          </tr>
        </thead>
        <tbody>
          <!-- <tr v-for="item in evaluateSlot(slots.items)"
              :class="{ active: item._featureId === activeFeature }"
          > -->
          <!-- <horizontal-table-row v-for="item in itemsSorted" -->
          <horizontal-table-row v-for="item in itemsFiltered"
                                :item="item"
                                :fields="fields"
                                :key="item._featureId"
                                :hasOverlay="hasOverlay"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent';
  import HorizontalTableRow from './HorizontalTableRow';

  export default {
    mixins: [TopicComponent],
    data() {
      const filters = this.filters || [];
      const defaultFilterSelections = Object.keys(filters).reduce((acc, i) =>
                                      {
                                        const key = `filter-${i}`;
                                        acc[key] = {};
                                      }, {});

      return {
        initiallyFilteredTable: [],
        filterSelections: defaultFilterSelections,
        filterWords: '',
      }
    },
    components: {
      HorizontalTableRow
    },
    created() {
      if (this.filters) {
        for (let [index, filter] of this.filters.entries()) {
          const key = `filter-${index}`;
          const defaultValue = filter.values[0] || {};
          this.filterSelections[key] = defaultValue;
        }
      }
    },
    mounted() {
      const items = this.items;
      let itemsFiltered;
      if (this.$props.slots.data === this.shouldShowTable) {
        itemsFiltered = this.filterItems(items,
                                               this.filters,
                                               this.filterSelections);
      } else {
        itemsFiltered = []
      }
      console.log('HORIZTABLE MOUNTED', this.options.topicKey, this.options.id, 'length:', itemsFiltered.length);
      // update the local state
      this.initiallyFilteredTable = itemsFiltered;
    },
    watch: {
      shouldShowTable(nextTable) {
        console.log('WATCH SHOULDSHOWTABLE FIRED', nextTable, this.$props.slots.data);
        const items = this.items;
        let itemsFiltered;
        if (this.$props.slots.data === nextTable) {
          itemsFiltered = this.filterItems(items,
                                                 this.filters,
                                                 this.filterSelections);
        } else {
          itemsFiltered = []
        }
        // update the local state
        this.initiallyFilteredTable = itemsFiltered;
      },
      filterWords() {
        console.log('WATCH FILTERWORDS FIRED');
        this.filterByWords();
      },
      initiallyFilteredTable() {
        console.log('WATCH INITIALLYFILTEREDTABLE FIRED');
        this.filterByWords();
      },
    },
    computed: {
      shouldShowTable() {
        if (this.$props.item) {
          const filterValue = this.$props.item//['filter-0'].value;
          return filterValue;
        } else {
          return undefined;
        }
      },
      inputClass() {
        if (this.filterWords === '') {
          return 'mb-search-control-input';
        } else {
          return 'mb-search-control-input-full';
        }
      },
      filters() {
        return this.options.filters;
      },
      activeFilters() {
        //TODO make this work with not-always-on filters
        return this.filters;
      },
      fields() {
        return this.options.fields;
      },
      hasOverlay() {
        return !!this.options.mapOverlay;
      },
      items() {
        const itemsSlot = this.slots.items;
        return this.evaluateSlot(itemsSlot) || [];
      },
      count() {
        const length = this.itemsFiltered.length;
        return `(${length})`;
      },
      itemsFiltered() {
        console.log('HORIZTABLE COMPUTED: ITEMSFILTERED IS RECALCULATING')
        const unfiltTables = this.$store.state.tables;
        const tables = unfiltTables.filter(comp => {
          const key = comp.key;
          const id = comp.id;
          // console.log('key', key, this.$store.state.activeTopic, 'id', id, this.$props.options.id);
          return (
            id === this.$props.options.id &&
            key === this.$store.state.activeTopic
          )
        });
        // console.log('tables:', tables);
        let itemsFiltered = tables[0].data;
        return itemsFiltered;
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
        // console.log('handle filter value change', e);

        const target = e.target;
        const slug = target.value;

        // deslugify filter value
        const valueObj = this.deslugifyFilterValue(slug);

        const parent = target.parentElement;
        const parentId = parent.id;

        this.filterSelections[parentId] = valueObj;

        const items = this.items;
        let itemsFiltered = this.filterItems(items,
                                               this.filters,
                                               this.filterSelections);
        // update the local state
        this.initiallyFilteredTable = itemsFiltered;
      },
      values(item) {
        const fields = this.options.fields;
        const sourceFields = fields.map(field => field.sourceField);
        return sourceFields.map(sourceField => item[sourceField])
      },
      handleFilterFormKeyup(e) {
        const input = e.target.value;
        this.filterWords = input;
      },
      handleFilterFormX(e) {
        e.target[0].value = ''
        this.filterWords = '';
      },
      filterItems(items, filters, filterSelections) {
        console.log('HORIZONTALTABLE FILTERITEMS IS RUNNING, starting with', items.length, 'items');//, filters, filterSelections);
        let itemsFiltered = items.slice();

        if (filters) {
          for (let [index, filter] of filters.entries()) {
            const key = `filter-${index}`;
            const data = filterSelections[key];
            const {type, getValue} = filter;
            const {direction, unit, value} = data;

            // TODO put these in separate methods
            switch(type) {
              case 'data':
                // console.log('DATA FILTER');
                // itemsFiltered = itemsFiltered.filter(item => {
                //   const itemValue = getValue(item);
                //   console.log('horiz table itemValue:', itemValue);
                //   return itemValue;
                // });
                break;
              case 'time':
                // console.log('TIME FILTER');
                let min, max;

                if (direction === 'subtract') {
                  max = moment();
                  min = moment().subtract(value, unit);
                  // console.log('max:', max, 'min', min);
                } else if (direction === 'add') {
                  min = moment();
                  max = min.add(value, unit);
                } else {
                  throw `Invalid time direction: ${direction}`;
                }

                itemsFiltered = itemsFiltered.filter(item => {
                  const itemValue = getValue(item);
                  const itemMoment = moment(itemValue);
                  const isBetween = itemMoment.isBetween(min, max)
                  return isBetween;
                });
                // console.log('ITEMS FILTERED BY TIME FILTER', itemsFiltered);
                break;

              default:
                throw `Unhandled filter type: ${type}`;
                break;
            }
          }
        }
        return itemsFiltered;
      },
      filterByWords() {
        console.log('HORIZONTALTABLE FILTERBYWORDS IS RUNNING');
        const items = this.initiallyFilteredTable;
        let itemsFiltered;
        itemsFiltered = items.filter(item => {
          let str = '';
          const filterFields = this.options.filterFieldsByText || [];

          for (let field of filterFields) {
            if (item.properties) {
              str += item.properties[field].toLowerCase();
            } else {
              str += item[field].toLowerCase();
            }
          }

          return str.includes(this.filterWords.toLowerCase());
        })
        // update global state
        this.updateFilteredDataToState(itemsFiltered);
      },

      updateFilteredDataToState(itemsFiltered) {
        this.$store.commit('setTableFilteredData', {
          topicKey: this.options.topicKey,
          id: this.options.id,
          data: itemsFiltered
        });
      },

      sortItems(items, sortOpts) {
        // console.log('computed: itemsSorted');
        // TODO finish this
        // if (Object.keys(this.filterData).length) {
        //   console.log('there is filterData', this.filterData);
        //   return this.itemsFiltered;
        // } else {
        //   console.log('there is no filterData');
        //   return this.items;
        // }

        // const items = this.itemsFiltered;
        // const sortOpts = this.options.sort;

        // if there's no no sort config, just return the items.
        if (!sortOpts) {
          return items;
        }

        const getValueFn = sortOpts.getValue;
        const order = sortOpts.order;

        // get sort fn or use this basic one
        const sortFn = sortOpts.compare || this.defaultSortFn;

        return items.sort(sortFn);
      },
      defaultSortFn(a, b) {
        const valA = getValueFn(a);
        const valB = getValueFn(b);
        let result;

        if (valA < valB) {
          result = -1;
        } else if (valB < valA) {
          result = 1;
        } else {
          result = 0;
        }

        // reverse if the target order is desc
        if (order === 'desc') {
          result = result * -1;
        } else if (order !== 'asc') {
          throw `Unknown sort order: ${order}`;
        }

        // console.log('compare', valA, 'to', valB, ', result:', result);

        return result;
      }
    }
  };
</script>

<style scoped>
  th {
    font-size: 15px;
    text-align: left;
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

  /* input filters using text */
  .mb-search-control-input {
    border: 1px solid #f2c612;
    height: 40px !important;
    line-height: 48px;
    padding: 8px;
    font-size: 16px;
    width: 300px;
  }

  .mb-search-control-input-full {
    border: 1px solid #f2c612;
    height: 40px !important;
    line-height: 48px;
    padding: 8px;
    font-size: 16px;
    width: 260px;
  }

  .mb-search-control-button {
    width: 40px;
    background: #ccc;
    line-height: 40px;
    float: right;
  }

  .group:after {
    content: "";
    display: table;
    clear: both;
  }
</style>
