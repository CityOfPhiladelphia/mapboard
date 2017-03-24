// inspired by https://github.com/KoRiGaN/Vue2Leaflet/blob/master/src/utils/eventsBinder.js
function bindEvents(vue, leafletElement, leafletEvents) {
  for (let leafletEvent of leafletEvents) {
    const vueEvent = 'l-' + leafletEvent;
    leafletElement.on(leafletEvent, (e) => {
      vue.$emit(vueEvent, e);
    });
  }
}

export default bindEvents;
