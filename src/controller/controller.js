/*
The Controller handles events from the UI that have some effect on routing or
data fetching. It is a "thin" class that mostly proxies events to the router and
data manager, and facilitates communication between them.
*/

import Router from './router';
import DataManager from './data-manager';

class Controller {
  constructor(opts) {
    const store = this.store = opts.store;
    const config = this.config = opts.config;
    const eventBus = this.eventBus = opts.eventBus;
    this.history = window.history;

    // the router and data manager need a ref to the controller
    opts.controller = this;

    // create data manager
    const dataManager = this.dataManager = new DataManager(opts);

    // create router
    opts.dataManager = dataManager;
    this.router = new Router(opts);
  }


  // activeTopicConfig() {
  //   const key = this.store.state.activeTopic;
  //   let config;
  //
  //   // if no active topic, return null
  //   if (key) {
  //     config = this.config.topics.filter((topic) => {
  //       return topic.key === key;
  //     })[0];
  //   }
  //
  //   return config || {};
  // }
  //
  // activeParcelLayer() {
  //   return this.activeTopicConfig().parcels || this.config.map.defaultBasemap;
  // }


  /*
  EVENT HANDLERS
  */

  appDidLoad() {
    // route once on load
    this.router.hashChanged();
  }

  getMoreRecords(dataSource, highestPageRetrieved) {
    // console.log('controller get 100 More records was clicked, dataSource', dataSource, 'highestPageRetrieved', highestPageRetrieved);
    this.dataManager.fetchMoreData(dataSource, highestPageRetrieved);
  }

  handleSearchFormSubmit(e) {
    console.log('handle search form submit', e, this);

    const input = e.target[0].value;

    this.store.commit('setLastSearchMethod', 'geocode');
    this.store.commit('setClickCoords', null);
    this.store.commit('setGeocodeStatus', null);
    this.store.commit('setGeocodeInput', input);

    // clear out state
    const parcelLayers = Object.keys(this.config.parcels || {});
    for (let parcelLayer of parcelLayers) {
      const configForParcelLayer = this.config.parcels[parcelLayer];
      const multipleAllowed = configForParcelLayer.multipleAllowed;
      let payload;
      // pwd
      if (!multipleAllowed) {
        payload = {
          parcelLayer: parcelLayer,
          multipleAllowed,
          data: null
        }
      // dor
      } else {
        payload = {
          parcelLayer: parcelLayer,
          multipleAllowed,
          data: [],
          status: null,
          activeParcel: null,
          activeAddress: null,
          activeMapreg: null
        }
      }
      // update state
      this.store.commit('setParcelData', payload);
    }

    // tell router
    this.router.routeToAddress(input);
  }

  handleMapClick(e) {
    console.log('handle map click', e, this);

    // TODO figure out why form submits via enter key are generating a map
    // click event and remove this
    if (e.originalEvent.keyCode === 13) {
      return;
    }
    this.store.commit('setLastSearchMethod', 'reverseGeocode');
    this.store.commit('setClickCoords', null);

    // get parcels that intersect map click xy
    const latLng = e.latlng;
    this.store.commit('setClickCoords', latLng);
    this.store.commit('setGeocodeInput', null);

    // if click is on a topic with pwd parcels, you do not want to find dor parcels unless the
    // click was actually on a pwd parcel that could be geocoded, because just running
    // getDorParcelsByLatLng changes the Deeds topic in the UI, and the click could have been
    // on the road
    // there is a callback after geocode to get dor parcels
    const activeParcelLayer = this.store.state.activeParcelLayer;
    // console.log('activeParcelLayer', activeParcelLayer);
    this.dataManager.getParcelsByLatLng(latLng, activeParcelLayer);
  }

  inViewport(el, config) {
    var rect = el.getBoundingClientRect();
    return (
     rect.top >= parseInt(config.rootStyle.top.replace('px', '')) + 100 &&
     rect.left >= 0 &&
     rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
     rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
  }

  handleTopicHeaderClick(topic, target) {
    // console.log('Controller.handleTopicHeaderClick', topic);
    let targetExists
    if (target) {
      targetExists = target
    } else {
      targetExists = null
    }
    this.router.routeToTopic(topic);//.then(function(targetExists) {
    if (targetExists) {
      // targetExists.scrollTop = 0;
      const vp = this.inViewport;
      const config = this.config
      setTimeout(function() {
        // const inVp = this.inViewport(targetExists);
        const inVp = vp(targetExists, config);
        console.log('handleTopicHeaderClick, inVp:', inVp);
        if (!inVp) {
          // $('#topics-container').animate({ scrollTop: 0}, "fast");
          targetExists.scrollIntoView();
        }
      }, 500);
    }
    // });
  }

  goToDefaultAddress(address) {
    this.router.routeToAddress(address);
  }
}

export default Controller;
