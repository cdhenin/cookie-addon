import Vue from 'vue';
import sumBy from 'lodash/sumBy';
import { getCurrentTab } from '../helpers/tabs';
import { updateBadgeValue } from '../helpers/browserActions';

export const DEFAULT_PURPOSE = 'analytics';

const SET_DETECTED_SCRIPTS = 'setDetectedScripts';

const getCountOfBlockedScripts = (scripts) => {
  const blocked = scripts.filter(({ isBlocked }) => isBlocked);
  return sumBy(blocked, ({ count }) => (count || 1));
};

export const counterPlugin = (store) => {
  store.subscribe(async ({ type, payload: { tabId } }, state) => {
    if (type !== SET_DETECTED_SCRIPTS) { return; }
    const { id: currentTabId } = await getCurrentTab();
    if (tabId !== currentTabId) { return; }
    updateBadgeValue(tabId, getCountOfBlockedScripts(state.detection[tabId] || []));
  });
};

export default {
  state: () => ({}),
  mutations: {
    [SET_DETECTED_SCRIPTS](state, { scripts, tabId }) {
      Vue.set(state, tabId, scripts);
    },
  },
  actions: {
    addDetectedScript({ state, commit }, { script, tabId }) {
      const { mainPurpose, mainDomain } = script;
      const currentTabState = state[tabId] || [];

      const alreadyDetectedIndex = currentTabState.findIndex(
        (item) => item.mainDomain === mainDomain,
      );

      const newDetected = [];

      // Group scripts detected by mainDomain
      if (alreadyDetectedIndex > -1) {
        const {
          mainPurpose: currentMainPurpose,
          count: currentCount = 1,
        } = currentTabState[alreadyDetectedIndex];
        // If the previous script detected has no known category but this one have one
        // we replace the category associated to the script
        if (mainPurpose !== DEFAULT_PURPOSE && currentMainPurpose === DEFAULT_PURPOSE) {
          currentTabState[alreadyDetectedIndex].mainPurpose = mainPurpose;
        }

        // The detected script doesn't bring any new information about the app
        currentTabState[alreadyDetectedIndex].count = currentCount + 1;
      } else {
        newDetected.push(script);
      }
      const newState = [...currentTabState, ...newDetected];
      return commit(SET_DETECTED_SCRIPTS, { tabId, scripts: newState });
    },
    clearDetectedScriptsForTab({ commit }, tabId) {
      return commit(SET_DETECTED_SCRIPTS, { tabId, scripts: [] });
    },
  },
  getters: {
    getDetectedScriptsForCurrentTab: (state, _, rootState) => (
      state[rootState.currentTabId] || []
    ),
    getCountOfBlockedScriptsForTab: (state) => (
      (tabId) => getCountOfBlockedScripts(state[tabId] || [])
    ),
    getCountOfBlockedScriptsCurrentForTab: (_, getters) => (
      getCountOfBlockedScripts(getters.getDetectedScriptsForCurrentTab)
    ),
  },
};
