import Vue from 'vue';
import Vuex from 'vuex';
import VuexWebExtensions from 'vuex-webextensions';

import domains, { SET_SCRIPTS, SET_STYLES } from './domains';
import detection, { counterPlugin } from './detection';

Vue.use(Vuex);

const SET_WARNING = 'setWarning';
const SET_DEACTIVATED = 'setDeactivated';
const SET_CURRENT_TAB_ID = 'setCurrentTabId';

export const PERSISTED_MUTATIONS = [SET_DEACTIVATED, SET_SCRIPTS, SET_STYLES];

const persistPlugin = (store) => {
  store.subscribe(async ({ type, payload: { value, preventPersist } }) => {
    if (preventPersist || !PERSISTED_MUTATIONS.includes(type)) { return; }
    browser.storage.local.set({ [type]: value });
  });
};

export default new Vuex.Store({
  plugins: [
    // share store between popup and backgroud
    VuexWebExtensions(),
    persistPlugin,
    counterPlugin,
  ],
  state: () => ({
    warning: false,
    currentTabId: null,
    deactivated: false,
  }),
  mutations: {
    [SET_WARNING](state, value) {
      state.warning = value;
    },
    [SET_DEACTIVATED](state, { value }) {
      state.deactivated = value;
    },
    [SET_CURRENT_TAB_ID](state, value) {
      state.currentTabId = value;
    },
  },
  actions: {
    applyMutation({ commit }, { mutation, payload }) {
      commit(mutation, payload);
    },
    setWarning({ commit }, value) {
      commit(SET_WARNING, value);
    },
    setCurrentTabId({ commit }, value) {
      commit(SET_CURRENT_TAB_ID, value);
    },
    toggleDeactivated({ commit, state }) {
      commit(SET_DEACTIVATED, { value: !state.deactivated });
    },
  },
  getters: {
    currentTabId: (state) => state.currentTabId,
    isPluginActivated: (state) => !state.deactivated,
    isErrorWarningDisplayed: (state) => state.warning === 'error',
    isRestartWarningDisplayed: (state) => state.warning === 'warning',
  },
  modules: {
    domains,
    detection,
  },
});
