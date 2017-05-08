<template>
  <div class="leaflet-bar easy-button-container leaflet-control">
    <button class="easy-button-button leaflet-bar-part leaflet-interactive unnamed-state-active"
            @click.prevent="handleButtonClick"
    >
      <span class="button-state state-unnamed-state unnamed-state-active">
        <img class="button-image" :src="imgSrc">
      </span>
    </button>
  </div>
</template>

<script>
  import Control from '../leaflet/Control';
  import CyclomediaRecordingsClient from './recordings-client';

  export default {
    extends: Control,
    // TODO figure how to extend props. sometimes it's an obj, sometimes an array.
    // props: Object.assign(props, {
    // }),
    props: [
      'link',
      'imgSrc'
    ],
    created() {
      // create cyclomedia recordings client
      this.$cyclomediaRecordingsClient = new CyclomediaRecordingsClient(
        this.$config.cyclomedia.recordingsUrl,
        this.$config.cyclomedia.username,
        this.$config.cyclomedia.password,
        4326
      );
    },

    methods: {
      handleButtonClick(e) {
        const willBeActive = !this.$store.state.cyclomedia.active;

        this.$store.commit('setCyclomediaActive', willBeActive);

        // if the cyclo viewer is off screen when it loads imagery, it won't
        // show anything even once it's on screen. use this to trigger an
        // update.
        const viewer = this.$store.state.cyclomedia.viewer;

        if (willBeActive && viewer) {
          this.$nextTick(() => {
            viewer.forceUpdate();
          });
          //this.handleCyclomediaOpen();
          this.setNewLocation(this.$store.state.cyclomedia.locFromApp);
        }

        this.$emit('click');
      },
      // handleCyclomediaOpen() {
      //   console.log('handleCyclomediaOpen is running');
      //   const lastClick = this.$store.state.lastClick;
      //   const viewer = this.$store.state.cyclomedia.viewer;
      //   const xyz = viewer.props.orientation.xyz;
      //   const geocodeData = this.$store.state.geocode.data;
      //   let sendLoc;
      //
      //   // if the searchbar has been used most recently
      //   if (lastClick === 'search') {
      //     sendLoc = geocodeData.geometry.coordinates
      //     console.log('the last thing clicked was the searchbar, using geocoded', sendLoc);
      //   }
      //   // if viewer does not have xy yet
      //   else if (xyz[0] === 0) {
      //     // if geocodeData does not have data yet
      //     if (!geocodeData) {
      //       const map = this.$store.state.map.map;
      //       sendLoc = map.getCenter();
      //       console.log('set sendLoc from center:', sendLoc);
      //     } else {
      //       sendLoc = geocodeData.geometry.coordinates
      //       console.log('set sendLoc from geocodeData:', sendLoc);
      //     }
      //     this.setNewLocation(sendLoc);
      //   } else {
      //     console.log('cyclomedia already has an xyz');
      //   }
      // },
      setNewLocation(latlng) {
        const viewer = this.$store.state.cyclomedia.viewer;
        const xy = [latlng.lng, latlng.lat];
        viewer.openByCoordinate(xy);
      },
    }
  };
</script>

<style scoped>
  .year-selector-container {
    /*border: 1px solid #222;*/
    display: inline-block;
    margin-right: 20px;
  }

  ul {
    margin: 0;
    list-style-type: none;
    text-align: center;
  }

  li {
    background: #cfcfcf;
    border: 1px solid #fff;
    border-bottom: none;
    padding: 8px;
  }

  li.active {
    background: #FFF;
  }

  .leaflet-bar button,
  .leaflet-bar button:hover {
    background-color: #fff;
    border: none;
    border-bottom: 1px solid #ccc;
    width: 26px;
    height: 26px;
    line-height: 26px;
    /*display: block;*/
    text-align: center;
    text-decoration: none;
    color: black;
  }

  .leaflet-bar button {
    background-position: 50% 50%;
    background-repeat: no-repeat;
    overflow: hidden;
    /*display: block;*/
  }

  .leaflet-bar button:hover {
    background-color: #f4f4f4;
  }

  .leaflet-bar button:first-of-type {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  .leaflet-bar button:last-of-type {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    border-bottom: none;
  }

  .leaflet-bar.disabled,
  .leaflet-bar button.disabled {
    cursor: default;
    pointer-events: none;
    opacity: .4;
  }

  .easy-button-button .button-state{
    display: block;
    width: 30px;
    height: 30px;
    position: relative;
  }

  .leaflet-touch .leaflet-bar button {
    width: 30px;
    height: 30px;
    line-height: 30px;
  }

  .basemap-toggle-button {
    width: 30px;
    height: 30px;
    opacity: 0%;
    /*padding: 0px;
    margin: 0px;*/
    /*background: white;*/
    /*background: rgba(255,255,255,1);*/
    /* box-shadow: 0 0 15px rgba(0,0,0,0.2); */
    /*display: inline-block;*/
    /*float: right;*/
  }

  .button-image {
    vertical-align: top;

  }
</style>
