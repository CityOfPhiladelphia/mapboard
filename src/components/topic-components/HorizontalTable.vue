<template>
  <div v-if="shouldShowTable">
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
          <button v-if="this.searchText !=''"
                  class="mb-search-control-button"
          >
            <i class="fa fa-times fa-lg"></i>
          </button>
        </form>
    </div> <!-- end of mb-horizontal-table-controls block -->

    <div class="mb-horizontal-table-body">
      <div v-if="slots.title">
        <h4 style="display:inline-block">
          {{ evaluateSlot(slots.title) }} {{ countText }}
        </h4>
        <h5 style="display:inline-block; color: gray">
          {{ evaluateSlot(slots.subtitle) }}
        </h5>
      </div>
      <table role="grid" class="tablesaw tablesaw-stack" data-tablesaw-mode="stack">
        <thead>
          <tr>
            <th v-for="field in fields">{{ evaluateSlot(field.label) }}</th>
          </tr>
        </thead>
        <tbody>
          <horizontal-table-row v-for="item in itemsLimited"
                                :item="item"
                                :fields="fields"
                                :key="item._featureId"
                                :hasOverlay="hasOverlay"
                                :tableId="options.tableId"
          />
        </tbody>
      </table>

      <!-- external link (aka "see more")-->
      <a v-if="options.externalLink && shouldShowExternalLink"
         :href="externalLinkHref"
         class="external"
         target="_blank"
      >
        {{ externalLinkText }}
      </a>
    </div>
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent';
  import HorizontalTableRow from './HorizontalTableRow';

  export default {
    mixins: [TopicComponent],
    data() {
      const filters = this.$props.options.filters || [];
      const defaultFilterSelections = Object.keys(filters).reduce((acc, i) =>
                                      {
                                        const key = `filter-${i}`;
                                        acc[key] = {};
                                        return acc;
                                      }, {});

      const initialData = {
        filterSelections: defaultFilterSelections,
        searchText: ''
      };

      return initialData;
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

      // put row data in state once on load
      // const data = this.itemsAfterSearch;
      // const tableId = this.options.tableId;

      // this.$store.commit('setTableFilteredData', {
      //   tableId,
      //   data
      // });
    },
    mounted() {
      this.updateTableFilteredData();
    },
    watch: {
      itemsAfterFilters(nextItems) {
        // console.log('WATCH items after filters', nextItems);

        this.updateTableFilteredData();
      }
    },
    computed: {
      shouldShowTable() {
        if (this.item) {
          if (this.item.activeTable) {
            const filterValue = this.item.activeTable;
            const id = this.options.id;
            if (filterValue === id) {
              return true
            } else {
              return false;
            }
          } else {
            return true;
          }
        } else {
          return true;
        }
        // if (this.item) {
        //   const filterValue = this.$props.item;
        //   return filterValue;
        // } else {
        //   return undefined;
        // }
      },
      limit() {
        // try to get from config. if it's not there, set a reasonable default.
        return this.options.limit// || 1000;
      },
      inputClass() {
        if (this.searchText === '') {
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
      itemsAfterSearch() {
        const searchText = this.searchText;
        const searchTextLower = searchText.toLowerCase();

        // get full set of items
        const items = this.items;

        // if text search is not enabled, return all items
        const searchFields = this.options.filterFieldsByText || [];
        if (searchFields.length === 0) {
          return items;
        }

        // get items that contain the search text in one of their filter fields
        const matchingItems = items.filter(item => {
          const searchVals = searchFields.map(filterField => {
            const props = item.properties;
            const searchVal = props ? props[filterField] : item[filterField];
            return searchVal.toLowerCase();
          });

          for (let searchVal of searchVals) {
            if (searchVal.includes(searchTextLower)) {
              return true;
            } else {
              return false;
            }
          }
        })

        return matchingItems;
      },
      // this takes itemsAfterSearch and applies selected filters
      itemsAfterFilters() {
        const itemsAfterSearch = this.itemsAfterSearch;
        const items = this.filterItems(itemsAfterSearch,
                                       this.filters,
                                       this.filterSelections);

        return items;
      },
      itemsAfterSort() {
        const itemsAfterFilters = this.itemsAfterFilters;
        const sortOpts = this.$props.options.sort || null;
        const items = this.sortItems(itemsAfterFilters)//, sortOpts);

        return items;
      },
      // this takes filtered items and applies the max number of rows
      itemsLimited() {
        // console.log('items limited', this.itemsAfterSort.slice(0, this.limit));
        return this.itemsAfterSort.slice(0, this.limit);
      },
      count() {
        return this.itemsAfterFilters.length;
      },
      countText() {
        return `(${this.count})`;
      },
      shouldShowExternalLink() {
        if (this.options.externalLink.forceShow) {
          return this.options.externalLink.forceShow;
        } else {
          return this.itemsAfterSearch.length > this.limit;
        }
      },
      externalLinkAction() {
        return this.options.externalLink.action || 'See more';
      },
      externalLinkText() {
        const externalLinkConf = this.options.externalLink;
        const actionFn = externalLinkConf.action;
        const actionText = actionFn(this.externalLinkCount);
        const name = externalLinkConf.name;

        return `${actionText}`;
        // return `${actionText} at ${name}`;
      },
      externalLinkHref() {
        return this.evaluateSlot(this.options.externalLink.href);
      },
      // the number of items that aren't being shown (e.g. See 54 more...)
      externalLinkCount() {
        return this.count - this.limit;
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
        // console.log('handle filter value change', e);

        const target = e.target;
        const slug = target.value;

        // deslugify filter value
        const valueObj = this.deslugifyFilterValue(slug);

        const parent = target.parentElement;
        const parentId = parent.id;

        // patch and replace filter selections
        const prevFilterSelections = this.filterSelections;
        const nextFilterSelections = Object.assign({}, prevFilterSelections);
        nextFilterSelections[parentId] = valueObj;
        this.filterSelections = nextFilterSelections;
      },
      values(item) {
        const fields = this.options.fields;
        const sourceFields = fields.map(field => field.sourceField);
        return sourceFields.map(sourceField => item[sourceField])
      },
      handleFilterFormKeyup(e) {
        const input = e.target.value;
        this.searchText = input;
      },
      handleFilterFormX(e) {
        e.target[0].value = ''
        this.searchText = '';
      },
      filterItems(items, filters, filterSelections) {
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
                // console.log('TIME FILTER direction', direction);
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
      // sortItems(items, sortOpts) {
      sortItems(items) {
        // console.log('sortItems sortOpts');
        // TODO finish this
        // if (Object.keys(this.filterData).length) {
        //   console.log('there is filterData', this.filterData);
        //   return this.itemsFiltered;
        // } else {
        //   console.log('there is no filterData');
        //   return this.items;
        // }

        // const items = this.itemsFiltered;
        const sortOpts = this.options.sort;
        // console.log(sortOpts)

        // if there's no no sort config, just return the items.
        if (!sortOpts) {
          return items;
        }

        // const getValueFn = sortOpts.getValue;
        // const order = sortOpts.order;

        // get sort fn or use this basic one
        const sortFn = sortOpts.compare || this.defaultSortFn;
        // console.log('sortFn', sortFn)
        return items.sort(sortFn);
      },
      defaultSortFn(a, b) {
        // console.log('defaultSortFn is running');
        const sortOpts = this.options.sort;
        const getValueFn = sortOpts.getValue;
        const order = sortOpts.order;

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
      },
      // this updates the global state that stores filtered table rows
      updateTableFilteredData() {
        // console.log('update table filtered data');

        // get table id
        const { tableId } = this.options;

        // update global state
        this.$store.commit('setTableFilteredData', {
          tableId,
          data: this.itemsAfterFilters
        });
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
