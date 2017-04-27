<template>
  <div class="large-8 columns mb-panel"
       id="pict-container"
       style="height: 50%;"
  >
    <!-- <button @click="initialize">click me</button> -->
    <iframe id="pictometry-ipa" src="#"></iframe>
  </div>
</template>

<script>
  export default {
    mounted() {
        var ipa;
        var app = _.extend(app || {},
        {
          // set initial state
          state: {
            viewCone: {},
          },

          // set defaults
          default: {
            leafletCenterY: 39.952388,
            leafletCenterX: -75.163596,
            theZoom: 8,
          },

          init: function () {
            // debug stuff
            var DEBUG_HOSTS = [
              process.env.WEBPACK_DEV_HOST,
              'localhost'
            ],
            HOST = window.location.hostname,
            DEBUG = (function () {
              return _.some(_.map(DEBUG_HOSTS, function (debugHost) {
                return HOST.indexOf(debugHost) >= 0;
              }));
            })();

            DEBUG && console.log('debug mode on');

            // get config
            var apiKey = this.$config.pictometry.apiKey,
                secretKey = this.$config.pictometry.secretKey,
                iframeId = this.$config.pictometry.iframeId;

            // load pictometry api programmatically
            var scriptUrl = '//pol.pictometry.com/ipa/v1/embed/host.php' + '?apikey=' + apiKey;
            $.getScript(scriptUrl, function () {
              // construct signed url
              var d = new Date(),
                  t = Math.floor(d.getTime() / 1000),
                  unsignedUrl = 'http://pol.pictometry.com/ipa/v1/load.php' + "?apikey=" + apiKey + "&ts=" + t,
                  hash = md5(unsignedUrl, secretKey),
                  signedUrl = unsignedUrl + "&ds=" + hash + "&app_id=" + iframeId;

              // console.debug('hash', hash);
              // console.debug('unsignedUrl', unsignedUrl);
              // console.debug('signedUrl', signedUrl);

              // set the iframe src to load the IPA
              var iframe = document.getElementById(iframeId);
              iframe.setAttribute('src', signedUrl);

              // create pictometry host
              ipa = new PictometryHost(iframeId, 'http://pol.pictometry.com/ipa/v1/load.php');

              ipa.ready = function() {
                ipa.getLayers(function(result){
                  app.map.layers = result.layers;
                })
                app.map.setInitLocation();
                if (localStorage.stViewOpen == 'true') {
                  // console.log('stViewOpen is true')
                  app.map.placeCamera();
                  app.map.placeViewCone();
                };
              };

              ipa.getSearchServices( function(searchableLayers) {
                app.map.mySearchLayers = searchableLayers;
              });

            });
          },
        });

        app.init();

        app.map = (function ()
        {
          return {
            // function setInitLocation - set initial state location from localStorage or default
            setInitLocation: function () {
              if (localStorage.getItem('leafletCenterX')) {
                app.state.leafletCenterX = localStorage.getItem('leafletCenterX');
              } else {
                app.state.leafletCenterX = app.default.leafletCenterX;
              }
              if (localStorage.getItem('leafletCenterY')) {
                app.state.leafletCenterY = localStorage.getItem('leafletCenterY');
              } else {
                app.state.leafletCenterY = app.default.leafletCenterY;
              }
              if (localStorage.getItem('theZoom')) {
                app.state.theZoom = parseInt(localStorage.theZoom) + 1
                //app.state.theZoom = localStorage.getItem('theZoom');
              } else {
                app.state.theZoom = app.default.theZoom;
              }
              if (localStorage.getItem('stViewX')) {
                app.state.stViewX = localStorage.getItem('stViewX');
              }
              if (localStorage.getItem('stViewY')) {
                app.state.stViewY = localStorage.getItem('stViewY');
              }
              if (localStorage.getItem('stViewYaw')) {
                app.state.stViewYaw = localStorage.getItem('stViewYaw');
              }
              if (localStorage.getItem('stViewHfov')) {
                app.state.stViewHfov = localStorage.getItem('stViewHfov');
              }

              ipa.setLocation({
                y: app.state.leafletCenterY,
                x: app.state.leafletCenterX,
                zoom: app.state.theZoom
              });

              var activeTopic = localStorage.getItem('activeTopic');
              if (activeTopic) {
                console.log('activeTopic: ', activeTopic);
                this.didActivateTopic(activeTopic);
              }
            },

            didActivateTopic: function (topic) {
              console.log('didActivateTopic is firing with topic: ', topic);
              switch (topic) {
                case 'deeds':
                  // turn on DOR Parcels
                  ipa.showLayer({
                    id: 114828,
                    visible: true,
                  })
                  break;
                case 'zoning':
                  // turn on zoning
                  ipa.showLayer({
                    id: 112230,
                    visible: true,
                  });
                  break;
                case 'water':
                  // turn on water Parcels
                  ipa.showLayer({
                    id: 108982,
                    visible: true,
                  })
                  break;

                default:
                  // turn off DOR parcels
                  ipa.showLayer({
                    id: 113478,
                    visible: false,
                  });
                  // turn off zoning
                  ipa.showLayer({
                    id: 112230,
                    visible: false,
                  });
              }
            },

            didDeactivateTopic: function (topic) {
              switch (topic) {
                case 'deeds':
                  // turn off DOR parcels
                  ipa.showLayer({
                    id: 114828,
                    visible: false,
                  });
                  break;

                case 'zoning':
                  // turn on zoning
                  ipa.showLayer({
                    id: 112230,
                    visible: false,
                  });
                  break;

                case 'water':
                  // turn off water
                  ipa.showLayer({
                    id: 108982,
                    visible: false,
                  })

                default:
                  // turn off DOR parcels
                  ipa.showLayer({
                    id: 113478,
                    visible: false,
                  });
                  // turn off zoning
                  ipa.showLayer({
                    id: 112230,
                    visible: false,
                  });
              }
            },

            shapeIds : [],
            circleIds : [],
            cameraIds : [],

            getViewConeLatLon: function(){
              //Position, decimal degrees
              var camLat = parseFloat(app.state.stViewY),
                camLon = parseFloat(app.state.stViewX),
                // Earth's radius
                ER=6378137,
                // viewcone radius, for scaling its size
                camR = 10,
                // Angle1 - camera angle off of N, Angle2 - fov angle
                Angle1 = parseFloat(app.state.stViewYaw),
                Angle2 = parseFloat(app.state.stViewHfov),
                //
                dnLP = Math.cos((Angle1+Angle2/2) * Math.PI/180)*camR,
                deLP = Math.sin((Angle1+Angle2/2) * Math.PI/180)*camR,
                dnRP = Math.cos((Angle1-Angle2/2) * Math.PI/180)*camR,
                deRP = Math.sin((Angle1-Angle2/2) * Math.PI/180)*camR,
                //Coordinate offsets in radians
                dLatLP = dnLP/ER,
                dLonLP = deLP/(ER*Math.cos(Math.PI*camLat/180)),
                dLatRP = dnRP/ER,
                dLonRP = deRP/(ER*Math.cos(Math.PI*camLat/180));
                //OffsetPosition
                app.state.viewCone.camRightLat = camLat + dLatLP * 180/Math.PI;
                app.state.viewCone.camRightLon = camLon + dLonLP * 180/Math.PI;
                app.state.viewCone.camLeftLat = camLat + dLatRP * 180/Math.PI;
                app.state.viewCone.camLeftLon = camLon + dLonRP * 180/Math.PI;
                /*app.state.dn = Math.cos(app.state.Angle1 * Math.PI/180)*app.state.camR;
                app.state.de = Math.sin(app.state.Angle1 * Math.PI/180)*app.state.camR;
                app.state.dLat = app.state.dn/app.state.ER;
                app.state.dLon = app.state.de/(app.state.ER*Math.cos(Math.PI*app.state.camLat/180));
                app.state.camStraightLat = parseFloat(app.state.camLat) + parseFloat(app.state.dLat) * 180/Math.PI;
                app.state.camStraightLon = parseFloat(app.state.camLon) + parseFloat(app.state.dLon) * 180/Math.PI;*/
             },

             placeCamera: function(){
               //app.map.getViewConeLatLon();
               app.state.stViewMarker = {
                  type : ipa.SHAPE_TYPE.MARKER,
                  center: { y: app.state.stViewY, x: app.state.stViewX},
                  markerImageHeight: 20,
                  markerImageWidth: 30,
                  markerOffsetX: -2,
                  markerOffsetY: -2,
                  markerImage: app.util.constructLocalUrl(window.location.hostname, '/pictometry/images/camera.png'),
                  onShapeClick: 'true'
               };
               console.log('trying to add stViewMarker (camera)')
               ipa.addShapes([app.state.stViewMarker], function(result) {
                 for ( var i = 0; i < result.length; i++) {
                   if ( result[i].success === 'false' ) {
                       alert(result[i].error);
                   } else {
                       app.map.cameraIds.push(result[i].shapeId);
                   }
                 }
               });
             },

             placeViewCone: function(){
               app.map.getViewConeLatLon();
               app.state.viewTriangle = {
                   type : ipa.SHAPE_TYPE.POLYGON,
                   coordinates : [ {y : app.state.stViewY, x : app.state.stViewX, z: 0.0}, {y : app.state.viewCone.camRightLat, x : app.state.viewCone.camRightLon, z: 0.0}, {y : app.state.viewCone.camLeftLat, x : app.state.viewCone.camLeftLon, z: 0.0} ],
                   strokeColor: "#00a0ee",
                   strokeOpacity: 0.75,
                   strokeWeight: 2,
                   fillColor: "#00a0ee",
                   fillOpacity: 0.25,
                   altitudeMode: ipa.ALTITUDE_MODE.RELATIVE_TO_GROUND
               };
               ipa.addShapes([app.state.viewTriangle], function(result) {
                 for ( var i = 0; i < result.length; i++) {
                   if ( result[i].success === 'false' ) {
                       alert(result[i].error);
                   } else {
                       app.map.shapeIds.push(result[i].shapeId);
                       ipa.removeShapes(app.map.shapeIds.slice(0, -1));
                   }
                 }
               });
             },
           }//end of return
        })();


        // // watch localStorage
        // // fire only when changes to x, y, zoom
        // $(window).bind('storage', function (e) {
        //   if (e.originalEvent.key == 'pictCoordsZoom') {
        //     //console.log(e.originalEvent.key, e.originalEvent.newValue);
        //     app.state.leafletCenterX = localStorage.leafletCenterX
        //     app.state.leafletCenterY = localStorage.leafletCenterY
        //     app.state.theZoom = parseInt(localStorage.theZoom) + 1
        //     ipa.setLocation({
        //        y: app.state.leafletCenterY,
        //        x: app.state.leafletCenterX,
        //        zoom: app.state.theZoom
        //     });
        //   };
        //   if (e.originalEvent.key == 'stViewCoords') {
        //     console.log('stViewCoords changed');
        //     ipa.removeShapes(app.map.cameraIds);
        //     ipa.removeShapes(app.map.shapeIds);
        //     app.state.stViewX = localStorage.stViewX;
        //     app.state.stViewY = localStorage.stViewY;
        //     app.map.placeCamera();
        //     app.map.placeViewCone();
        //   };
        //   if (e.originalEvent.key == 'stViewYaw') {
        //     console.log('stViewYaw changed');
        //     //ipa.removeAllShapes();
        //     //ipa.removeShapes(app.map.shapeIds.slice(0, -1));
        //     app.state.stViewYaw = localStorage.stViewYaw;
        //     app.map.placeViewCone();
        //   };
        //   if (e.originalEvent.key == 'stViewHfov') {
        //     console.log('stViewHfov changed');
        //     //ipa.removeAllShapes();
        //     //ipa.removeShapes(app.map.shapeIds.slice(0, -1));
        //     app.state.stViewHfov = localStorage.stViewHfov;
        //     app.map.placeViewCone();
        //   };
        //   if (e.originalEvent.key == 'activeTopic') {
        //     var activeTopic = localStorage.getItem('activeTopic');
        //     app.map.didActivateTopic(activeTopic);
        //   };
        //   if (e.originalEvent.key == 'previousTopic') {
        //     var previousTopic = localStorage.getItem('previousTopic');
        //     app.map.didDeactivateTopic(previousTopic);
        //   };
        //   if (e.originalEvent.key == 'stViewOpen') {
        //     console.log('stViewOpen changed');
        //     console.log(e.originalEvent.newValue);
        //     if (e.originalEvent.newValue == 'true') {
        //       app.map.placeCamera();
        //       app.map.placeViewCone();
        //     }
        //     if (e.originalEvent.newValue == 'false') {
        //       console.log('stViewOpen is false');
        //       ipa.removeAllShapes();
        //     };
        //   };
        // });

      //}
    }
  };
</script>

<style scoped>
header.site-header > .row:last-of-type {
    background: #2176d2;
}

#pict-container {
  padding: 0px;
}

#pictometry-ipa {
  height: 100%;
  width: 100%;
}

#search-container {
    float: right;
}

#search-input {
    float: left;
    width: 400px;
}

#search-button {
    height: 2.78571rem;
}

#data-panel {
    background: #fff;
    padding-left: 12px;
    padding-right: 12px;
    height: 100%;
}

#data-panel > h1 {
    color: #666;
}

#data-row-list > a {
    background: #f5f5f5;
    border: 1px solid #ddd;
    display: block;
    font-size: 18px;
    font-weight: normal;
    height: 70px;
    line-height: 45px;
    /*margin-left: 10px;*/
    /*margin-right: 10px;*/
    padding: 10px;
    /*vertical-align: middle;*/
    /*text-align: middle;*/
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    margin-bottom: 8px;
}

#data-row-list > a:hover {
    background: #fff;
    color: inherit;
}

#data-row-list .data-row-link-icon {
    padding-right: 30px;
}

.data-row {
    padding: 10px;
    margin-bottom: 10px;
    display: none;
}

.data-row table th, .data-row table td {
    font-size: 15px;
}

.data-row table tr th {
    text-align: left;
    vertical-align: top;
}

#map {
    height: 100%;
}

ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

img { max-width: inherit; }


</style>
