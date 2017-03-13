<template>
  <div>
    <a href="#" class="topic-header">{{ topic.label }}</a>
    <div class="topic">
      <div class="topic-comp" v-for="topicComp in topic.components">
        I'm a {{ topicComp.type }}.
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['topic']
  };
</script>

<style scoped>
  .topic-header {
    background: #f5f5f5;
    border: 1px solid #ddd;
    display: block;
    font-size: 18px;
    font-weight: normal;
    height: 70px;
    line-height: 45px;
    padding: 10px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    margin-bottom: 8px;
  }

  .topic-header:hover {
    background: #fff;
    color: inherit;
  }

  .topic {
    padding: 10px;
    margin-bottom: 10px;
  }
</style>
