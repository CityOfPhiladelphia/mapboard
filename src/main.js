import Vue from 'vue';
import axios from 'axios';
import createStore from './store';
import configMixin from './util/config-mixin';
import Mapboard from './components/Mapboard.vue';
import mergeDeep from './util/merge-deep';
import generateUniqueId from './util/unique-id';

// import controllerMixin from './controller';
import controllerMixinShell from '@cityofphiladelphia/phila-vue-datafetch';
const controllerMixin = controllerMixinShell.controllerMixin;

// helper function to auto-assign ids to horizontal tables
function assignTableIds(comps) {
  for (let comp of comps) {
    const options = comp.options || {};
    const innerComps = options.components || options.tables;

    // if this is a "group" component, recurse
    if (innerComps) {
      assignTableIds(innerComps);
      // return;
    }

    // skip comps that aren't horizontal tables
    if (comp.type !== 'horizontal-table') {
      continue;
    }

     const id = generateUniqueId();
     comp._id = id;
     // the id also needs to get passed to the horizontal table component, so
     // use the options object.
     comp.options.tableId = id;
  }
}

function assignHorizontalTableGroupIds(comps) {
  for (let comp of comps) {
    const options = comp.options || {};
    const innerComps = options.tables;

    // if this is a "group" component, recurse
    if (!innerComps) {
      continue;
    }

    // skip comps that aren't horizontal table groups
    if (comp.type !== 'horizontal-table-group') {
      continue;
    }

     const id = generateUniqueId();
     comp._id = id;
     // the id also needs to get passed to the horizontal table component, so
     // use the options object.
     comp.options.horizontalTableGroupId = id;
  }
}

function initMapboard(clientConfig) {
  const baseConfigUrl = clientConfig.baseConfig;

  // get base config
  return axios.get(baseConfigUrl).then(response => {
    const data = response.data;

    // parse raw js. yes, it's ok to use eval :)
    // http://stackoverflow.com/a/87260/676001
    const baseConfigFn = eval(data);
    const { gatekeeperKey } = clientConfig;
    const baseConfig = baseConfigFn({ gatekeeperKey });

    // deep merge base config and client config
    const config = mergeDeep(baseConfig, clientConfig);

    // assign table ids
    for (let topic of config.topics) {
      assignTableIds(topic.components);
      assignHorizontalTableGroupIds(topic.components);
    }

    // make config accessible from each component via this.$config
    Vue.use(configMixin, config);

    // create store
    const store = createStore(config);

    // mix in controller
    Vue.use(controllerMixin, { config, store });
    // Vue.use(controllerMixin, { config, store, eventBus });

    // mount main vue
    const vm = new Vue({
      el: config.el || '#mapboard',
      render: h => h(Mapboard),
      store
    });

  }).catch(err => {
    console.error('Error loading base config:', err);
  });
}

export default initMapboard;

// also expose the vue component as a named export
export { Mapboard };
