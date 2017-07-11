import Vue from 'vue';
import createStore from './store';
import configMixin from './util/config-mixin';
import eventBusMixin from './util/event-bus-mixin';
import Mapboard from './components/Mapboard';
import mergeDeep from './util/merge-deep';

export default (clientConfig) => {
  const baseConfigUrl = clientConfig.baseConfig;

  // create a global event bus used to proxy events to the mapboard host
  Vue.use(eventBusMixin);

  // get base config
  return $.ajax({
    url: baseConfigUrl,
    success(data) {
      // parse raw js. yes, it's ok to use eval :)
      // http://stackoverflow.com/a/87260/676001
      const baseConfig = eval(data);

      // deep merge base config and client config
      //const config = mergeDeep(clientConfig, baseConfig);
      const config = mergeDeep(baseConfig, clientConfig);

      // make config accessible from each component via this.$config
      Vue.use(configMixin, config);

      // create store
      const store = createStore(config);

      // mount main vue
      const vm = new Vue({
        el: config.el || '#mapboard',
        render: (h) => h(Mapboard),
        store
      });

      // bind mapboard events to host app
      const events = config.events || {};
      for (let eventName of Object.keys(events)) {
        const callback = events[eventName];
        vm.$eventBus.$on(eventName, callback);
      }

      // event api for host apps
      // this doesn't work now that we're getting the base config
      // asynchronously. see above for workaround.
      // REVIEW it would be nice to return the jquery ajax deferred and have the
      // client app call .then() on it.
      // return {
      //   on(eventName, callback) {
      //     vm.$eventBus.$on(eventName, callback);
      //     return this;
      //   },
      //   off(eventName, callback) {
      //     vm.$eventBus.$off(eventName, callback);
      //     return this;
      //   }
      // };
    },
    error(err) {
      console.error('Error loading base config:', err);
    }
  });
};
