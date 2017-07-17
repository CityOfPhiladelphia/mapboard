<template>
  <div>
    <div v-if="!!this.$props.options.filters" class="center horizontal-table-controls">
      <!-- TODO the ids for filter spans should incorporate some sort of topic comp
      to make them globally unique -->
      <span v-for="(filter, index) in filters"
            :id="'filter-' + index"
      >
        {{ filter.label }}
        <select @change="handleFilterValueChange">
          <option v-for="filterValue in filter.values"
                  :value="slugifyFilterValue(filterValue)">
                  {{ filterValue.label }}
          </option>
        </select>
      </span>
    </div>

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
        }
          // this.slugifyFilterValue(this.options.filters[0].values[0])
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
    // watch: {
    //   activeFeature(value) {
    //     if (value) {
    //       this.scrollToRow(value);
    //     }
    //   }
    // },
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
      // scrollToRow(value) {
      //   console.log('scrollToRow is happening', value);
      // }
    }
  };
</script>

<style scoped>
  th {
    font-size: 15px;
    text-align: left;
  }

  .horizontal-table-controls select {
    margin: 10px;
    width: 125px;
  }
</style>
