<template>
  <vs-navbar primary>
    <template #left>
      <vs-avatar v-if="tabFaviconUrl" size="30">
        <img :src="tabFaviconUrl" :alt="tabName" />
      </vs-avatar>
      <h2 class="title">{{ tabName }}</h2>
    </template>
    <template #right>
        <config-button />
    </template>
  </vs-navbar>
</template>

<script>
import ConfigButton from './ConfigButton.vue';

export default {
  name: 'appbar',
  components: { ConfigButton },
  props: ['tabName', 'tabFaviconUrl'],
};
</script>

<style scoped>
  .title {
    margin: 0 8px;
    font-size: 18px;
  }

  img {
    width: 25px;
    height: auto;
    object-fit: scale-down;
  }
</style>
