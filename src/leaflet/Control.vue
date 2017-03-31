<script>
  import { Control, DomUtil, DomEvent } from 'leaflet';

  // convert a vue vnode to a regular htmlelement, via leaflet's domutil
  function vnodeToEl(vnode, DomUtil, DomEvent) {
    // get vnode "data" (basically, attributes)
    const data = vnode.data;

    // create dom node
    const el = DomUtil.create(vnode.tag);

    // set content
    // TODO this assumes there's only one child el and it's just html content.
    // make this recursive to support nested divs
    const children = vnode.children;
    if (children.length === 1) {
      const child = children[0];
      if (!child.tag) {
        el.innerHTML = child.text;
      } else {
        console.warn('control did not handle child with tag');
      }
    } else {
      console.warn('control did not handle multiple children');
    }

    // bind events
    const events = data.on || {};
    for (let [eventName, callback] of Object.entries(events)) {
      el.addEventListener(eventName, callback);
    }

    // don't propagate events (namely to the map)
    DomEvent.disableClickPropagation(el);

    // style
    el.className = data.staticClass;
    const style = data.staticStyle || {};
    for (let [key, value] of Object.entries(style)) {
      el.style[key] = value;
    }

    return el;
  }

  class ControlParent extends Control {
    constructor(children, options) {
      super(options);
      this.children = children;
      this.options = options;
    }
    onAdd() {
      const container = DomUtil.create('div');
      for (let child of this.children) {
        const el = vnodeToEl(child, DomUtil, DomEvent);
        container.appendChild(el);
      }
      return container;
    }
  }

  export default {
    props: ['position'],
    render(h) {
      return null;
    },
    methods: {
      createLeafletElement() {
        const slots = this.$slots.default;
        return new ControlParent(slots, {
          position: this.position
        });
      },
      parentMounted(parent, props) {
        this.$leafletElement = this.createLeafletElement();
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      }
    }
  };
</script>
