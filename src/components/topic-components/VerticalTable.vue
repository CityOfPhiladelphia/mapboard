<template>
  <div>
    <h4 v-if="slots.title">{{ evaluateSlot(slots.title) }}</h4>
    <table>
      <tbody>
        <tr v-for="field in slots.fields">
          <th v-html="evaluateSlot(field.label)" />
          <td v-html="evaluateSlot(field.value, field.transforms, nullValue)" />
        </tr>
      </tbody>
    </table>
    <a v-if="options && options.externalLink"
       :href="externalLinkHref"
       class="external"
       target="_blank"
    >
      {{ externalLinkText }}
    </a>
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent';

  export default {
    mixins: [TopicComponent],
    computed: {
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
  th, td {
    font-size: 15px;
    text-align: left;
  }
</style>
