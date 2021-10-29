<template>
  <div>
    <vs-avatar size="30" pointer @click="toggleDisplayDialog">
      <img :src="logoSrc" alt="logo" />
    </vs-avatar>
    <vs-dialog v-model="displayDialog">
      <template #header>
        <vs-row align="center">
          <vs-col vs-type="flex" vs-justify="center" vs-align="center" w="2">
            <vs-avatar size="30">
              <img :src="logoSrc" alt="logo" />
            </vs-avatar>
          </vs-col>
          <vs-col vs-type="flex" vs-justify="center" vs-align="center" w="10">
            <h3>{{ translate("config_title") }}</h3>
          </vs-col>
        </vs-row>
      </template>
      <div class="con-form">
        <vs-row align="center" justify="space-between">
          <p>
            {{
              translate(
                isPluginActivated ? "config_activated" : "config_deactivated"
              )
            }}
          </p>
          <vs-switch v-model="isPluginActivatedModel">
            <template #off> {{ translate("activate") }} </template>
            <template #on> {{ translate("deactivate") }} </template>
          </vs-switch>
        </vs-row>
        <vs-row align="center" justify="space-between">
          <p>{{ translate('restart_plugin_text') }}</p>
         <vs-button transparent @click="reloadExtension">
            {{ translate('restart_plugin_button') }}
          </vs-button>
        </vs-row>
      </div>
    </vs-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { reloadExtension } from '../helpers/runtime';
import translate from '../helpers/translate';

export default {
  name: 'config-button',
  data() {
    return {
      notification: null,
      displayDialog: false,
    };
  },
  watch: {
    isRestartWarningDisplayed(value) {
      if (value === true) {
        this.openWarningNotification();
      }
    },
  },
  computed: {
    ...mapGetters(['isPluginActivated', 'isRestartWarningDisplayed']),
    logoSrc() {
      return this.isPluginActivated ? 'icons/48.png' : 'icons/48-white.png';
    },
    isPluginActivatedModel: {
      set() {
        this.toggleDeactivated();
        this.setWarning('warning');
      },
      get() {
        return this.isPluginActivated;
      },
    },
  },
  methods: {
    translate,
    reloadExtension,
    toggleDisplayDialog() {
      this.displayDialog = !this.displayDialog;
    },
    openWarningNotification() {
      if (this.notification) {
        return;
      }
      this.notification = this.$vs.notification({
        duration: 'none',
        title: translate('warning_restart_title'),
        text: translate('warning_restart_text'),
        icon: '<i class="bx bx-stop"></i>',
        color: 'warn',
        onClick: reloadExtension,
        clickClose: true,
      });
    },
    ...mapActions(['toggleDeactivated', 'setWarning']),
  },
};
</script>

<style scoped>
</style>
