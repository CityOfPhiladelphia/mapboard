<template>
<div id="app">
  <img src="./assets/logo.png">
  <h1>I'm embedded!</h1>
  <h2>{{ msg }}</h2>
</div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<style>
.mb-root {
  height: 500px;
}

.mb-panel {
  height: 100%;
}

.mb-panel-topics {
    background: #fff;
    padding-left: 12px !important;
    padding-right: 12px !important;
    overflow: auto;
}

.mb-topic-body {
  padding: 10px;
  margin-bottom: 10px;
}

a.mb-topic-header {
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

a.mb-topic-header:hover {
  background: #fff;
  color: inherit;
}
</style>
