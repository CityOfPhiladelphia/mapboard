

<script>
  console.log('hello from RecordingsLayer');
  var wfsClient;

  function WFSClient(baseURL_, typename_, srs_, proxy_)
  {
  	this.useProxy = true;
  	this.localProxy = proxy_;
  	this.baseURL = baseURL_;
  	this.typename = typename_;
  	this.srsName = srs_;
  	wfsClient = this;
  }

  WFSClient.prototype.getImageInfo = function (imageId, callback_)
  {
  	var postData =  "<wfs:GetFeature service=\"WFS\" version=\"1.1.0\" resultType=\"results\" outputFormat=\"text/xml; subtype=gml/3.1.1\" xmlns:wfs=\"http://www.opengis.net/wfs\">"+
  					"  <wfs:Query typeName=\"atlas:Recording\" srsName=\"##SRS##\" xmlns:atlas=\"http://www.cyclomedia.com/atlas\">"+
  					"    <ogc:Filter xmlns:ogc=\"http://www.opengis.net/ogc\">"+
  					"      <ogc:FeatureId fid=\"##IMAGEID##\"/>"+
  					"    </ogc:Filter>"+
  					"  </wfs:Query>"+
  					"</wfs:GetFeature>";

  	postData = postData.replace("##IMAGEID##",imageId);
  	postData = postData.replace(new RegExp("##SRS##", "g"),this.srsName);

  	var http;
  	if (window.XMLHttpRequest){
        http = new XMLHttpRequest();
      }
      else if (window.ActiveXObject){
        http = new ActiveXObject("Microsoft.XMLHTTP");
      }

      //http.setRequestHeader("Content-Type", "text/xml;charset=utf-8");

  	//Send the proper header information along with the request
  	var url = this.localProxy + this.baseURL;

  	http.open("POST", url , true);
  	//http.setRequestHeader("Content-length", postData.length);
  	http.setRequestHeader("Content-type", "text/xml");
  	//http.setRequestHeader("apiKey", "mbYh-jcxeTod-DcNu38dej0F-TQR-H85WropuDoNmbUJa_sxiT8J2b8pOP0VuTQd");
  	this.callback = callback_;
  	http.onreadystatechange = function()
  	{
  		if(http.readyState == 4  /* && http.status == 200 */)
  		{
  			wfsClient.parseXML(http.responseText);
  		}
  	};

  	http.send(postData);

  };

  WFSClient.prototype.loadBbox = function(left, bottom, right, top, callback_, username, password)
  {
  	var postData =  "<wfs:GetFeature service=\"WFS\" version=\"1.1.0\" resultType=\"results\" outputFormat=\"text/xml; subtype=gml/3.1.1\" xmlns:wfs=\"http://www.opengis.net/wfs\">  "+
  				    " <wfs:Query typeName=\"##TYPENAME##\" srsName=\"##SRS##\" xmlns:atlas=\"http://www.cyclomedia.com/atlas\"> "+
  				    "  <ogc:Filter xmlns:ogc=\"http://www.opengis.net/ogc\"> "+
  					"    <ogc:And>"+
  					"      <ogc:BBOX> "+
  					"        <gml:Envelope srsName=\"##SRS##\" xmlns:gml=\"http://www.opengis.net/gml\"> "+
  					"          <gml:lowerCorner>##LEFT## ##BOTTOM##</gml:lowerCorner> "+
  					"          <gml:upperCorner>##RIGHT## ##TOP##</gml:upperCorner> "+
  					"        </gml:Envelope> "+
  					"      </ogc:BBOX> "+
  					"      <ogc:PropertyIsNull> "+
  					"        <ogc:PropertyName>expiredAt</ogc:PropertyName> "+
  					"      </ogc:PropertyIsNull> "+
  					"    </ogc:And> "+
  					"  </ogc:Filter> "+
  					" </wfs:Query> "+
  					"</wfs:GetFeature>";

  	postData = postData.replace("##TYPENAME##",this.typename);
  	postData = postData.replace(new RegExp("##SRS##", "g"),this.srsName);
  	postData = postData.replace("##LEFT##",left);
  	postData = postData.replace("##BOTTOM##",bottom);
  	postData = postData.replace("##RIGHT##",right);
  	postData = postData.replace("##TOP##",top);

  	var url = this.localProxy + this.baseURL;
      this.callback = callback_;

  	//if(BrowserDetect.browser == "Explorer" && BrowserDetect.version == 9){
  		var http = new XMLHttpRequest();

  		/* Don't set content type to text/xml because the browser will send a HTTP OPTIONS request
  		 * first to check server CORS cababilities.
  		 * Let de proxy inject the content-type !
  		 * !!! http.setRequestHeader("Content-type", "text/xml"); !!!
  		 */

  		//Send the proper header information along with the request

  		http.open("POST", url , true);
  		http.setRequestHeader("Content-length", postData.length);
  		http.setRequestHeader("Authorization", "Basic " + btoa(username+ ":"+ password));
  		http.onreadystatechange = function()
  		{
  			if(http.readyState == 4  /* && http.status == 200 */)
  			{
  				wfsClient.parseXML(http.responseText);
  			}
  		};
  		http.send(postData);
  	//}
  	//else{
  	//	$.ajax({
  	//	    url:url,
  	//	    type:'POST',
  	//	    data: postData,
  	//	    callback:callback_
  	//	}).done(function(data,text,xhr){
  	//		wfsClient.parseXML(xhr.responseText);
  	//		});
  	//}
  };


  WFSClient.prototype.parseXML = function(xml)
  {
      /* Do the parsing stuff */
  	var parseXml;

  	if (typeof window.DOMParser != "undefined")
  	{
  	    parseXml = function(xmlStr)
  	    {
  	        return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
  	    };
  	}
  	else if (typeof window.ActiveXObject != "undefined" &&
  	       new window.ActiveXObject("Microsoft.XMLDOM"))
  	       {
  			    parseXml = function(xmlStr)
  			    {
  			        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
  			        xmlDoc.async = "false";
  			        xmlDoc.loadXML(xmlStr);
  			        return xmlDoc;
  			    };
  			}
  	else
  	{
  	    throw new Error("No XML parser found");
  	}

  	GeogToWebMercator = function(lon, lat)
  	{
              var Rad = lat * (Math.PI / 180);
              var FSin = Math.sin(Rad);

  		    var o = new Object();
              o.y = 6378137 / 2.0 * Math.log((1.0 + FSin) / (1.0 - FSin));
              o.x = lon * 0.017453292519943 * 6378137;
  			return o;
      };


      var xml = parseXml(xml);
      var recordings = xml.getElementsByTagNameNS("*","Recording");

      /* Create new list for recordings */
      this.recordingList = new Array();

      for(var i=0; i < recordings.length; i++)
  	{
      	isAuthorized = recordings[i].getElementsByTagNameNS("*","isAuthorized")[0].firstChild.data;
      	if(isAuthorized == "true")
  	    {
  			imageid = recordings[i].getElementsByTagNameNS("*","imageId")[0].firstChild.data;
  			pos 	= recordings[i].getElementsByTagNameNS("*","pos")[0].firstChild.data;
  			lonlat  = pos.split(" ");
  			lon     = parseFloat(lonlat[0]);
  			lat     = parseFloat(lonlat[1]);
  			o 		= GeogToWebMercator(lon,lat);

  			t = new Object();
  			t.imageId = imageid;
  			t.x = o.x;
  			t.y = o.y;
  			t.lon = lon;
  			t.lat = lat;
  			this.recordingList.push(t);
      	}
  	}

  	if (wfsClient.callback && typeof(wfsClient.callback) === "function")
  	{
  	    wfsClient.callback();
  	}

  };

  wfsClient = new WFSClient(
  	"https://atlas.cyclomedia.com/Recordings/wfs",
  	"atlas:Recording",
  	"EPSG:3857",
  	""
  );

  import Circle_ from '../leaflet/Circle';
  //import secret from './secret'

  const {props, methods} = Circle_;

  export default {
    props: [
      'latlng',
      'size',
      'color',
      'weight'
    ],
    mounted() {
      //this.$store.commit('setCycloFeatureGroup', { this });
      //createLeafletElement(this.latlng, this.size, this.color, this.weight)
      // console.log('recordingLayer.vue is calling Circle parentMounted');
      // this.parentMounted();
      const map = this.$store.state.map;
      this.prepareCycloBbox(map);
    },
    render(h) {
      return;
    },
    computed: {
      // map_() {
      //   return this.$store.state.map
      // }
      // latlng() {
      //   return this.$config.map.center;
      // }
    },
    methods: Object.assign(methods, {
      prepareCycloBbox(map) {

        console.log('$$$$$$$$$$$$ this is map', map);
        const view = map.getBounds();
        const zoomLevel = map.getZoom();
        // if (zoomLevel < 19) {
        //   _cycloFeatureGroup.clearLayers();
        // };
        //if (zoomLevel > 18) {
          var newSWCoord = proj4('EPSG:3857', [view._southWest.lng, view._southWest.lat]);
          var newNECoord = proj4('EPSG:3857', [view._northEast.lng, view._northEast.lat]);
          wfsClient.loadBbox(newSWCoord[0], newSWCoord[1], newNECoord[0], newNECoord[1], this.addCycloCircles, this.$config.cyclomedia.username, this.$config.cyclomedia.password);
        //}
      },
      addCycloCircles() {
        console.log('addCycloCircles is running');
        // _cycloFeatureGroup.clearLayers();
        // app.cyclo.recordings = app.cyclo.wfsClient.recordingList;
        // if (app.cyclo.recordings.length > 0) {
        //   var b = [];
        //   for (i=0; i < app.cyclo.recordings.length; i++) {
        //     var rec = app.cyclo.recordings[i];
        //     var coordRaw = [rec.lon, rec.lat];
        //     var coordNotFlipped = proj4('EPSG:3857', 'EPSG:4326', coordRaw);
        //     var coord = [coordNotFlipped[1], coordNotFlipped[0]];
        //     var blueCircle = new L.circle(coord, 1.2, {
        //       color: '#3388ff',
        //       weight: 1,
        //     }).on('click', function(coord){
        //       app.state.map.clickedCircle = 'true';
        //
        //       // SET LOCAL STORAGE
        //       app.map.LSclickedCircle(coord.latlng.lat, coord.latlng.lng);
        //
        //       // DIRECTLY CHANGE CYCLO-WINDOW
        //       app.cyclo.setNewLocation();
        //
        //     });
        //     //blueCircle.on({click: // console.log('clicked a circle')});
        //     blueCircle.addTo(_cycloFeatureGroup);
        //   }
        //   _cycloFeatureGroup.bringToFront();
        // }
        // set "circles on" in localStorage
        //localStorage.setItem('circlesOn', 'true');
      }
    })
  };



</script>
