import Vue from 'vue';
import createStore from './store';
import ConfigMixin from './util/config-mixin';
import appConfig from './config';
import Mapboard from './components/Mapboard';

export default (clientConfig) => {
  // merge app config and client config
  const config = Object.assign({}, appConfig, clientConfig);

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
