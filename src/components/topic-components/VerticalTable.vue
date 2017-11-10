<template>
  <div v-if="shouldShowTable" class="table-container">
    <h4 v-if="slots.title"
        class="table-title"
    >
      {{ evaluateSlot(slots.title) }}
    </h4>
    <table>
      <tbody>
        <tr v-for="field in slots.fields">
          <th v-html="evaluateSlot(field.label)" />
          <td v-html="evaluateSlot(field.value, field.transforms, nullValue)" />
        </tr>
      </tbody>
    </table>
    <div class="external-link">
      <a v-if="options && options.externalLink"
         :href="externalLinkHref"
         class="external external-link"
         target="_blank"
      >
        {{ externalLinkText }}
      </a>
    </div>
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent.vue';

  export default {
    mixins: [TopicComponent],
    computed: {
      shouldShowTable() {
        if (this.item) {
          if (this.item.activeTable) {
            const filterValue = this.item.activeTable;
            const id = this.options.id;
            if (filterValue === id) {
              return true
            } else {
              return false;
            }
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
      externalLinkAction() {
        return this.options.externalLink.action || 'See more';
      },
      externalLinkText() {
        const externalLinkConf = this.options.externalLink;
        const actionFn = externalLinkConf.action;
        const actionText = actionFn(this.externalLinkCount);
        const name = externalLinkConf.name;

        return `${actionText} at ${name}`;
      },
      externalLinkHref() {
        return this.evaluateSlot(this.options.externalLink.href);
      },
    }
  };
</script>

<style scoped>
  table {
    margin: 0;
  }

  th, td {
    font-size: 15px;
    text-align: left;
  }

  th {
    width: 30%;
  }

  .external-link {
    padding-top: 5px;
  }

  .table-title {
    /*too much*/
    /*margin-top: 1rem;*/
  }

  .table-container {
    /*this was too much padding for the parcel table, taking out for now*/
    /*padding-top: 1rem;*/
  }
</style>
