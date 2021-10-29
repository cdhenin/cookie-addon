<template>
  <div class="center">
      <Appbar :tabFaviconUrl="tabInfos.favIconUrl" :tabName="tabInfos.name"/>
      <div class="child">
        <Overview :currentHostname="tabInfos.hostname" />
      </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { parse } from 'tldts';
import Vue from 'vue';
import Vuesax from 'vuesax';
import isNil from 'lodash/isNil';

import { getCurrentTab } from '../helpers/tabs';
import { reloadExtension } from '../helpers/runtime';
import translate from '../helpers/translate';

import colors from '../constants/colors';

import 'vuesax/dist/vuesax.css';
import 'boxicons';
import 'boxicons/css/boxicons.min.css';

import Overview from './Overview.vue';
import Appbar from './Appbar.vue';

Vue.use(Vuesax, {
  colors,
});

export default {
  components: { Overview, Appbar },
  name: 'home',
  mounted() {
    this.fetchCurrentTabInfos();
  },
  watch: {
    isErrorWarningDisplayed(value) {
      if (value === true) {
        this.openErrorNotification();
      }
    },
  },
  data() {
    return {
      notification: null,
      tabInfos: {
        id: null,
        hostname: null,
        favIconUrl: null,
        name: null,
      },
    };
  },
  computed: {
    ...mapGetters(['isErrorWarningDisplayed']),
  },
  methods: {
    ...mapActions(['setCurrentTabId']),
    openErrorNotification() {
      if (this.notification) { return; }
      this.notification = this.$vs.notification({
        duration: 'none',
        title: translate('warning_error_title'),
        text: translate('warning_error_text'),
        icon: '<i class="bx bx-error"></i>',
        color: 'danger',
        onClick: reloadExtension,
        clickClose: true,
      });
    },
    fetchCurrentTabInfos() {
      if (this.tabInfos.hostname === null) {
        getCurrentTab().then(({ id, url, favIconUrl }) => {
          const { hostname, domain } = parse(url);
          this.tabInfos = {
            id,
            favIconUrl,
            name: hostname.startsWith('www.')
              ? hostname.replace('www.', '')
              : hostname,
            hostname: isNil(domain) ? false : hostname,
          };
          this.setCurrentTabId(id);
        });
      }
    },
  },
};
</script>

<style scoped>
.child {
  margin-top: 48px;
}
</style>
