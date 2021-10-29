<template>
    <vs-row vs-type="flex" class="scripts">
        <vs-col w="2" type="flex" justify="center" align="center">
            <vs-avatar :color="color" size="25">
                <i :class="`bx bx-xs ${icon}`"></i>
                <template v-if="script.count" #badge>
                {{ script.count }}
                </template>
            </vs-avatar>
        </vs-col>
        <vs-col w="10">
            <div class="bold">{{ script.name }}</div>
            <div class="grey">{{ script.mainDomain }}</div>
        </vs-col>
    </vs-row>
</template>

<script>
import translate from '../helpers/translate';

export default {
  name: 'scriptItem',
  props: ['script'],
  methods: {
    translate,
  },
  computed: {
    icon() {
      switch (this.script.mainPurpose) {
        case 'analytics': return 'bx-stats';
        case 'advertising': return 'bx-cart';
        case 'social_interaction': return 'bxl-facebook-circle';
        default: return 'bx-question-mark';
      }
    },
    color() {
      switch (this.script.mainPurpose) {
        case 'analytics': return 'google-plus';
        case 'advertising': return 'amazon';
        case 'social_interaction': return 'facebook';
        default: return 'background';
      }
    },
  },
};
</script>

<style scoped>
.scripts {
  padding: 4px;
}

.bold {
  font-weight: 600;
}

.grey {
  color: gray;
}
</style>
