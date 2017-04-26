
<script>
  import FeatureGroup from '../leaflet/FeatureGroup';

  // REVIEW is there a better way to extend a vue component?
  const {methods} = FeatureGroup;

  export default {
    mounted() {
      this.$store.commit('setCycloFeatureGroup', { this });
    },
    render(h) {
      return;
    },
    methods: Object.assign(methods)
  };
</script>
