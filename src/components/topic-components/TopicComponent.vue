<script>
    export default {
    props: ['slots'],
    methods: {
      evaluateSlot(value) {
        const valueType = typeof value;
        let r;

        // string literal
        if (valueType === 'string' || valueType instanceof String) {
          r = value;
        }

        // state function
        else if (valueType === 'function') {
          const state = this.$store.state;
          // TODO check state deps before running

          r = value(state);
        }

        return r;
      }
    },
  };
</script>
