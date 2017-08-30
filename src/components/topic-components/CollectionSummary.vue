<!-- A natural-language summary of a collection of things. -->

<template>
  <h3>
    {{ summary }}
  </h3>
</template>

<script>
  import TopicComponent from './TopicComponent.vue';

  export default {
    mixins: [TopicComponent],
    computed: {
      // the final stringified output
      summary() {
        // get value quantity map
        const valueQuantities = this.valueQuantities;
        // check if plural
        const isPlural = this.isPlural(valueQuantities);
        // get context renderer
        const contextFnKey = 'context' + (isPlural ? 'Plural' : 'Singular');
        const contextFn = this[contextFnKey];
        // get a natural list
        const naturalList = this.naturalList;
        // summarize
        const summary = contextFn(naturalList);

        return summary;
      },
      contextSingular() {
        const context = this.options.context;
        return context.singular || context;
      },
      contextPlural() {
        const context = this.options.context;
        return context.plural || context;
      },
      descriptorSingular() {
        const descriptor = this.options.descriptor;
        return descriptor.singular || descriptor;
      },
      descriptorPlural() {
        const descriptor = this.options.descriptor;
        return descriptor.plural || descriptor + 's';
      },
      // serializes naturalized quantities into a list
      // e.g. "1 apple and 2 oranges"
      naturalList() {
        const valueQuantities = this.valueQuantities;
        const items = this.naturalizeQuantities(valueQuantities);
        const len = items.length;
        if (Array.isArray(items) && len > 0) {
          if (len === 1) {
            return items[0];
          } else if (len === 2) {
            return items.join(' and ');
          }
          const leadingItems = items.slice(0, items.length - 1).join(', ');
          const lastItem = items[items.length - 1];
          return `${leadingItems}, and ${lastItem}`;
        }
        // TODO should this text be an option?
        return `no ${this.descriptorPlural}`;
      },
      valueQuantities() {
        const items = this.slots.items(this.$store.state);
        const getValue = this.options.getValue;

        // make an object of value => quantity
        const valueQuantities = items.reduce((obj, item) => {
          const val = getValue(item);
          obj[val] = obj[val] || 0;
          obj[val]++;
          return obj;
        }, {});

        return valueQuantities;
      },
    },
    methods: {
      // takes the value of the valueQuantities computed property and returns
      // the appropriate grammatical number.
      isPlural(valueQuantities = {}) {
        const values = Object.keys(valueQuantities);
        if (values.length === 1) {
          const firstValue = values[0];
          const quantity = valueQuantities[firstValue];
          if (quantity === 1) {
            return false;
          }
        }
        return true;
      },
      // takes the value quantity map and converts values to natural language
      // quantities (e.g. {apple: 2} => "2 apples")
      naturalizeQuantities(valueQuantities = {}) {
        // get some options
        const types = this.options.types;
        const includeZeroes = this.options.includeZeroes;

        // convert to natural language and sort per order of types option
        const quantities = types.reduce((acc, type) => {
          const value = type.value;
          let quantity = valueQuantities[value] || 0;

          if (quantity === 0) {
            if (!includeZeroes) {
              return acc;
            }
            // natural zero => "no"
            quantity = 'no';
          }

          const labelSingular = type.label;
          let labelWithNumber;

          // singular
          if (quantity !== 1) {
            const labelPlural = type.plural || labelSingular + 's';
            labelWithNumber = labelPlural;
          // plural
          } else {
            labelWithNumber = labelSingular;
          }

          // make label and push
          const quantityWithLabel = `${quantity} ${labelWithNumber}`;
          acc.push(quantityWithLabel);

          return acc;
        }, []);

        return quantities;
      }
    }
  };
</script>

<style scoped>

</style>
