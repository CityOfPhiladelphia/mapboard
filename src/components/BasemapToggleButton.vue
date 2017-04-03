<template>
  <!-- <div id='basemap-toggle' class="leaflet-bar easy-button-container leaflet-control"> -->
    <button class="easy-button-button leaflet-bar-part leaflet-interactive unnamed-state-active" @click="toggleBaseAndImagery">
      <span class="button-state state-unnamed-state unnamed-state-active">
        <img class='button-image' :src="baseImg">
      </span>
    </button>
  <!-- </div> -->
</template>

<script>
  export default {
    props: ['baseImg'],
    computed: {
      baseImg() {
        if (this.$store.state.imageryOn === false) {
          return "../../src/assets/imagery_small.png"
        }
        if (this.$store.state.imageryOn === true) {
          return "../../src/assets/basemap_small.png"
        }
      },
    },
    methods: {
      toggleBaseAndImagery(e) {
        console.log('calling toggleBaseAndImagery');
        var answer;
        if (this.$store.state.imageryOn === false) {
          answer = true;
        }
        if (this.$store.state.imageryOn === true) {
          answer = false
        }
        this.$store.commit('toggleBaseAndImagery', answer);
        e.stopPropagation();
      }
    }
  };

</script>

<style scoped>

  .leaflet-bar button,
  .leaflet-bar button:hover {
  background-color: #fff;
  border: none;
  border-bottom: 1px solid #ccc;
  width: 26px;
  height: 26px;
  line-height: 26px;
  display: block;
  text-align: center;
  text-decoration: none;
  color: black;
  }

  .leaflet-bar button {
  background-position: 50% 50%;
  background-repeat: no-repeat;
  overflow: hidden;
  display: block;
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
