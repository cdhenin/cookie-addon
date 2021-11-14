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
  getters: {
    allowedScriptsDomains: (state) => state.scripts,
    allowedStylesDomains: (state) => state.styles,
    isScriptsAllowedForDomain: (state) => (domain) => state.scripts.indexOf(domain) > -1,
    isStylesAllowedForDomain: (state) => (domain) => state.styles.indexOf(domain) > -1,
  },
};
