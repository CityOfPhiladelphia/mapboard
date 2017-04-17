<template>
  <div class="callout">
    <p>{{ text }}</p>
  </div>
</template>

<script>
  export default {
    props: ['slots'],
    computed: {
      text() {
        return this.$store.state.ais.properties.street_address;
        // const slots = this.slots;
        // const valOrGetter = slots.text; // <== specific
        // const valOrGetterType = typeof valOrGetter;
        // let val;
        //
        // // fn
        // if (valOrGetterType === 'function') {
        //   const state = this.$store.state;
        //   console.log('state', state);
        //   val = valOrGetter(state);
        // // string
        // } else if (valOrGetterType === 'string' || valOrGetter instanceof String) {
        //   val = valOrGetter;
        // // array
        // } else if (Array.isArray(valOrGetter)) {
        //   // TODO
        //   throw 'Not yet implemented';
        // // unhandled
        // } else {
        //   throw `Unhandled slot value type: ${valOrGetterType}`;
        // }
        //
        // return val;
      }
    },
  };
</script>

<style scoped>
</style>
