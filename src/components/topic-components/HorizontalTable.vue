<template>
  <div>
    <h4 v-if="slots.title">{{ evaluateSlot(slots.title) }}</h4>
    <table>
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
