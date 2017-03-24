<template>
  <div class="large-12 columns mb-panel mb-panel-map">
    <Map_
      @l-click="handleMapClick"
      :zoomControlPosition="'bottomright'"
    >
      <!-- controls -->
      <SearchControl :position="'topleft'" />

      <!-- basemaps -->
      <EsriTiledMapLayer v-for="(basemap, key) in this.$config._map.basemaps"
                         v-if="activeBasemap === key"
                         :key="key"
                         :url="basemap.url"
      />
      <!-- dor parcels -->
      <GeoJson v-for="dorParcel in dorParcels"
               v-if="activeBasemap === 'dor'"
               :geojson="dorParcel"
               :color="'green'"
               :weight="2"
               :key="dorParcel.properties.OBJECTID"
       />

       <!-- pwd parcel -->
       <GeoJson v-if="activeBasemap === 'pwd' && pwdParcel"
                :geojson="pwdParcel"
                :color="'blue'"
                :weight="2"
                :key="pwdParcel.properties.PARCELID"
        />
    </Map_>
  </div>
</template>

<script>
  // vue doesn't like it when you import this as Map (reserved-ish word)
  import Map_ from '../leaflet/Map';
  import SearchControl from './SearchControl';
  import EsriTiledMapLayer from '../esri-leaflet/TiledMapLayer';
  import GeoJson from '../leaflet/GeoJson';

  export default {
    components: {
      Map_,
      SearchControl,
      EsriTiledMapLayer,
      GeoJson
    },
    computed: {
      activeBasemap() {
        return this.activeTopicConfig.basemap;
      },
      activeTopicConfig() {
        const key = this.$store.state.topic;
        return this.$config.topics.filter((topic) => {
          return topic.key === key;
        })[0];
      },
      dorParcels() {
        return this.$store.state.dorParcels;
      },
      pwdParcel() {
        return this.$store.state.pwdParcel;
      }
    },
    methods: {
      handleMapClick(e) {
        this.getDorParcelsByLatLng(e.latlng);
        this.getPwdParcelByLatLng(e.latlng);
      },
      getDorParcelsByLatLng(latlng) {
        var url = this.$config._map.featureLayers.dorParcels.url;
        var parcelQuery = L.esri.query({ url });
        parcelQuery.contains(latlng);
        parcelQuery.run((error, featureCollection, response) => {
          const features = featureCollection.features;
          this.$store.commit('setDorParcels', featureCollection.features);
        });

      },
      getPwdParcelByLatLng(latlng) {
        var url = this.$config._map.featureLayers.pwdParcels.url;
        var parcelQuery = L.esri.query({ url });
        parcelQuery.contains(latlng);
        parcelQuery.run((error, featureCollection, response) => {
          const features = featureCollection.features;
          let feature;
          if (features.length === 0) {
            feature = null;
          } else {
            feature = features[0]
            // this shouldn't happen
            if (features.length > 1) {
              console.debug('got more than one pwd parcel', features);
            }
          }
          this.$store.commit('setPwdParcel', feature);
        });
      }
    }
  };
</script>
