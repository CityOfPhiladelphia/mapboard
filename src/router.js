import { parse as parseUrl } from 'url';
import DataManager from './data/data-manager';

class Router {
  constructor(opts) {
    this.store = opts.store;
    const enabled = this.enabled = opts.enabled;
    this.dataManager = opts.dataManager;
    this.history = window.history;

    // only listen for route changes if routing is enabled
    if (enabled) {
      window.onhashchange = this.hashChanged.bind(this);
    }
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
    const address = decodeURIComponent(pathComps[0]);
    let topic;

    if (pathComps.length > 1) {
      topic = decodeURIComponent(pathComps[1]);
    }

    // METHOD 1: update state
    // this.store.commit('setGeocodeInput', address);
    // const activeTopic = this.store.state.activeTopic;
    // if (topic && topic !== activeTopic) {
    //   this.store.commit('setActiveTopic', topic);
    // }

    // METHOD 2: geocode directly
    // trying this since watching a computed for geocodeInput doesn't seem to be
    // working.

  }
  // route(address) {
  //   const nextHash = `/${address}/${topic}`;
  //
  //   console.log(`route: ${nextHash}`);
  //
  //   window.location.hash = nextHash;
  // }
}

function routerMixin(Vue, opts) {
  const router = new Router(opts);

  Vue.mixin({
    created() {
      // $router seems to be reserved?
      this.$_router = router;
    }
  });
};

export default routerMixin;
