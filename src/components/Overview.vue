<template>
  <div class="center main">
    <vs-row class="section">
      <vs-row align="center">
        <vs-col vs-type="flex" vs-justify="center" vs-align="center" w="2">
          <p class="emoji">{{ contentStyles.emoji }}</p>
        </vs-col>
        <vs-col vs-type="flex" vs-justify="center" vs-align="center" w="10">
          <p>
            {{ contentStyles.text }}
          </p>
        </vs-col>
      </vs-row>
      <vs-row class="switch-container" justify="space-between" align="center">
        <vs-button transparent @click="toggleDisplayWhatIsIt">
          {{ translate('overview_see_styles')}}
        </vs-button>
        <vs-switch v-model="allowedStylesDomainsModel" :val="currentHostname">
          <template #off> {{ translate('overview_disallow_styles')}} </template>
          <template #on> {{ translate('overview_allow_styles')}} </template>
        </vs-switch>
        <vs-row v-if="displayWhatIsIt">
          <p class="description">{{ translate('overview_whatIsIt_styles') }}</p>
        </vs-row>
      </vs-row>
    </vs-row>
    <vs-row class="section">
      <vs-row align="center">
        <vs-col vs-type="flex" vs-justify="center" vs-align="center" w="2">
          <p class="emoji">{{ contentScripts.emoji }}</p>
        </vs-col>
        <vs-col vs-type="flex" vs-justify="center" vs-align="center" w="10">
          <p>{{ contentScripts.text }}</p>
        </vs-col>
      </vs-row>
      <vs-row class="switch-container" justify="space-between" align="center">
        <vs-button
          :disabled="getDetectedScriptsForCurrentTab.length === 0"
          transparent
          @click="toggleDisplayScripts"
        >
          {{ translate('overview_see_scripts')}}
          <div>
            <i :class="`bx bx-${displayScripts ? 'up' : 'down'}-arrow-alt`"></i>
          </div>
        </vs-button>
        <vs-switch v-model="allowedScriptsDomainsModel" :val="currentHostname">
          <template #off> {{ translate('overview_disallow_scripts')}}  </template>
          <template #on> {{ translate('overview_allow_scripts')}}  </template>
        </vs-switch>
      </vs-row>
      <vs-row v-if="displayScripts">
        <vs-col
          v-for="script in getDetectedScriptsForCurrentTab"
          :key="script.id"
          vs-type="flex"
          vs-justify="center"
          vs-align="center"
          w="12"
        >
          <script-item :script="script" />
        </vs-col>
      </vs-row>
    </vs-row>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { SET_SCRIPTS, SET_STYLES } from '../store/domains';
import { reloadTabNoCache } from '../helpers/tabs';
import translate from '../helpers/translate';
import ScriptItem from './ScriptItem.vue';

export default {
  components: { ScriptItem },
  name: 'overview',
  props: ['currentHostname'],
  data() {
    return {
      displayScripts: false,
      displayWhatIsIt: false,
      notification: null,
      cssInjected: true,
    };
  },
  mounted() {
    this.cssInjected = !this.allowedStylesForDomain;
  },
  computed: {
    ...mapGetters([
      'getDetectedScriptsForCurrentTab',
      'getCountOfBlockedScriptsCurrentForTab',
      'allowedScriptsDomains',
      'allowedStylesDomains',
    ]),
    allowedStylesForDomain() {
      return this.allowedStylesDomains.indexOf(this.currentHostname) > -1;
    },
    isNotificationDisplayed() {
      return this.notification !== null && this.notification.isVisible;
    },
    contentScripts() {
      if (this.getDetectedScriptsForCurrentTab.length === 0) {
        return {
          emoji: '🥳',
          text: translate('overview_no_script'),
        };
      }
      if (this.getCountOfBlockedScriptsCurrentForTab > 0) {
        return {
          emoji: '👩‍✈',
          text: translate('overview_scripts_blocked'),
        };
      }
      return {
        emoji: '😬',
        text: translate('overview_scripts_not_blocked'),
      };
    },
    contentStyles() {
      if (!this.cssInjected) {
        return {
          emoji: '😬',
          text: translate('overview_styles_not_hidden'),
        };
      }
      return {
        emoji: '👩‍🎨',
        text: translate('overview_styles_hidden'),
      };
    },
    allowedScriptsDomainsModel: {
      set(newValue) {
        this.applyMutation({ mutation: SET_SCRIPTS, payload: { value: newValue } });
        this.openWarningNotification();
      },
      get() {
        return [...this.allowedScriptsDomains];
      },
    },
    allowedStylesDomainsModel: {
      set(newValue) {
        this.applyMutation({ mutation: SET_STYLES, payload: { value: newValue } });
        this.openWarningNotification();
      },
      get() {
        return [...this.allowedStylesDomains];
      },
    },
  },
  methods: {
    ...mapActions(['applyMutation']),
    translate,
    toggleDisplayScripts() {
      this.displayScripts = !this.displayScripts;
    },
    toggleDisplayWhatIsIt() {
      this.displayWhatIsIt = !this.displayWhatIsIt;
    },
    onClickNotification() {
      reloadTabNoCache();
      this.cssInjected = !this.allowedStylesForDomain;
    },
    openWarningNotification() {
      if (this.isNotificationDisplayed) {
        this.notification.close();
      }
      this.notification = this.$vs.notification({
        duration: 'none',
        title: translate('warning_refresh_title'),
        text: translate('warning_refresh_text'),
        icon: '<i class="bx bx-reset"></i>',
        color: 'primary',
        onClick: this.onClickNotification,
        clickClose: true,
      });
    },
  },
};
</script>

<style scoped>
p {
  font-size: 1rem;
  margin: 0;
}

.description {
  font-size: 0.875rem;
  color: grey;
  padding: 8px;
  white-space: pre-wrap;
}

.main {
  padding: 4px 8px;
}

.section {
  border: 1px solid rgb(185, 185, 185);
  border-radius: 5px;
  padding: 16px 18px 16px 4px;
  margin-bottom: 8px;
}

.emoji {
  font-size: 1.8rem;
  text-align: center;
}

.switch-container {
  margin-top: 8px;
}
</style>
