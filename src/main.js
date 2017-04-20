import Vue from 'vue';
import createStore from './store';
import configMixin from './util/config-mixin';
import eventBusMixin from './util/event-bus-mixin';
import Mapboard from './components/Mapboard';

export default (clientConfig) => {
  // TODO fetch base config and merge with client config
  const config = clientConfig;

  // make config accessible from each component via this.$config
  Vue.use(configMixin, config);

  // create a global event bus used to proxy events to the mapboard host
  Vue.use(eventBusMixin);

  // create store
  const store = createStore(config);

  // mount main vue
  const vm = new Vue({
    el: config.el || '#mapboard',
    render: (h) => h(Mapboard),
    store
  });

  // event api for host apps
  return {
    on(eventName, callback) {
      vm.$eventBus.$on(eventName, callback);
      return this;
    },
    off(eventName, callback) {
      vm.$eventBus.$off(eventName, callback);
      return this;
    }
  };
};
