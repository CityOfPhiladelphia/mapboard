import Vue from 'vue';
import createStore from './store';
import ConfigMixin from './util/config-mixin';
import Mapboard from './components/Mapboard';

export default (clientConfig) => {
  // TODO fetch base config and merge with client config
  const config = clientConfig;

  // make config accessible from each component via this.$config
  Vue.use(ConfigMixin, config);

  // create store
  const store = createStore(config);

  // mount main vue
  new Vue({
    el: config.el || '#mapboard',
    render: (h) => h(Mapboard),
    store
  });
};
