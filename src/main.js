
import Vue from 'vue';
import axios from 'axios';
import createStore from './store';
import configMixin from './util/config-mixin';
import Mapboard from './components/Mapboard.vue';
import mergeDeep from './util/merge-deep';
import generateUniqueId from './util/unique-id';

import * as faAll from './fa.js';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import controllerMixin from '@phila/vue-datafetch/src/controller.js';

// conssole.log('in mapboard main.js, createStore:', createStore, 'controllerMixin:', controllerMixin);


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

function finishInit(config) {
  console.log('finishInit is running, config:', config);
  // assign table ids
  for (let topic of config.topics) {
    assignTableIds(topic.components);
    assignHorizontalTableGroupIds(topic.components);
  }

  // make config accessible from each component via this.$config
  Vue.use(configMixin, config);

  // create store
  const store = createStore(config);
  let opts = { config, store };

  console.log('in finishInit, config:', config, 'store:', store);

  // mix in controller
  Vue.use(controllerMixin, { config, store });

  Vue.component('font-awesome-icon', FontAwesomeIcon);
  // Vue.config.productionTip = false

  const customComps = config.customComps || [];
  // console.log('mapboard main.js, customComps:', customComps);
  for (let key of Object.keys(customComps)) {
    Vue.component(key, customComps[key]);
  }

  // mount main vue
  const vm = new Vue({
    el: config.el || '#mapboard',
    render: h => h(Mapboard),
    store,
  });
}

function initMapboard(clientConfig) {
  console.log('initMapboard is running');
  const baseConfigUrl = clientConfig.baseConfig;

  if (baseConfigUrl === null) {
    finishInit(clientConfig);
  } else {
    // get base config
    return axios.get(baseConfigUrl).then(response => {
      // console.log('in axios, clientConfig:', clientConfig);
      const data = response.data;
      // console.log('in axios, data:', data);

      // parse raw js. yes, it's ok to use eval :)
      // http://stackoverflow.com/a/87260/676001
      const baseConfigFn = eval(data);
      const { gatekeeperKey } = clientConfig;
      const baseConfig = baseConfigFn({ gatekeeperKey });
      // console.log('baseConfig:', baseConfig);

      // deep merge base config and client config
      const config = mergeDeep(baseConfig, clientConfig);
      // console.log('config:', config);
      finishInit(config);
    }).catch(err => {
      console.error('Error loading base config:', err);
      var windowHeight = window.innerHeight;
      var appFooterHeightNum = parseInt(document.getElementsByClassName('app-footer')[0].getBoundingClientRect().height);
      var divHeight = windowHeight - appFooterHeightNum;
      console.log('windowHeight:', windowHeight, 'appFooterHeightNum:', appFooterHeightNum, 'divHeight:', divHeight);
      var element = document.getElementById('mapboard');
      element.innerHTML = '\
      <div style="width:100%;height:' + divHeight + ';">\
        <div style="max-width:300px;margin-left:auto;margin-right:auto;">\
          <h2>\
            Something has gone wrong with the site.<br>\
            Please try again later.\
          </h2>\
        </div>\
      </div>\
      ';
      // return 'return error';
    });
  }
}

export default initMapboard;
