<template>
  <div>
    <h4>{{ evaluateSlot(slots.title) }}</h4>
    <table>
      <tbody>
        <tr v-for="field in slots.fields">
          <th>{{ evaluateSlot(field.label) }}</th>
          <td>{{ evaluateSlot(field.value) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent';

  // returns a copy of the slots obj where each 'value' has been evaluated. this
  // should become the value of `computed`.
  // function evaluateSlots(slots) {
  //   return Object.keys(slots).reduce((obj, key) => {
  //     const val = slots[key];
  //     const valType = typeof val;
  //     let valEvaluated;
  //
  //     // string literal
  //     if (valType === 'string' || val instanceof String) {
  //       valEvaluated = () => 'im a string';
  //     }
  //
  //     // collection (currently just tables)
  //     else if (val.isArray) {
  //       valEvaluated = val.map(item => {
  //         // wrap value fn
  //         const valueFn = item.value;
  //         const state = this.$store.state;
  //         item.value = () => valueFn(state);
  //         return item;
  //       });
  //     }
  //
  //     obj[key] = valEvaluated;
  //   }, {});
  // }

  export default {
    mixins: [TopicComponent],
    // computed: evaluateSlots(this.slots),
    // computed: {
      // return an object of slot id => getter fn
      // reactiveSlots() {
      //   const slots = this.slots;
      //
      //   const reactiveSlots = Object.keys(slots).reduce((o, k) => {
      //     const v = slots[k];
      //     const vType = typeof v;
      //     let vReactive;
      //
      //     // TODO check if it's a state path
      //
      //     // v is a string
      //     if (vType === 'string' || vType instanceof String) {
      //       // vReactive = new Function(undefined, `return "${v}";`);
      //       vReactive = () => 'asdf';
      //     }
      //     // v is a collection
      //     else if (v.isArray) {
      //       console.log('akjsdlfklasdjf')
      //       // wrap getters in evaluateSlot
      //       vReactive = v.map(item => {
      //         const getter = Object.assign(item);
      //         const value = getter.value;
      //         getter.value = this.evaluateSlot(getter.value);
      //       });
      //     // }
      //     else {
      //       vReactive = () => '1234';
      //     }
      //     o[k] = vReactive;
      //   }, {});
      //
      //   console.log('RS', reactiveSlots);
      //
      //   return reactiveSlots;
      // },
    // }
  };
</script>

<style scoped>
  th, td {
    font-size: 15px;
    text-align: left;
  }
</style>
