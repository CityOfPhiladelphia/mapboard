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


  /*
  EVENT HANDLERS
  */

  appDidLoad() {
    // route once on load
    this.router.hashChanged();
  }

  handleSearchFormSubmit(e) {
    console.log('handle search form submit', e, this);

    const input = e.target[0].value;

    // clear out state
    this.store.commit('setLastSearchMethod', 'geocode');
    this.store.commit('setPwdParcel', null);
    this.store.commit('setDorParcels', []);

    // tell router
    this.router.route(input);
  }

  handleMapClick(e) {
    console.log('handle map click', e, this);

    // TODO figure out why form submits via enter key are generating a map
    // click event and remove this
    if (e.originalEvent.keyCode === 13) {
      return;
    }
    this.store.commit('setLastSearchMethod', 'reverseGeocode')

    // get parcels that intersect map click xy
    const latLng = e.latlng;

    this.dataManager.getDorParcelsByLatLng(latLng);
    this.dataManager.getPwdParcelByLatLng(latLng);
  }

  handleTopicHeaderClick(topic) {
    console.log('Controller.handleTopicHeaderClick', topic);

    this.router.route(null, topic);
  }

  goToDefaultAddress(address) {
    this.router.route(address);
  }
}

export default Controller;
