<template>
  <div>
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
  import TopicComponent from './TopicComponent';
  import HorizontalTableRow from './HorizontalTableRow';

  export default {
    mixins: [TopicComponent],
    components: {
      HorizontalTableRow
    },
    computed: {
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
        const length = this.items.length;
        return `(${length})`;
      },
      itemsSorted() {
        const items = this.items;
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
      values(item) {
        const fields = this.options.fields;
        const sourceFields = fields.map(field => field.sourceField);
        return sourceFields.map(sourceField => item[sourceField])
      }
    }
  };
</script>

<style scoped>
  th {
    font-size: 15px;
    text-align: left;
  }
</style>
