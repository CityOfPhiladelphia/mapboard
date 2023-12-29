<template>
  <a
    v-if="link.type === 'native'"
    v-bind="link.attrs || {}"
    :href="link.href"
    :class="{ 'is-active': link.active }"
    @click="callFunc"
  >
    {{ link.text }}
  </a>
  <router-link
    v-else
    v-slot="{ href, navigate, isExactActive }"
    :to="{ name: link.href }"
  >
    <a
      :href="href"
      v-bind="link.attrs || {}"
      :class="{ 'is-active': isExactActive }"
      @click="navigate"
    >
      {{ link.text }}
    </a>
  </router-link>
</template>

<script>
/**
 * A helper component that creates router-links and links. It assumes all links are a ``router-link`` (most common), but a non-router link can also be used.
 * @niceName Navigation Link
 * @group Other
 * @position 305
 * @noExport
 */
export default {
  name: "NavLink",
  props: {
    /**
     * A link Object. See more in [Code Samples](#code-samples)
     */
    link: {
      type: Object,
      default () {
        return {};
      },
    },
  },
  methods: {
    callFunc () {
      if (this.link.click && typeof this.link.click === 'function') {
        this.link['click']();
      }
    },
  },
};
</script>