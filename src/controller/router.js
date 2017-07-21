import { parse as parseUrl } from 'url';

class Router {
  constructor(opts) {
    const config = this.config = opts.config;
    this.store = opts.store;
    this.controller = opts.controller;
    this.eventBus = opts.eventBus;
    this.dataManager = opts.dataManager;
    this.history = window.history;

    // check if the router should be silent (i.e. not update the url or listen
    // for hash changes)
    const silent = this.silent = !config.router || !config.router.enabled;

    // only listen for route changes if routing is enabled
    if (!silent) {
      window.onhashchange = this.hashChanged.bind(this);
    }
  }

  makeHash(address, topic) {
    console.log('make hash', address, topic);

    // must have an address
    if (!address || address.length === 0) {
      return null;
    }

    let hash = `/${address}`;
    if (topic) {
      hash += `/${topic}`;
    }

    return hash;
  }

  getAddressFromState() {
    // TODO add an address getter fn to config so this isn't ais-specific
    const geocodeData = this.store.state.geocode.data || {};
    const props = geocodeData.properties || {};
    return props.street_address;
  }

  hashChanged() {
    const location = window.location;
    const hash = location.hash;

    console.log('hash changed =>', hash);

    // parse url
    const comps = parseUrl(location.href);
    const query = comps.query;

    // handle ?search entry point
    if (query && query.search) {
      // TODO
    }

    // parse path
    const pathComps = hash.split('/').splice(1);
    const addressComp = pathComps[0];

    // if there's no address, don't do anything
    if (!addressComp) {
      console.log('no address, returning');
      return;
    }

    const nextAddress = decodeURIComponent(addressComp);
    let nextTopic;

    if (pathComps.length > 1) {
      nextTopic = decodeURIComponent(pathComps[1]);
    }

    this.route(nextAddress, nextTopic);
  }

  route(nextAddress, nextTopic = '') {
    console.log('Router.route', nextAddress, nextTopic);

    if (nextTopic) {
      // check against active topic
      const prevTopic = this.store.state.activeTopic;

      if (!prevTopic || prevTopic !== nextTopic) {
        this.store.commit('setActiveTopic', nextTopic);
      }
    }

    if (nextAddress) {
      // check against current address
      const prevAddress = this.getAddressFromState();

      // if the hash address is different, geocode
      if (!prevAddress || nextAddress !== prevAddress) {
        this.dataManager.geocode(nextAddress)
                        .then(this.didGeocode.bind(this));
      }
    }

    // if not silent, update hash
    if (!this.silent) {
      const prevOrNextAddress = nextAddress || this.getAddressFromState();

      const nextHash = this.makeHash(prevOrNextAddress, nextTopic);
      console.log('nextHash', nextHash);

      if (nextHash) {
        window.location.hash = nextHash;
      } else {
        throw `Could not form hash for: ${prevOrNextAddress}, ${nextTopic}`;
      }
    }
  }

  didGeocode() {
    console.log('Router.didGeocode');

    // update url
    // REVIEW this is ais-specific
    const address = this.store.state.geocode.data.properties.street_address;
    const topic = this.store.state.activeTopic;

    if (!this.silent) {
      window.location.hash = this.makeHash(address, topic);
    }
  }
}

export default Router;
