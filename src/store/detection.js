import sumBy from 'lodash/sumBy';
import { getCurrentTab } from '../helpers/tabs';
import { updateBadgeValue } from '../helpers/browserActions';

export const DEFAULT_PURPOSE = 'analytics';

const SET_DETECTED_SCRIPTS = 'setDetectedScripts';

export const counterPlugin = (store) => {
  store.subscribe(async ({ type }) => {
    if (type !== SET_DETECTED_SCRIPTS) { return; }
    const { id: tabId } = await getCurrentTab();
    updateBadgeValue(tabId, store.getters.getCountOfBlockedScriptsForTab(tabId));
  });
};

export default {
  state: () => ({
    scripts: [],
  }),
  mutations: {
    [SET_DETECTED_SCRIPTS](state, scripts) {
      state.scripts = scripts;
    },
  },
  actions: {
    addDetectedScript({ state, commit }, script) {
      const { mainPurpose, mainDomain } = script;

      const alreadyDetectedIndex = state.scripts.findIndex(
        (element) => element.mainDomain === mainDomain,
      );
      const currentState = [...state.scripts];
      const newDetected = [];

      // Group scripts detected by mainDomain
      if (alreadyDetectedIndex > -1) {
        const {
          mainPurpose: currentMainPurpose,
          count: currentCount = 1,
        } = currentState[alreadyDetectedIndex];
        // If the previous script detected has no known category but this one have one
        // we replace the category associated to the script
        if (mainPurpose !== DEFAULT_PURPOSE && currentMainPurpose === DEFAULT_PURPOSE) {
          currentState[alreadyDetectedIndex].mainPurpose = mainPurpose;
        }

        // The detected script doesn't bring any new information about the app
        currentState[alreadyDetectedIndex].count = currentCount + 1;
      } else {
        newDetected.push(script);
      }
      const newState = [...currentState, ...newDetected];
      return commit(SET_DETECTED_SCRIPTS, newState);
    },
    clearDetectedScriptsForTab({ state, commit }, tabIdToRemove) {
      const newState = state.scripts.filter(({ tabId }) => tabId !== tabIdToRemove);
      return commit(SET_DETECTED_SCRIPTS, newState);
    },
  },
  getters: {
    getDetectedScriptsForTab: (state) => (id) => state.scripts.filter(({ tabId }) => tabId === id),
    getDetectedScriptsForCurrentTab: (
      _, getters, rootState,
    ) => getters.getDetectedScriptsForTab(rootState.currentTabId),
    getCountOfBlockedScriptsForTab: (_, getters) => (tabId) => {
      const blocked = getters.getDetectedScriptsForTab(tabId).filter(({ isBlocked }) => isBlocked);
      return sumBy(blocked, ({ count }) => (count || 1));
    },
  },
};
