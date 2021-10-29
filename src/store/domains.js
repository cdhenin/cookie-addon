export const SET_SCRIPTS = 'setScripts';
export const SET_STYLES = 'setStyles';

export default {
  state: () => ({
    scripts: [],
    styles: [],
  }),
  mutations: {
    [SET_SCRIPTS](state, { value }) {
      state.scripts = value;
    },
    [SET_STYLES](state, { value }) {
      state.styles = value;
    },
  },
  actions: {
    allowScriptsForDomain({ state, commit }, domain) {
      commit(SET_SCRIPTS, { value: Array.from(new Set([...state.scripts, domain])) });
    },
    disallowScriptsForDomain({ state, commit }, domain) {
      commit(SET_SCRIPTS, { value: state.scripts.filter((element) => element !== domain) });
    },
    allowStylesForDomain({ state, commit }, domain) {
      commit(SET_STYLES, { value: Array.from(new Set([...state.styles, domain])) });
    },
    disallowStylesForDomain({ state, commit }, domain) {
      commit(SET_STYLES, { value: state.styles.filter((element) => element !== domain) });
    },
    toggleDomainForScripts({ state, dispatch }, domain) {
      const isWhitelisted = state.scripts.indexOf(domain) > -1;
      const action = isWhitelisted ? 'disallowScriptsForDomain' : 'allowScriptsForDomain';
      return dispatch(action, domain);
    },
    toggleDomainForStyles({ state, dispatch }, domain) {
      const isWhitelisted = state.styles.indexOf(domain) > -1;
      const action = isWhitelisted ? 'disallowStylesForDomain' : 'allowStylesForDomain';
      return dispatch(action, domain);
    },
  },
  getters: {
    allowedScriptsDomains: (state) => state.scripts,
    allowedStylesDomains: (state) => state.styles,
    isScriptsAllowedForDomain: (state) => (domain) => state.scripts.indexOf(domain) > -1,
    isStylesAllowedForDomain: (state) => (domain) => state.styles.indexOf(domain) > -1,
  },
};
