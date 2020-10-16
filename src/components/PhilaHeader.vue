<template>
  <header class="app-header combo-header shrink">
    <div class="grid-x grid-padding-x grid-padding-y align-middle">

      <div class="cell mobile-menu show-for-small-only small-2">
        <font-awesome-icon
          v-show="!footerListIsOpen"
          icon="bars"
          size="2x"
          :style="{ color: 'white' }"
          @click="toggleFooterMenu"
        />
        <font-awesome-icon
          v-show="footerListIsOpen"
          icon="times"
          size="2x"
          :style="{ color: 'white' }"
          @click="toggleFooterMenu"
        />
      </div>

      <div class="cell medium-auto small-20">
        <div class="grid-x grid-padding-x align-middle">
          <div
            v-if="shouldShowLogo"
            class="cell shrink hide-for-small-only"
          >
            <a
              :href="appLogoLink"
              class="logo flex-child-auto"
            >
              <img
                :src="appLogo"
                :alt="appLogoAlt"
                class="app-logo"
              >
            </a>
          </div>
          <div
            v-if="shouldShowLogo"
            class="cell shrink hide-for-small-only"
          >
            <div class="app-divide flex-child-auto" />
          </div>
          <div class="cell shrink text-centered">
            <section class="title-container flex-child-auto">
              <!-- <router-link
                :to="appLink"
                class="app-title"
              > -->
              <a
                class="app-title"
                :href="appLink"
              >
                <h1
                  v-if="i18nEnabled"
                  class="title no-margins"
                >
                  {{ $t('app.title') }}
                </h1>
                <h1
                  v-if="!i18nEnabled"
                  class="title no-margins"
                >
                  {{ $config.app.title }}
                </h1>

                <div
                  v-if="!i18nEnabled && shouldShowBetaTag"
                  id="demo-badge"
                >
                  BETA
                </div>
                <div
                  v-if="i18nEnabled && shouldShowBetaTag"
                  id="demo-badge"
                  v-html="$t('app.betaTag')"
                />

                <h2
                  v-if="i18nEnabled"
                  class="h6 show-for-small-only tagline no-margins"
                >
                  CITY OF PHILADELPHIA
                </h2>
                <h2
                  v-if="i18nEnabled"
                  class="h6 hide-for-small-only tagline"
                >
                  {{ $t('app.subtitle') }}
                </h2>
                <h2
                  v-if="!i18nEnabled"
                  class="h6 hide-for-small-only tagline"
                >
                  {{ $config.app.subtitle }}
                </h2>

              </a>
              <!-- </router-link> -->
            </section>
          </div>

          <div class="cell large-auto hide-for-small-only text-center">

            <combo-search
              :dropdown="comboSearchDropdownData"
              :position="comboSearchPosition"
              :placeholderText="comboSearchPlaceholderText"
              :search-string="searchString"
              :dropdown-selected="dropdownSelected"
              :input-id="'input1'"
              :select-id="'select1'"
              @trigger-combo-search="comboSearchTriggered"
              @trigger-clear-search="clearSearchTriggered"
              @trigger-search-category-change="comboSearchCategoryChange"
            />

            <div class="search">
              <slot name="search" />
            </div>
          </div>

        </div>

      </div>

      <div
        v-if="i18nEnabled"
        class="cell mobile-menu show-for-small-only small-2"
      >
        <font-awesome-icon
          v-show="!i18nListIsOpen"
          icon="globe"
          size="2x"
          :style="{ color: 'white' }"
          @click="togglei18nMenu"
        />
        <font-awesome-icon
          v-show="i18nListIsOpen"
          icon="times"
          size="2x"
          :style="{ color: 'white' }"
          @click="togglei18nMenu"
        />
      </div>


      <div class="cell show-for-small-only text-center">

        <combo-search
          :dropdown="comboSearchDropdownData"
          :position="comboSearchPosition"
          :placeholderText="comboSearchPlaceholderText"
          :search-string="searchString"
          :dropdown-selected="dropdownSelected"
          :input-id="'input2'"
          :select-id="'select2'"
          @trigger-combo-search="comboSearchTriggered"
          @trigger-clear-search="clearSearchTriggered"
          @trigger-search-category-change="comboSearchCategoryChange"
        />

        <div class="search">
          <slot name="search" />
        </div>
      </div>

    </div> <!-- end of main grid-x -->

    <i18nBanner
      v-if="this.$config.i18n && this.$config.i18n.enabled"
      slot="i18n-banner"
      class="hide-for-small-only"
    />

    <slot name="alert-banner" />

    <!-- <div
      v-show="!isOpen"
      class="stripe"
    />
    <div
      class="white-stripe"
    /> -->

    <div
      v-show="footerListIsOpen"
      class="mobile-menu-content-container show-for-small-only"
    >
      <div class="mobile-menu-content">
        <a
          v-if="shouldShowLogo"
          :href="appLogoLink"
          class="logo flex-child-auto"
        >
          <img
            :src="appLogo"
            :alt="appLogoAlt"
            class="app-logo"
          >
        </a>
        <slot name="mobile-menu" />
      </div>
    </div>

    <div
      v-show="i18nListIsOpen"
      class="mobile-menu-content-container show-for-small-only"
    >
      <i18nBanner
        v-if="this.$config.i18n && this.$config.i18n.enabled"
        @language-selected="togglei18nMenu"
      />
    </div>


    <slot name="after-stripe" />
  </header>
</template>

<script>
// TODO: move logo, link etc to app config.
import Logo from '../assets/city-of-philadelphia-logo.png';
// import AddressInput from '@phila/vue-comps/src/components/AddressInput.vue'
// import Paragraph from '@phila/vue-comps/src/components/Paragraph.vue'
// import '@phila/vue-comps'
import i18nBanner from './i18nBanner.vue';
import PhilaButton from './PhilaButton.vue';

export default {
  components: {
    i18nBanner,
    PhilaButton,
    ComboSearch: () => import(/* webpackChunkName: "pvc_ComboSearch" */'@phila/vue-comps/src/components/ComboSearch.vue'),
    AddressInput: () => import(/* webpackChunkName: "pvc_AddressInput" */'@phila/vue-comps/src/components/AddressInput.vue'),
  },
  props: {
    appLink: {
      type: String,
      default: '/',
    },
    appLogo: {
      type: String,
      default: Logo,
    },
    appLogoAlt: {
      type: String,
      default: 'City of Philadelphia',
    },
    appLogoLink: {
      type: String,
      default: 'https://www.phila.gov',
    },
    appTagLine: {
      type: String,
      default: 'App Tag Line',
    },
    appTitle: {
      type: String,
      default: 'App Title',
    },
  },
  data() {
    return {
      dropdownOptions: {
        address: {
          text: 'Address',
          data: null,
        },
        keyword: {
          text: 'Keyword',
          data: null,
        },
      },
      searchString: '',
      dropdownSelected: '',
      footerListIsOpen: false,
      i18nListIsOpen: false,
    };
  },
  computed: {
    headerButton() {
      let value;
      if (this.$config.header && this.$config.header.button && this.$config.header.button.enabled === true) {
        value = this.$config.header.button;
      }
      return value;
    },
    shouldShowBetaTag() {
      let value = true;
      if (this.$config.header && this.$config.header.beta === false) {
        value = false;
      }
      return value;
    },
    shouldShowLogo() {
      let value = true;
      // console.log('shouldShowLogo computed, this.$config.header:', this.$config.header);
      if (this.$config.header && this.$config.header.logo === false) {
        value = false;
      }
      return value;
    },
    i18nEnabled() {
      if (this.$config.i18n && this.$config.i18n.enabled) {
        return true;
      } else {
        return false;
      }
    },
    i18nLocale() {
      return this.$i18n.locale;
    },
    comboSearchDropdownData() {
      let dropdownData = {};
      if (!this.$config.comboSearch) {
        dropdownData = this.$data.dropdownOptions;
      } else if (!this.$config.comboSearch.dropdown) {
        dropdownData = this.$data.dropdownOptions;
      } else {
        for (let dropdownItem of this.$config.comboSearch.dropdown) {
          dropdownData[dropdownItem] = this.$data.dropdownOptions[dropdownItem];
        }
      }
      console.log('dropdownData:', dropdownData);
      return dropdownData;
    },
    comboSearchPosition() {
      if (this.$config.comboSearch && this.$config.comboSearch.position) {
        return this.$config.comboSearch.position;
      } else {
        return 'left';
      }
    },
    comboSearchPlaceholderText() {
      if (this.i18nEnabled) {
        return this.$i18n.messages[this.i18nLocale].app.searchPlaceholder;
      } else if (this.$config.comboSearch && this.$config.comboSearch.placeholderText) {
        return this.$config.comboSearch.placeholderText;
      } else {
        return 'Search';
      }
    },
    address() {
      let value;
      if (this.$store.state.geocode.data) {
        if (this.$store.state.geocode.data.properties) {
          value = this.$store.state.geocode.data.properties.street_address;
        }
      } else {
        value = '';
      }
      return value;
    },
    keywords() {
      return this.$store.state.selectedKeywords;
    },
    searchType() {
      return this.$store.state.searchType;
    },
  },
  watch: {
    address(nextAddress) {
      this.comboSearchDropdownData.address.data = nextAddress;
    },
    keywords(nextKeywords) {
      if (this.comboSearchDropdownData.keyword) {
        this.comboSearchDropdownData.keyword.data = nextKeywords;
      }
    },
  },
  created() {
    Object.keys(this.comboSearchDropdownData).forEach(item => {
      if (this.$route.query[item]) {
        // console.log('philaHeader created item:', item)
        this.searchString = this.$route.query[item];
        this.comboSearchDropdownData[item].selected = true;
        this.$store.commit('setSearchType', item);
      }
    });
  },
  methods: {
    // handleSearchFormSubmit(value) {
    //   this.$controller.handleSearchFormSubmit(value);
    // },
    comboSearchTriggered(query) {
      this.$router.push({ query: { ...this.$route.query, ...query }});

      this.searchString = query[this.searchType];
      console.log('comboSearchTriggered is running, query:', query, 'this.searchType:', this.searchType, 'query[this.searchType]:', query[this.searchType]);
      const searchCategory = Object.keys(query)[0];
      const value = query[searchCategory];

      this.$gtag.event(this.searchType + '-search', {
        'event_category': this.$store.state.gtag.category,
        'event_label': value,
      });

      // console.log('in comboSearchTriggered, value:', value, 'query:', query, 'this.searchType:', this.searchType, '{...this.$route.query}:', { ...this.$route.query }, '{...query}:', { ...query });
      this.$controller.handleSearchFormSubmit(value, searchCategory);
    },
    clearSearchTriggered() {
      // console.log('in clearSearchTriggered, this.$route.query:', this.$route.query);
      let startQuery = { ...this.$route.query };
      delete startQuery[this.searchType];
      this.$router.push({ query: startQuery });
      this.searchString = '';
      this.$store.commit('setSelectedKeywords', []);
      this.$controller.resetGeocode();
    },
    comboSearchCategoryChange(value) {
      // console.log('comboSearchCategoryChange is running, value:', value);
      this.$store.commit('setSelectedKeywords', []);
      this.$store.commit('setSearchType', value);
      let startQuery = { ...this.$route.query };
      let overlap = this.compareArrays(Object.keys(startQuery), Object.keys(this.comboSearchDropdownData));
      if (overlap.length) {
        for (let item of overlap) {
          delete startQuery[item];
        }
        this.$router.push({ query: startQuery });
      }
      this.searchString = '';
      this.$controller.resetGeocode();
    },
    compareArrays(arr1, arr2) {
      const finalArray = [];
      arr1.forEach((e1) => arr2.forEach((e2) => {
        if (e1 === e2) {
          finalArray.push(e1);
        }
      },
      ));
      return finalArray;
    },
    toggleFooterMenu() {
      this.footerListIsOpen = !this.footerListIsOpen;
      this.toggleBodyClass('no-scroll');
    },
    togglei18nMenu() {
      console.log('togglei18nMenu is running');
      this.i18nListIsOpen = !this.i18nListIsOpen;
      this.toggleBodyClass('no-scroll');
    },
    // TODO: make generic toggle class
    toggleBodyClass(className) {
      const el = document.body;
      return this.footerListIsOpen || this.i18nListIsOpen ? el.classList.add(className) : el.classList.remove(className);
    },
  },
};
</script>

<style lang="scss">

.inline-block-class {
  display: inline-block;
}

.app-header{
  width: 100%;
  vertical-align: middle;
  background: color(dark-ben-franklin);

  @media screen and (max-width: 749px) {
    // position: fixed;
    top:0;
    z-index: 1020;

    .text-centered {
      margin: 0 auto;
    }

    .no-margins {
      margin: 0px;
    }
  }


  .app-logo{
    height: 45px;
  }
  .logo{
    opacity: 1;
    transition: opacity .25s ease-in-out;
    &:hover {
      opacity: .6;
    }
  }

  .title-container{
    display: inline-flex;
    word-break: break-word;

    h1, h2{
      padding:0;
    }
    a {
      color: white;
      font-weight: normal;
      text-decoration: none;
    }

    .title {
      display: inline-block;
    }

    // .tagline{
    //   display: inline-block;
    // }

    #demo-badge{
      /*text-transform: capitalize;*/
      display: inline-block;
      font-size: 12px;
      font-family: Arial, Helvetica, sans-serif;
      font-weight: 800;
      vertical-align: middle;
      margin-left: 8px;
      margin-bottom: 5px;
      padding: 1px;
      padding-left: 6px;
      padding-right: 6px;
      border-radius: 1px;
      color: black;
      background: #FF8D00;
    }

  }
  .app-title{
    opacity: 1;
    transition: opacity .25s ease-in-out;
    &:hover {
      opacity: .6;
    }
  }
  .title{
    @media screen and (max-width: 20rem) {
      max-width: 20rem;
    }

    line-height: 2rem;
  }
}

.mobile-menu-content-container{
  margin-top:1rem;
  overflow: hidden;
  color: white;
  z-index: 100;
  background: color(dark-ben-franklin);
  height: 100vh;
  width:100%;

  .mobile-menu-content{
    text-align: center;
  }
}

.app-divide{
  display: inline-block;
  min-height:4rem;
  vertical-align: middle;
  margin-bottom: 1rem;

  @media screen and (min-width: 40em) {
    border-left:1px solid white;
  }
}
.stripe {
  min-height: 5px;
  background: color(electric-blue);
}
.white-stripe{
  min-height: 5px;
  background: white;
}

.no-underline {
  text-decoration: none;
}

</style>
