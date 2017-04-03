<!--
The way this works is: Vue renders the control in a slot below the map, and
when the map is ready we wrap the control in a Leaflet class and add it to the
map, which also removes it from the Vue slot.

REVIEW does this break anything with Vue? Because it's expecting a node that
isn't there?
-->

<template>
  <div>
    <slot />
  </div>
</template>

<script>
  import { Control, DomEvent } from 'leaflet';

  // subclass Control to accept an el which gets mounted to the map
  class ControlParent extends Control {
    constructor(el, options) {
      super(options);
      this.el = el;
    }
    onAdd() {
      const el = this.el;

      // keep clicks from hitting the map
      DomEvent.disableClickPropagation(el);
      
      return el;
    }
  }

  export default {
    props: ['position'],
    methods: {
      createLeafletElement() {
        const el = this.$el;
        return new ControlParent(el, {
          position: this.position
        });
      },
      parentMounted(parent, props) {
        const leafletElement = this.createLeafletElement();
        this.$leafletElement = leafletElement;
        const map = parent.$leafletElement;
        leafletElement.addTo(map);
      }
    }
  };
</script>
