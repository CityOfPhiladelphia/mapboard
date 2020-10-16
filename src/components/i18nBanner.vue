<template>
  <div class="banner">
    <!-- <table class="fixed centered no-margin-bottom"> -->
    <table class="fixed centered bottom-padding bottom-margin stack">
      <th
        v-for="(lang, key) in i18nMessages"
        :key="key"
        :class="{ selected: isSelected === key, 'bottom-padding': true, 'light-header' : true }"
        @click="handleTableHeaderClick(key)"
      >
      <!-- :class="key + ' underlined'" -->
        <a
          :class="{selected: isSelected === key, 'underlined': true }"
          :data-language="key"
          target="_blank"
        >
          {{ lang.language }}
        </a>
      </th>
    </table>
  </div>
</template>

<script>

import TopicComponent from '@phila/vue-comps/src/components/TopicComponent.vue';

export default {
  name: 'i18nBanner',
  mixins: [ TopicComponent ],
  data() {
    return {
      isSelected: 'en-US',
    };
  },
  computed: {
    i18nLocale() {
      return this.$i18n.locale;
    },
    i18nMessages() {
      let values = {};
      console.log('i18nMessages computed, this.$i18n.messages:', this.$i18n.messages, 'this.$config.i18n.languages:', this.$config.i18n.languages);
      if (this.$config.i18n.languages) {
        for (let language of this.$config.i18n.languages) {
          values[language] = this.$i18n.messages[language];
        }
      } else {
        values = this.$i18n.messages;
      }
      return values;
    },
    i18nLanguages() {
      let values = [];
      if (this.$config.i18n.languagues) {
        values = this.$config.i18n.languages;
      } else {
        values = Object.keys(this.$i18n.messages);
      }
      return values;
    },
  },
  methods: {
    handleTableHeaderClick(key) {
      // console.log('handleTableHeaderClick is running');

      if (this.$data.isSelected !== key) {
        // this.$gtag.event('language-click', {
        //   'event_category': this.$store.state.gtag.category,
        //   'event_label': key,
        // });
        this.$i18n.locale = key;
        this.$data.isSelected = key;
        this.$emit('language-selected', key);
      }
    },
  },
};

</script>

<style>

.light-header {
  background-color: #ffffff;
}

.banner {
  background-color: #ffffff;
  color: #0f4d90 !important;
  font-size: 16px;
}

.selected {
  background-color: #0f4d90;
  color: #ffffff !important;
}

.no-margin-bottom {
  margin-bottom: 0px;
}

.bottom-padding {
  padding-bottom: 4px !important;
}

.fixed {
  table-layout: fixed;
}

.centered {
  width: 85%;
  margin: 0 auto;
}

.underlined {
  text-decoration: underline;
}

@media screen and (max-width: 749px) {
  .centered {
    width: 100%;
    margin: 0 auto;
  }

  .banner {
    padding-top: 20px;
    padding-bottom: 20px;
  }
}

</style>
