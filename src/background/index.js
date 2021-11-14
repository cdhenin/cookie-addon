import { log, toggleBadgeAndIcon, updateBadgeValue } from '../helpers/browserActions';
import store, { PERSISTED_MUTATIONS } from '../store';
import loadBlocker from './engine';

const loadStorage = async () => {
  try {
    const mutations = await browser.storage.local.get(PERSISTED_MUTATIONS);
    return Object.entries(mutations).forEach(
      ([mutation, value]) => store.dispatch('applyMutation', { mutation, payload: { value, preventPersist: true } }),
    );
  } catch (err) {
    log(err);
    return null;
  }
};

loadStorage().finally(() => {
  const shouldLaunchBlocker = store.getters.isPluginActivated;
  if (!shouldLaunchBlocker) {
    // blocking is not active (paused)
    toggleBadgeAndIcon(false);
  } else {
    loadBlocker()
      .then((() => {
        // Whenever the active tab changes, then we update the count of blocked request
        browser.tabs.onActivated.addListener(({ tabId }) => {
          updateBadgeValue(tabId, store.getters.getCountOfBlockedScriptsForTab(tabId));
          store.dispatch('setCurrentTabId', tabId);
        });

        // Reset counter if tab is reloaded
        browser.tabs.onUpdated.addListener((tabId, { status }) => {
          if (status === 'loading') {
            store.dispatch('clearDetectedScriptsForTab', tabId);
          }
        });

        browser.tabs.onRemoved.addListener((tabId) => {
          store.dispatch('clearDetectedScriptsForTab', tabId);
        });

        // blocking is active
        toggleBadgeAndIcon(true);
      }))
      .catch(() => {
        store.dispatch('setWarning', 'error');
        toggleBadgeAndIcon(false);
      });
  }
});
