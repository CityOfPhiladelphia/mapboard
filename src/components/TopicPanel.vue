<template>
  <div
    id="data-panel-container"
    :class="'mb-panel-topics cell ' + topicPanelContainerClass"
  >
    <full-screen-topics-toggle-tab
      v-if="!fullScreenTopicsOnly"
      v-once
    />

    <!-- address header - it only shows if the app is set to "fullScreenTopicsOnly" or there is a geocode -->
    <div
      v-if="shouldShowAddressHeader"
      class="address-header cell small-24 medium-24"
    >
      <div
        :class="'address-container columns ' + addressContainerClass"
        :style="addressContainerStyle"
      >
        <div
          v-if="!address"
          class="default-address-text"
          :style="defaultAddressTextPlaceholderStyle"
        >
          {{ this.$config.defaultAddressTextPlaceholder.text }}
        </div>
        <h1 class="address-header-line-1">
          <!-- there is no map marker if there is no map -->
          <font-awesome-icon
            v-if="!fullScreenTopicsOnly"
            icon="map-marker-alt"
          />
          <!-- <i class="fa fa-map-marker-alt"
             v-if="!this.fullScreenTopicsOnly"
          ></i> -->
          {{ address }}
        </h1>
        <!-- <div class="address-header-line-2"
             v-show="!this.geocode"
        >

        </div> -->
        <div
          v-show="geocode"
          class="address-header-line-2"
        >
          PHILADELPHIA, PA {{ zipCode }}
        </div>
        <any-header
          v-if="addressHeaderAdditionalInfo"
          :options="addressHeaderAdditionalHeaderOptions"
          :slots="addressHeaderAdditionalHeaderSlots"
        />
        <!-- <div class="address-header-line-3"
          >
            {{ addressHeaderAdditionalInfo }}
          </div> -->
        <!-- </any-header> -->
        <!-- <div class="address-header-line-3"
             v-if="this.addressHeaderAdditionalInfo && !this.addressHeaderAdditionalHeaderOptions"
        >
          {{ addressHeaderAdditionalInfo }}
        </div> -->
      </div>

      <div
        v-if="fullScreenTopicsEnabled && !stacked || fullScreenTopicsOnly"
        class="address-input-container columns small-24 medium-12 large-12"
        :style="addressInputContainerStyle"
      >
        <address-input
          :width-from-config="addressInputWidth"
          :placeholder="addressInputPlaceholder"
          @handle-search-form-submit="handleSearchFormSubmit"
        >
          <address-candidate-list
            v-if="addressAutocompleteEnabled"
            slot="address-candidates-slot"
            :width-from-config="addressInputWidth"
          />
        </address-input>
      </div>
    </div>

    <!-- before search -->
    <div
      v-if="shouldShowGreeting"
      class="topics-container cell medium-cell-block-y"
      :style="topicsContainerStyle"
    >
      <greeting
        v-show="shouldShowGreeting"
        :message="greetingText"
        :options="greetingOptions"
      />
    </div>

    <!-- after search -->
    <div
      v-if="!shouldShowGreeting"
      class="topic-panel-content"
    >
      <div
        class="topics-container cell medium-cell-block-y"
        :style="topicsContainerStyle"
      >
        <topic-component-group
          :topic-components="this.$config.components"
          @handle-topic-header-click="handleTopicHeaderClick"
          @get-more-records="getMoreRecords"
        />
      </div>
    </div>
  </div>
</template>

<script>

import FullScreenTopicsToggleTab from '@phila/vue-comps/src/components/FullScreenTopicsToggleTab.vue';

export default {
  components: {
    AnyHeader: () => import(/* webpackChunkName: "mbmp_pvc_AnyHeader" */'@phila/vue-comps/src/components/AnyHeader.vue'),
    Greeting: () => import(/* webpackChunkName: "mbmp_pvc_Greeting" */'@phila/vue-comps/src/components/Greeting.vue'),
    TopicComponentGroup: () => import(/* webpackChunkName: "mbmp_pvc_TopicComponentGroup" */'@phila/vue-comps/src/components/TopicComponentGroup.vue'),
    // Topic: () => import(/* webpackChunkName: "mbmp_pvc_Topic" */'@phila/vue-comps/src/components/Topic.vue'),
    AddressInput: () => import(/* webpackChunkName: "mbmp_pvc_AddressInput" */'@phila/vue-comps/src/components/AddressInput.vue'),
    AddressCandidateList: () => import(/* webpackChunkName: "mbmp_pvc_AddressCandidateList" */'@phila/vue-comps/src/components/AddressCandidateList.vue'),
    // FullScreenTopicsToggleTab: () => import(/* webpackChunkName: "mbmp_pvc_FullScreenTopicsToggleTab" */'@phila/vue-comps/src/components/FullScreenTopicsToggleTab.vue')
    FullScreenTopicsToggleTab,
  },
  data() {
    const data = {
      defaultAddressTextPlaceholderStyle: {},
      topicsContainerStyle: {
        'overflow-y': 'auto',
        'height': '100px',
        'min-height': '100px',
      },
      addressContainerStyle: {
        'height': '100%',
        'align-items': 'flex-start',
        'padding-left': '20px',
        'padding-top': '20px',
        'padding-bottom': '20px',
      },
      addressInputContainerStyle: {
        'height': '100%',
        'align-items': 'center',
        'padding-top': '10px',
        'padding-bottom': '10px',
      },
      stacked: false,
    };
    return data;
  },
  computed: {
    windowDim() {
      return this.$store.state.windowDimensions;
    },
    greetingText() {
      return this.$config.greeting.message;
    },
    greetingOptions() {
      return this.$config.greeting.options;
    },
    shouldShowAddressHeader() {
      if (this.fullScreenTopicsOnly || this.shouldShowGreeting === false) {
        return true;
      }
      return false;

    },
    addressHeaderAdditionalHeaderOptions() {
      let ahaiOptions;
      if (this.$config.addressHeaderAdditionalInfo) {
        const ahai = this.$config.addressHeaderAdditionalInfo;
        if (ahai.options) {
          ahaiOptions = ahai.options;
          if (!ahai.options.headerType) {
            ahaiOptions.headerType = 'h4';
            // ahai.options.headerType = 'h4';
          }
          // return ahai.options;
        }
      }
      return ahaiOptions;
    },
    addressHeaderAdditionalHeaderSlots() {
      return {
        text: this.addressHeaderAdditionalInfo,
      };
    },
    addressHeaderAdditionalInfo() {
      let returned = [];
      if (this.$config.addressHeaderAdditionalInfo) {
        const geocode = this.geocode;
        if (!geocode) {
          return null;
        }
        const ahai = this.$config.addressHeaderAdditionalInfo;
        // let returned = [];
        if (ahai.preText) {
          returned.push(ahai.preText);
        }
        returned.push(geocode.properties[ahai.data]);
        // console.log('returned:', returned);
        // return returned.join(' ');
      }
      return returned.join(' ');
    },
    inputAlign() {
      let value;
      if (this.$config.addressInput) {
        if (this.$config.addressInput.position) {
          const position = this.$config.addressInput.position;
          switch(position) {
          case 'left':
            value = 'flex-start';
            break;
          case 'right':
            value = 'flex-end';
            break;
          case 'center':
            value = 'center';
          }
        } else {
          value = 'flex-start';
        }
      } else {
        value = 'flex-start';
      }
      return value;
    },
    addressInputWidth() {
      if (this.$config.addressInput) {
        return this.$config.addressInput.width;
      }
      return 415;

    },
    addressInputPlaceholder() {
      if (this.$config.addressInput) {
        return this.$config.addressInput.placeholder;
      }
      return null;

    },
    addressAutocompleteEnabled() {
      if (this.$config.addressInput) {
        if (this.$config.addressInput.autocompleteEnabled === true) {
          return true;
        }
        return false;

      }
      return false;

    },
    fullScreenMapEnabled() {
      return this.$store.state.fullScreenMapEnabled;
    },
    fullScreenTopicsEnabled() {
      return this.$store.state.fullScreenTopicsEnabled;
    },
    fullScreenTopicsOnly() {
      return this.$store.state.fullScreen.topicsOnly;
    },
    topicPanelContainerClass() {
      if (this.fullScreenTopicsEnabled || this.fullScreenTopicsOnly) {
        return 'medium-24 small-order-2 medium-order-1';
      } else if (this.fullScreenMapEnabled) {
        return 'medium-1 small-order-2 medium-order-1';
      }
      return 'medium-12 small-order-2 medium-order-1';

    },
    addressContainerClass() {
      if (this.fullScreenTopicsEnabled || this.fullScreenTopicsOnly) {
        return 'small-24 medium-12 large-12';
      }
      return 'small-24';

    },
    geocode() {
      return this.$store.state.geocode.data;
    },
    geocodeStatus() {
      return this.$store.state.geocode.status;
    },
    dorParcels() {
      return this.$store.state.parcels.dor.data.length > 0;
      // return this.$store.state.parcels.dor.length > 0;
    },
    shouldShowGreeting() {
      // this was added to allow fetchData to run even without a geocode result
      // for the real estate tax site which sometimes needs data from TIPS
      // even if the property is not in OPA and AIS
      if (this.$config.onGeocodeFail) {
        if (this.$store.state.geocode.status === null) {
          return true;
        }
        return !(this.$store.state.sources[this.$config.onGeocodeFail.data]);
      }
      return !(this.geocode || this.dorParcels);

    },
    // this returns the address shown in the address header
    address() {
      const geocode = this.geocode;
      let dorParcels;
      let activeDorAddress;
      if (this.$store.state.parcels.dor) {
        dorParcels = this.$store.state.parcels.dor.data;
        activeDorAddress = this.$store.state.parcels.dor.activeAddress;
      }
      let address;
      // if (this.$config.defaultAddressTextPlaceholder) {
      //   address = this.$config.defaultAddressTextPlaceholder.text;
      // }

      if (geocode) {
        // TODO make this not ais-specific
        // REVIEW what's the difference between these two?
        const addressA = geocode.properties.street_address;
        const addressB = geocode.street_address;

        address = addressA || addressB;

        // a DOR address might be found even if there is no geocode
      } else if (activeDorAddress) {
        address = activeDorAddress;
      } else if (this.$config.onGeocodeFail) {
        // this was added to allow fetchData to run even without a geocode result
        // for the real estate tax site which sometimes needs data from TIPS
        // even if the property is not in OPA and AIS
        if (this.$store.state.sources[this.$config.onGeocodeFail.data].data) {
          if (this.$store.state.sources[this.$config.onGeocodeFail.data].data.body) {
            if (this.$store.state.sources[this.$config.onGeocodeFail.data].data.body.includes('Invalid account number')) {
              address = null;
            } else {
              address = this.$store.state.geocode.input;
            }
          } else {
            address = this.$store.state.geocode.input;
          }
        }
      }

      return address;
    },
    zipCode() {
      const geocode = this.geocode;
      if (!geocode) {
        return null;
      }
      const zipCode = geocode.properties.zip_code;
      const zip4 = geocode.properties.zip_4;
      const parts = [ zipCode ];
      if (zip4) {
        parts.push(zip4);
      }
      return parts.join('-');
    },
  },
  watch: {
    geocodeStatus() {
      this.handleWindowResize(this.windowDim);
    },
    windowDim(nextDim) {
      this.handleWindowResize(nextDim);
    },
  },
  // created() {
  //   if (this.$config.plugin) {
  //     if (this.$config.plugin.enabled) {
  //       this.topicsContainerStyle.height = this.$config.plugin.height.toString() + 'px';
  //     }
  //   }
  // },
  mounted() {
    this.handleWindowResize(this.windowDim);
    console.log('TopicPanel.vue mounted');
  },
  methods: {
    getMoreRecords(dataSource, highestPageRetrieved) {
      // console.log('TopicPanel getMoreRecords is running');
      this.$controller.getMoreRecords(dataSource, highestPageRetrieved);
    },
    handleSearchFormSubmit(value) {
      // console.log('TopicPanel handleSearchFormSubmit is running');
      this.$controller.handleSearchFormSubmit(value);
    },
    handleTopicHeaderClick(nextTopic) {
      // console.log('TopicPanel handleTopicHeaderClick is running');
      this.$controller.handleTopicHeaderClick(nextTopic);
    },
    closeAddressCandidateList() {
      this.$store.state.shouldShowAddressCandidateList = false;
    },
    handleWindowResize(dim) {
      // console.log('TopicPanel handleWindowResize is running');
      let topicsHeight;
      if (this.$config.plugin) {
        if (this.$config.plugin.enabled) {
          if (this.shouldShowAddressHeader) {
            if (document.getElementsByClassName('address-header')[0]) {
              // console.log('handleWindowResize is running, it is set to plugin and there is an address header')
              // const addressHeaderHeightNum = parseInt(window.getComputedStyle(document.getElementsByClassName('address-header')[0]).getPropertyValue('height').replace('px', ''));
              const addressHeaderHeightNum = parseInt(document.getElementsByClassName('address-header')[0].getBoundingClientRect().height);
              if (addressHeaderHeightNum !== 0) {
                topicsHeight = this.$config.plugin.height - addressHeaderHeightNum;
                // console.log('handleWindowResize shouldShowAddressHeader and it was found, addressHeaderHeight:', addressHeaderHeightNum, 'topicsHeight:', topicsHeight);
              } else {
                topicsHeight = this.$config.plugin.height - 103;
                this.topicsContainerStyle.height = this.$config.plugin.height.toString() + 'px';
                // console.log('handleWindowResize shouldShowAddressHeader and it was found to be 0 so it is using the hardcoded 103, topicsHeight:', topicsHeight);
              }
            // return;
            } else {
              // console.log('no address-header');
              topicsHeight = this.$config.plugin.height - 103;
            }
          } else {
            // console.log('this.shouldShowAddressHeader:', this.shouldShowAddressHeader);
            topicsHeight = this.$config.plugin.height;
          }
        }
      } else {

        // this is called to run when:
        // 1 - TopicPanel.vue mounted
        // 2 - geocodeStatus change
        // 3 - any resizing of the window

        // const windowHeight = $(window).height();
        const windowHeight = window.innerHeight;
        // const siteHeaderHeightNum = parseInt(window.getComputedStyle(document.getElementsByClassName('site-header')[0]).getPropertyValue('height').replace('px', ''));
        const siteHeaderHeightNum = parseInt(document.getElementsByClassName('site-header')[0].getBoundingClientRect().height);
        // const appFooterHeightNum = parseInt(window.getComputedStyle(document.getElementsByClassName('app-footer')[0]).getPropertyValue('height').replace('px', ''));
        const appFooterHeightNum = parseInt(document.getElementsByClassName('app-footer')[0].getBoundingClientRect().height);


        if (this.shouldShowAddressHeader) {
          if (document.getElementsByClassName('address-header')[0]) {
            // const addressHeaderHeightNum = parseInt(window.getComputedStyle(document.getElementsByClassName('address-header')[0]).getPropertyValue('height').replace('px', ''));
            const addressHeaderHeightNum = parseInt(document.getElementsByClassName('address-header')[0].getBoundingClientRect().height);
            if (addressHeaderHeightNum !== 0) {
              topicsHeight = windowHeight - siteHeaderHeightNum - appFooterHeightNum - addressHeaderHeightNum;
              // console.log('handleWindowResize shouldShowAddressHeader and it was found, window-height:', windowHeight, 'SiteHeaderHeight:', siteHeaderHeightNum, 'addressHeaderHeight:', addressHeaderHeightNum, 'appFooterHeight:', appFooterHeightNum, 'topicsHeight:', topicsHeight);
            } else {
              topicsHeight = windowHeight - siteHeaderHeightNum - appFooterHeightNum - 103;
              // console.log('handleWindowResize shouldShowAddressHeader and it was found to be 0 so it is using the hardcoded 103, window-height:', windowHeight, 'SiteHeaderHeight:', siteHeaderHeightNum, 'appFooterHeight:', appFooterHeightNum, 'topicsHeight:', topicsHeight);
            }
          } else {
            topicsHeight = windowHeight - siteHeaderHeightNum - appFooterHeightNum - 103;
            // console.log('handleWindowResize shouldShowAddressHeader but it was not found so it is using the hardcoded 103, window-height:', windowHeight, 'SiteHeaderHeight:', siteHeaderHeightNum, 'appFooterHeight:', appFooterHeightNum, 'topicsHeight:', topicsHeight);
          }
        } else {
          topicsHeight = windowHeight - siteHeaderHeightNum - appFooterHeightNum;
          // console.log('handleWindowResize shouldShowAddressHeader is NOT true, window-height:', windowHeight, 'SiteHeaderHeight:', siteHeaderHeightNum, 'appFooterHeight:', appFooterHeightNum, 'topicsHeight:', topicsHeight);
        }
      }

      // console.log('topicsHeight:', topicsHeight);
      // if ($(window).width() >= 750) {
      if (window.innerWidth >= 750) {
        this.stacked = false;
        if (this.$config.defaultAddressTextPlaceholder) {
          this.defaultAddressTextPlaceholderStyle = this.$config.defaultAddressTextPlaceholder.wideStyle;
        }
        this.addressContainerStyle = {
          // 'height': '100%',
          'align-items': 'flex-start',
          'padding-left': '20px',
          'padding-top': '20px',
          'padding-bottom': '20px',
        };
        this.addressInputContainerStyle = {
          // 'height': '100%',
          'align-items': this.inputAlign,
          'padding-top': '30px',
          'padding-bottom': '30px',
        };
        this.topicsContainerStyle.height = topicsHeight.toString() + 'px';
        this.topicsContainerStyle['min-height'] = topicsHeight.toString() + 'px';
        // if (this.$config.plugin) {
        //   if (this.$config.plugin.enabled) {
        //     this.topicsContainerStyle['overflow-y'] = 'hidden';
        //   }
        // } else {
        this.topicsContainerStyle['overflow-y'] = 'auto';
        // }

      } else {
        this.stacked = true;
        if (this.$config.defaultAddressTextPlaceholder) {
          this.defaultAddressTextPlaceholderStyle = this.$config.defaultAddressTextPlaceholder.narrowStyle;
        }
        this.addressContainerStyle = {
          // 'height': 'auto',
          'align-items': 'center',
          'padding-left': '0px',
          'padding-top': '10px',
          'padding-bottom': '10px',
        };
        this.addressInputContainerStyle = {
          // 'height': 'auto',
          'align-items': 'center',
          'padding-top': '10px',
          'padding-bottom': '10px',
        };
        this.topicsContainerStyle.height = 'auto';
        this.topicsContainerStyle['min-height'] = topicsHeight.toString() + 'px';
        this.topicsContainerStyle['overflow-y'] = 'hidden';
      }
    },
  },
};
</script>

<style scoped>
  /*don't highlight any form elements*/
  input:focus,
  select:focus,
  textarea:focus,
  button:focus {
    outline: none;
  }

  /* standards applies padding to buttons, which causes some weirdness with
  buttons on the map panel. override here. */
  button {
    padding: inherit;
  }

  .mb-panel-topics {
    position: relative;
  }

  .address-header {
    background: #daedfe;
    color: #0f4d90;

    /*this keeps the box shadow over the scrollable part of the panel*/
    position: relative;
    z-index: 1;

    -webkit-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
    -moz-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
    box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
    margin-bottom: -5px !important;
    display: inline-block;
  }

  .address-header-line-1 {
    margin-bottom: 0;
    margin-top: 0;
    padding-top: 0px !important;
    padding-bottom: 0px !important;
    padding-right: 8px !important;
    padding-left: 8px !important;
  }

  .address-header-line-2 {
    padding: 0px;
  }

  .address-header-line-3 {
    padding: 0px;
  }

  .address-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .address-input-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .topics-container {
    padding: 26px;
    position: relative;
    overflow-x: hidden;
  }

  .default-address-text {
    font-size: 30px;
    line-height: 26px;
    font-family: 'Montserrat', 'Tahoma', sans-serif;
    padding-top: 0px !important;
    padding-bottom: 0px !important;
    padding-right: 8px !important;
    padding-left: 8px !important;
  }

</style>
