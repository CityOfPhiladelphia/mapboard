import Vue from 'vue';
import createStore from './store';
import ConfigMixin from './util/config-mixin';
import Mapboard from './components/Mapboard';
import mergeDeep from './util/merge-deep';

export default (clientConfig) => {
  const baseConfigUrl = clientConfig.baseConfig;


  // get base config
  $.ajax({
    url: baseConfigUrl,
    success(data) {
      // parse raw js. yes, it's ok to use eval :)
      // http://stackoverflow.com/a/87260/676001
      const baseConfig = eval(data);

      // deep merge base config and client config
      const config = mergeDeep(clientConfig, baseConfig);

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
    },
    error(err) {
      console.error('Error loading base config:', err);
    }
  });
};
