<template>
  <div class="cell medium-auto grid-x" id="mb-root">
      <topic-panel />
      <map-panel>
        <cyclomedia-widget v-if="this.$config.cyclomedia.enabled"
                           slot="cycloWidget"
                           v-show="cyclomediaActive"
        />
        <pictometry-widget v-if="this.$config.pictometry.enabled"
                           slot="pictWidget"
                           v-show="pictometryActive"
                           :apiKey="this.ak"
                           :secretKey="this.sk"
        >
        <!-- :apiKey="this.$config.pictometry.apiKey"
        :secretKey="this.$config.pictometry.secretKey" -->
          <png-marker v-if="this.pictometryShowAddressMarker"
                      :latlng="[this.geocodeData.geometry.coordinates[1], this.geocodeData.geometry.coordinates[0]]"
                      :icon="'markers.png'"
                      :height="60"
                      :width="40"
                      :offsetX="0"
                      :offsetY="0"
          />
          <layer v-if="this.pictometryActive" />
          <png-marker v-if="this.cyclomediaActive && this.pictometryActive"
                      :latlng="[this.$store.state.cyclomedia.viewer.props.orientation.xyz[1], this.$store.state.cyclomedia.viewer.props.orientation.xyz[0]]"
                      :icon="'camera2.png'"
                      :height="20"
                      :width="30"
                      :offsetX="-2"
                      :offsetY="-2"
          />
          <!-- :icon="'../assets/camera.png'" -->
          <view-cone v-if="this.cyclomediaActive && this.pictometryActive"
                     :orientation="this.$store.state.cyclomedia.viewer.props.orientation"
          />
        </pictometry-widget>
        <!-- :center="this.$store.state.map.map.center" -->
      </map-panel>
  </div>
</template>

<script>
  import TopicPanel from './TopicPanel.vue';
  import MapPanel from './map-panel/MapPanel.vue';
  import CyclomediaWidget from '../cyclomedia/Widget.vue';
  import PictometryWidget from '../pictometry/Widget.vue';
  import Layer from '../pictometry/Layer.vue';
  import ViewCone from '../pictometry/ViewCone.vue';
  import PngMarker from '../pictometry/PngMarker.vue';

  export default {
    components: {
      TopicPanel,
      MapPanel,
      CyclomediaWidget,
      PictometryWidget,
      Layer,
      ViewCone,
      PngMarker
    },
    created() {
      const IS_MOBILE_OR_TABLET = (function () {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
      })();
      this.$store.commit('setIsMobileOrTablet', IS_MOBILE_OR_TABLET);
    //   console.log('MAPBOARD.VUE CREATED', this.$config);
    //   let tables = {};
    //   for (let topic of this.$config.topics) {
    //     for (let component of topic.components) {
    //       if (component.type === 'horizontal-table') {
    //         // console.log('topic:', topic.label, component.type, component.slots.title);
    //         const tableName = topic.key + '_' + component.options.id
    //         tables[tableName] = null
    //       }
    //       else if (component.type === 'tab-group' || component.type === 'table-group') {
    //         for (let innerComponent of component.options.components) {
    //           if (innerComponent.type === 'horizontal-table') {
    //             // console.log('topic:', topic.label, component.type, innerComponent.type, innerComponent.slots.title);
    //             const tableName = topic.key + '_' + innerComponent.options.id
    //             tables[tableName] = null
    //           }
    //         }
    //       }
    //     }
    //   }
    //   this.$store.commit('setTables', tables);
    },
    computed: {
      cyclomediaActive() {
        return this.$store.state.cyclomedia.active
      },
      pictometryActive() {
        return this.$store.state.pictometry.active
      },
      pictometryZoom() {
        return this.$store.state.pictometry.zoom
      },
      pictometryShowAddressMarker() {
        if (!this.pictometryActive || !this.geocodeData) {
          return false;
        } else if (this.pictometryZoom < 20 && this.cyclomediaActive) {
          return false;
        } else {
          return true;
        }
      },
      geocodeData() {
        return this.$store.state.geocode.data
      },
      ak() {
        const host = window.location.hostname;
        if (host === 'atlas.phila.gov') {
          return this.$config.pictometry.apiKey;
        }
        if (host === 'atlas-dev.phila.gov') {
          return this.$config.pictometryDev.apiKey;
        }
        if (host === 'cityatlas.phila.gov') {
          return this.$config.pictometryCity.apiKey;
        }
        if (host === 'cityatlas-dev.phila.gov') {
          return this.$config.pictometryCityDev.apiKey;
        }
        if (host === '10.8.101.67') {
          return this.$config.pictometryLocal.apiKey;
        }
      },
      sk() {
        const host = window.location.hostname;
        if (host === 'atlas.phila.gov') {
          return this.$config.pictometry.secretKey;
        }
        if (host === 'atlas-dev.phila.gov') {
          return this.$config.pictometryDev.secretKey;
        }
        if (host === 'cityatlas.phila.gov') {
          return this.$config.pictometryCity.secretKey;
        }
        if (host === 'cityatlas-dev.phila.gov') {
          return this.$config.pictometryCityDev.secretKey;
        }
        if (host === '10.8.101.67') {
          return this.$config.pictometryLocal.secretKey;
        }
      }
    },
    watch: {
      pictometryShowAddressMarker(nextValue) {
        console.log('watch pictometryShowAddressMarker', nextValue);
      }
    }
  };
</script>

<style>
  /*don't highlight any form elements*/
  input:focus,
  select:focus,
  textarea:focus,
  button:focus {
    outline: none;
  }

  .mb-panel-topics-with-widget {
    height: 50%;
  }

  /* standards applies padding to buttons, which causes some weirdness with
  buttons on the map panel. override here. */
  button {
    padding: inherit;
  }
</style>
