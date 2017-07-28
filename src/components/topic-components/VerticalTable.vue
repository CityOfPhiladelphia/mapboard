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
  </div>
</template>

<script>
  import TopicComponent from './TopicComponent';

  export default {
    mixins: [TopicComponent]
  };
</script>

<style scoped>
  th, td {
    font-size: 15px;
    text-align: left;
  }
</style>
