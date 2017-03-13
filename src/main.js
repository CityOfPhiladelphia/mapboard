import Vue from 'vue'
import ConfigMixin from './util/config-mixin'
import Mapboard from './components/Mapboard'

export default (config) => {
  // make config accessible from each component via this.$config
  Vue.use(ConfigMixin, config);

  // mount main vue
  new Vue({
    el: config.el || '#mapboard',
    render: (h) => h(Mapboard)
  });
};
