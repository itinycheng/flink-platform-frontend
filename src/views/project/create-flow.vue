<template>
  <div id="container">dfsf</div>
</template>

<script>
import '@antv/x6-vue-shape'

export default {
  name: 'SDashboard',
  computed: {}
}

const graph = new Graph({
  container: document.getElementById('app'),
  width: 800,
  height: 600
})
console.log(graph)

</script>
