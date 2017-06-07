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
        <horizontal-table-row v-for="item in evaluateSlot(slots.items)"
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
      count() {
        const items = this.evaluateSlot(this.slots.items) || [];
        const length = items.length;
        return `(${length})`;
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
