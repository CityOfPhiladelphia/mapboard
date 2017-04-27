<template>
  <table>
    <tbody>
      <tr v-for="field in this.fields">
        <th>{{ field.label }}</th>
        <td>{{ field.value }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
  export default {
    props: ['slots'],
    computed: {
      fields() {
        return this.$props.slots.fields;
      }
    },
  };
</script>

<style scoped>
  th, td {
    font-size: 15px;
    text-align: left;
  }
</style>
