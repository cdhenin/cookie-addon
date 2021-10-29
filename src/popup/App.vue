<template>
  <home />
</template>

<script>
import Home from '@/components/Home.vue';

export default {
  name: 'App',
  components: { Home },
};
</script>

<style>
html {
  font-family: Ubuntu, Arial, sans-serif;
}

html, body {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

body {
  margin: 0;
  height: 400px;
  width: 400px;
}
</style>
