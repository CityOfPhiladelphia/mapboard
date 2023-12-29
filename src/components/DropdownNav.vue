<template>
  <div
    class="dropdown-nav"
    :class="{ 'is-active' : isActive }"
    @click="isActive = !isActive"
  >
    <template v-if="nav.links.length > 0">
      <button>
        <span
          v-if="nav.icon"
          class="icon"
        >
          <i class="fas fa-user-circle" />
        </span>
        <span>{{ nav.button }}</span>
      </button>
      
      <ul role="menu">
        <template v-for="(link, index) in nav.links">
          <template v-if="link.type === 'link'">
            <li
              :key="`ddl-${index}`"
              role="none"
            >
              <nav-link
                :link="link"
                role="menuitem"
              />
            </li>
          </template>
          <template v-else>
            <li
              :key="`ddl-${index}`"
              role="none"
            >
              <nav-link
                :link="link"
                role="menuitem"
              />
            </li>
          </template>
        </template>
      </ul>
    </template>
    <template v-else>
      <!-- The default slot takes a ```button``` as the trigger, and an unordered list (```<ul>```) of links as the dropdown items. -->
      <slot />
    </template>
  </div>
</template>

<script>
import NavLink from './NavLink.vue';

/**
 * A dropdown navigation.  Primarily used as a slot of the [Application Header](/components/AppHeader).
 * @niceName Dropdown Navigation
 * @group Navigation
 * @position 125
 */
export default {
  name: 'DropdownNav',
  components: {
    NavLink,
  },
  props: {
    /**
     * An Object which includes the button (trigger), a FontAwesome icon (optional), and the list of links. See [Navigation Link](/components/NavLink)
     */
    nav: {
      type: Object,
      default () {
        return {
          button: 'My Items',
          icon: null,
          links: [],
        };
      },
    },
  },
  data () {
    return {
      isActive: false,
    };
  },
  mounted () {
    this.addDropdownArrow();
  },
  methods: {
    addDropdownArrow () {
      const dropdowns = document.querySelectorAll('.dropdown-nav');
      if (dropdowns) {
        dropdowns.forEach(dropdown => {
          const btn = dropdown.querySelector('button');
          btn.classList.add('navbar-link');
          if (this.isMobile) {
            btn.classList.add('is-arrowless');
          }
        });
      }
    },
  },
};
</script>

<style lang="scss">
  @import "../scss/variables.scss";

  // .dropdown-nav button.navbar-link:after {
  //   // border-color: white;
  //   // right: 1rem;
  //   // margin-top: -0.5rem;
  //   content: "\f107";
  //   font-family: "Font Awesome 5 Pro";
  //   font-weight: 400;
  //   // display: inline-block;
  //   font-size: 1.3rem;
  //   margin-left: 1rem;
  //   // margin-left: 0.25rem;
  //   // margin-top: 2rem;
  // }

  .dropdown-nav {
    text-align: right;
    position: relative;
    &.is-active {
      background-color: #2176d2 ;
      ul {
        display: block;
      }
    }
    button {
      cursor: pointer;
      background-color: transparent;
      display: inline-block;
      color: white;
      // font-size: 0.875rem;
      font-weight: normal;
      padding: 0.5rem 2.3rem 0.5rem 0.75rem;
      border: 0;
      transition: background-color, 0.25s ease-in-out;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      // @include until ($tablet) {
      @media screen and (max-width: 46.875em) {
        font-size: 1.75rem;
      }
      &:hover {
        background-color: #2176d2;
        color: $white;
      }
      @media screen and (min-width: 46.875em) {
        &.navbar-link {
          // padding-top: .5rem;
          text-align: left;
          &:after {
            border-color: $white;
            right: 1rem;
            // margin-top: -0.5rem;
            content: "\f107";
            font-family: "Font Awesome 5 Pro";
            font-weight: 400;
            // display: inline-block;
            font-size: 1.5rem;
            margin-left: .5rem;
            padding-top: 1rem;
          }
          .icon {
            padding-right: 0.4rem;
            vertical-align: middle;
            font-size: 1.4rem;
            // @include until ($tablet) {
            @media screen and (max-width: 46.875em) {
              font-size: 1.75rem;
            }
          }
        }  
      }
      &.navbar-link {
        padding-top: 9px;
        text-align: left;
        &:after {
          border-color: $white;
          right: 1rem;
          // padding-top: 1rem;
          // margin-top: -0.5rem;
          // content: "\f107";
          // font-family: "Font Awesome 5 Pro";
          // font-weight: 400;
          // // display: inline-block;
          // font-size: 1.3rem;
          // margin-left: 1rem;
        }
        .icon {
          padding-right: 0.4rem;
          vertical-align: middle;
          font-size: 1.4rem;
          // @include until ($tablet) {
          @media screen and (max-width: 46.875em) {
            font-size: 1.75rem;
          }
        }
      }
      @media screen and (max-width: 46.875em) {
      // @include until (768px) {
        padding: 0.5rem;
        &.navbar-link {
          line-height: 0;
          span {
            display: none;
          }
          span.icon {
            text-align: center;
            display: inline;
            padding: 0;
            width: 29px;
            height: 29px;
          }
        }
      }
    }
    ul {
      font-weight: normal;
      list-style-type: none;
      display: none;
      position: absolute;
      right: 0;
      background-color: #2176d2;
      z-index: 999;
      min-width: 100%;
      width: auto;
      li {
        float: right;
        width: 100%;
        border-bottom: 1px solid #96c9ff;
        a {
          text-align: center;
          font-weight: normal;
          padding: 0.75rem 2rem;
          color: $white;
          line-height: 1.1;
          width: 100%;
          display: block;
          &:hover {
            background-color: #96c9ff;
            color: #444444;
          }
        }
      }
    }
  }
</style>
