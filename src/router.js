import { parse as parseUrl } from 'url';
import DataManager from './data/data-manager';

class Router {
  constructor(opts) {
    const store = this.store = opts.store;
    const config = this.config = opts.config;
    const enabled = this.enabled = config.router.enabled;
    const eventBus = this.eventBus = opts.eventBus;
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
    const addressComp = pathComps[0];

    // if there's no address, don't do anything
    if (!addressComp) {
      console.log('no address, returning');
      return;
    }

    const address = decodeURIComponent(addressComp);
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
    if (address) {
      this.dataManager.geocode(address);
    }
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
