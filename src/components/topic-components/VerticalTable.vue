<template>
  <div>
    <h4>{{ evaluateSlot(slots.title) }}</h4>
    <table>
      <tbody>
        <tr v-for="field in slots.fields">
          <th>{{ evaluateSlot(field.label) }}</th>
          <td>{{ evaluateSlot(field.value) }}</td>
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
