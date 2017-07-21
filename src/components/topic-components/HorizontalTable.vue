<template>
  <div>
    <!-- controls -->
    <div class="mb-horizontal-table-controls">
        <div v-if="!!this.$props.options.filters"
             class="vertically-centered"
        >
          <!-- TODO the ids for filter spans should incorporate some sort of topic comp
          to make them globally unique -->
          <div v-for="(filter, index) in filters"
                :id="'filter-' + index"
          >
            <div class='vertically-centered mb-select-text'>{{ filter.label }}</div>
            <select @change="handleFilterValueChange"
                    class="mb-select"
            >
              <option v-for="filterValue in filter.values"
                      :value="slugifyFilterValue(filterValue)"
              >
                {{ filterValue.label }}
              </option>
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
          <horizontal-table-row v-for="item in itemsSorted"
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
  import moment from 'moment';
  import TopicComponent from './TopicComponent';
  import HorizontalTableRow from './HorizontalTableRow';

  export default {
    mixins: [TopicComponent],
    data() {
      return {
        filterData: {
          'filter-0': {},
          'filter-1': {},
          'filter-2': {}
        },
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
          // console.log(filter);
          const defaultValue = filter.values[0] || {};
          this.filterData[key] = defaultValue;
        }
      }
    },
    computed: {
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
      // activeFeature() {
      //   return this.$store.state.activeFeature
      // },
      fields() {
        return this.options.fields;
      },
      hasOverlay() {
        return !!this.options.overlay;
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
        // console.log('computed: itemFiltered, filterData:', this.filterData);
        const items = this.items;
        let itemsFiltered = items.slice();
        // console.log('test1, itemsFiltered:', itemsFiltered)
        if (this.filters) {
          for (let [index, filter] of this.filters.entries()) {
            // console.log('filter', filter, index);

            const key = `filter-${index}`;
            const data = this.filterData[key];
            const {type, getValue} = filter;
            const {direction, unit, value} = data;
            // console.log('unit:', unit, 'value:', value);

            // TODO put these in separate methods
            switch(type) {
              case 'time':
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
                  // console.log('item', item);
                  const itemValue = getValue(item);
                  // console.log('item value', itemValue);
                  const itemMoment = moment(itemValue);
                  // console.log('comparing', min, itemMoment, max);
                  const isBetween = itemMoment.isBetween(min, max)
                  // if (isBetween === true) {
                    // console.log('is between?', isBetween);
                  // }
                  return isBetween;
                });
                break;

              default:
                throw `Unhandled filter type: ${type}`;
                break;
            }
          }
        }

        itemsFiltered = itemsFiltered.filter(item => {
          let string = ''
          for (let field of this.$props.options.filterFieldsByText) {
            string += item.properties[field].toLowerCase()
          }
          return string.includes(this.filterWords.toLowerCase());
        })
        let idsFiltered = []
        for (let item of itemsFiltered) {
          idsFiltered.push(item._featureId);
        }
        this.$store.commit('setMapFilters', idsFiltered);

        // console.log('end of computed itemsFiltered:', itemsFiltered);
        return itemsFiltered;
      },
      itemsSorted() {
        // console.log('computed: itemsSorted');
        // TODO finish this
        // if (Object.keys(this.filterData).length) {
        //   console.log('there is filterData', this.filterData);
        //   return this.itemsFiltered;
        // } else {
        //   console.log('there is no filterData');
        //   return this.items;
        // }

        const items = this.itemsFiltered;
        const sortOpts = this.options.sort;

        // if there's no no sort config, just return the items.
        if (!sortOpts) {
          return items;
        }

        const getValueFn = sortOpts.getValue;
        const order = sortOpts.order;

        // get sort fn or use this basic one
        function defaultSortFn(a, b) {
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
        const sortFn = sortOpts.compare || defaultSortFn;

        return items.sort(sortFn);
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
        // console.log('value obj', valueObj);

        const parent = target.parentElement;
        const parentId = parent.id;

        this.filterData[parentId] = valueObj;
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
      }
    }
  };
</script>

<style scoped>
  th {
    font-size: 15px;
    text-align: left;
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
  }

  .mb-select {
    width: 100px;
    height: 40px;
    vertical-align: middle;
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
