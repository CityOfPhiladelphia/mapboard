<template>
  <div class="mb-search-control-container">
    <form @submit.prevent="handleSearchFormSubmit"
          autocomplete="off"
          id="search-form"
          class="mb-search-control-form"
    >
      <!-- <div class="form-group"> -->
        <input :class="this.inputClass"
               placeholder="Search the map"
               :value="this.addressEntered"
               tabindex="0"
        />
        <!-- @keyup="didType" -->
      <!-- </div> -->
    </form>
    <!-- <button class="mb-search-clear-button"
            v-if="this.addressEntered != '' && this.addressEntered != null"
            @click="handleFormX"
    >
      <i class="fa fa-times fa-lg"></i>
    </button> -->
    <button class="mb-search-control-button"
            name="mb-search-control-button"
            tabindex="-1"
            @click="this.handleSearchFormSubmit"
    >
      <i class="fa fa-search fa-lg"></i>
    </button>
  </div>
</template>

<script>
  import * as L from 'leaflet';
  import debounce from 'debounce';

  export default {
    props: ['position'],
    computed: {
      map() {
        return this.$store.state.map.map;
      },
      addressEntered() {
        return this.$store.state.map.addressEntered;
      },
      inputClass() {
        return 'mb-search-control-input';
        // if (this.addressEntered === '' || this.addressEntered === null) {
        //   return 'mb-search-control-input';
        // } else {
        //   return 'mb-search-control-input-full';
        // }
      },
    },
    methods: {
      createLeafletElement(L) {
        // console.log('AddressInput.vue createLeafletElement is running')
        // subclass Control to accept an el which gets mounted to the map
        class ControlParent extends L.Control {
          constructor(el, options) {
            super(options);
            this.el = el;
          }
          onAdd() {
            const el = this.el;

            // keep clicks from hitting the map
            L.DomEvent.disableClickPropagation(el);
            L.DomEvent.disableScrollPropagation(el);

            return el;
          }
        }

        const el = this.$el;
        return new ControlParent(el, {
          position: this.position
        });
      },
      parentMounted(parent, props) {
        // console.log('AddressInput.vue parentMounted is running, parent:', parent, 'props:', props);
        const leafletElement = this.createLeafletElement(L);
        this.$leafletElement = leafletElement;
        const map = this.map;
        leafletElement.addTo(map);
      },
      // didType: debounce(function (e) {
      //     console.log('debounce is running, e:', e, 'this:', this);
      //     if (e.key === "ArrowDown") {
      //       document.getElementById('address-candidate-list-0').focus();
      //       return;
      //     }
      //     const { value } = e.target;
      //     this.getCandidates(value);
      //     this.$store.commit('setAddressEntered', value);
      //     if (e.key !== "Enter") {
      //       this.$store.commit('setShouldShowAddressCandidateList', true);
      //     }
      //   }, 300
      // ),
      getCandidates(address) {
        // console.log('getCandidates is running, address:', address);
        axios.get('https://cqvfg1pm72.execute-api.us-east-1.amazonaws.com/dev/first-api-test/', {
          params: {
            address,
          },
        })
          .then(this.didGetCandidates)
          .catch(this.didGetCandidatesError);
      },
      didGetCandidates(res) {
        const { matches } = res.data;
        // console.log('matches:', matches, 'matches map:', matches.map(x => x.address));
        const matchesArray = matches.map(x => x.address);
        this.$store.commit('setCandidates', matchesArray);
      },
      didGetCandidatesError(err) {
        console.log('error getting candidates', err);
        this.$store.commit('setCandidates', []);
      },
      handleFormX() {
        this.$store.commit('setAddressEntered', '');
      },
      handleSearchFormSubmit(e) {
        const value = e.target[0].value;
        // const value = this.addressEntered;
        this.$controller.handleSearchFormSubmit(value);
        this.$store.commit('setAddressEntered', value);
        // this.$store.commit('setShouldShowAddressCandidateList', false);
      },
    }
  };
</script>

<style scoped>

.mb-search-control-container {
  height: 48px;
  border-radius: 2px;
  box-shadow:0 2px 4px rgba(0,0,0,0.2),0 -1px 0px rgba(0,0,0,0.02);
}

.mb-search-control-form {
  display: inline-block;
}

.mb-search-clear-button {
  display: inline-block;
  color: #fff;
  width: 50px;
  background: #2176d2;
  line-height: 48px;
  padding: 0px;
}

.mb-search-control-button {
  display: inline-block;
  color: #fff;
  width: 50px;
  background: #2176d2;
  line-height: 48px;
  padding: 0px;
}

.mb-search-control-input {
  display: inline-block;
  border: 0;
  padding: 15px;
  font-family: 'Montserrat', 'Tahoma', sans-serif;
  font-size: 16px;
  width: 300px;
}

.mb-search-control-input-full {
  border: 0;
  padding: 15px;
  font-family: 'Montserrat', 'Tahoma', sans-serif;
  font-size: 16px;
  width: 247px;
}

/*small*/
@media screen and (max-width: 39.9375em) {
  .mb-search-control-input {
    width: 200px;
  }

  .mb-search-control-input-full {
    width: 147px;
  }

}

</style>
