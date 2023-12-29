<template>
  <dropdown-nav
    v-if="ready"
    id="lang-selector"
  >
    <button>
      <span class="icon"><i
        title="Language Selector"
        class="fa fa-globe"
      /></span>
      <span>{{ selectedLang }}</span>
    </button>
    <ul role="menu">
      <li
        v-for="(lang, i) in languages"
        :key="`languages${i}`"
        role="none"
      >
        <a
          href="#"
          role="menuitem"
          @click.prevent="changeLang(lang.language)"
        >{{ lang.title }}</a>
      </li>
    </ul>
  </dropdown-nav>
</template>

<script>
// import DropdownNav from '@/components/DropdownNav/DropdownNav.vue';
import DropdownNav from './DropdownNav.vue';

/**
 * A language dropdopwn navigation.  Primarily used as a slot of the [Application Header](/components/AppHeader). <alert type="warning">Requires the third-party component [vue-i18n](https://kazupon.github.io/vue-i18n/) which is not included. See #[dependencies](#dependencies).</alert>
 * @niceName Language Selector
 * @group Navigation
 * @position 130
 */
export default {
  name: 'LangSelector',
  components: {
    DropdownNav,
  },
  props: {
    /**
    * An array of language objects
    */
    languages: {
      type: Array,
      validator: function (languages) {
        const isValid = languages.every(language => language.language && language.title);
        if (!isValid) {
          console.error(`The languages array must contain one or more objects with with
          "language" and "title" keys`);
        }
        return isValid;
      },
      default() {
        return [
          {
            language: "en-US",
            title: "English",
          },
        ];
      },
    },
  },
  data() {
    return { ready: false };
  },
  computed : {
    selectedLang() {
      return this.languages.find(lang => lang.language === this.$i18n.locale).title;
    },
  },
  created() {
    if(this.$i18n) {
      this.ready = true;
    } else {
      console.error("You must import i18n globally for LangSelector");
    }
  },
  methods: {
    changeLang(lang) {
      this.$i18n.locale = lang;
      localStorage.setItem('lang', lang);
    },
  },
};
</script>

<style lang="scss" scoped>
  // @include until ($tablet) {
  //   #lang-selector {
  //     width: 50px;
  //     text-align: center;
  //     button {
  //       width: 100%;
  //       text-align: center;
  //       padding: 0.6rem;
  //     };
  //   }
  // }
</style>
