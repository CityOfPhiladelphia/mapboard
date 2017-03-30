<script>


  export default {
    props: ['position'],
    render(h) {
      return null;
    },
    methods: {
      createLeafletElement() {
        return;
      },
      parentMounted(parent, props) {
        const map = parent.$leafletElement;
        const position = props.position;
        const controlCorner = map._controlCorners[position];

        console.log('CONTROL: parent mounted', map, controlCorner);

        // create container node
        const container = document.createElement('div');
        container.classList.add('leaflet-control');

        // append to control corner based on position
        // controlCorners)
        controlCorner.appendChild(container);
      }
    }
  };
</script>
