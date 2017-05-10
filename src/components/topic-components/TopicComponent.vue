<script>
    export default {
    props: ['slots'],
    methods: {
      evaluateSlot(valOrGetter, transforms = []) {
        const valOrGetterType = typeof valOrGetter;
        let val;

        // fn
        if (valOrGetterType === 'function') {
          const state = this.$store.state;
          const getter = valOrGetter;

          // const getterText = String(getter);
          // const depsRe = /state(\.\w+)+/g;
          // const depsText = getterText.match(depsRe);
          // const deps = depsText.map(eval);

          val = getter(state);
        // string
        } else if (valOrGetterType === 'string' || valOrGetter instanceof String) {
          val = valOrGetter;
        // array
        } else if (Array.isArray(valOrGetter)) {
          // REVIEW vertical table seems to be working without this since each
          // field slot gets evaluated individually in a for-loop
          throw 'Not yet implemented';
        // unhandled
        } else {
          throw `Unhandled slot value type: ${valOrGetterType}`;
        }

        // apply transforms
        for (let transform of transforms) {
          // get transform definition from config by name
          const transformDef = this.$config.transforms[transform];
          // make object of (relevant) globals by filtering window object
          const globalNames = transformDef.globals;
          const globals = Object.keys(window)
                            .filter(key => globalNames.includes(key))
                            .reduce((obj, key) => {
                                obj[key] = window[key];
                                return obj;
                            }, {});
          // run transform
          const fn = transformDef.transform;
          val = fn(val, globals);
        }

        return val;
      },

      // not sure how children can use this. `this` isn't binding correctly at
      // the time the child gets instantiated.
      // getComputedProperties() {
      //   const slots = this.slots;
      //   return Object.keys(slots).reduce((o, key) => {
      //     const valOrGetter = slots[key];
      //     // wrap slot val/getter in evaluator fn
      //     o[key] = () => {
      //       this.evaluateSlot(valOrGetter);
      //     }
      //     return o;
      //   }, {});
      // }
    },
  };
</script>
