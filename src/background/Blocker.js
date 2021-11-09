/*!
 * Some parts of this file are inspired from https://github.com/cliqz-oss/adblocker/tree/master/packages/adblocker-webextension
 * Copyright (c) 2017-present Cliqz GmbH.
 */

import { fromWebRequestDetails, WebExtensionBlocker } from '@cliqz/adblocker-webextension';
import { parse } from 'tldts';
import store from '../store';
import { DEFAULT_PURPOSE } from '../store/detection';

function getPurpose(filter) {
  // Try to recreate the original rule of the filter (adblock syntax)
  const originRule = filter.toString();

  const { hostname } = filter;
  if (hostname && (hostname.match(/taboola.com/) || hostname.match(/outbrain.com/))) { return 'advertising'; }
  if (originRule.match(/analytics/) || (hostname && hostname.match(/googletagmanager/))) { return 'analytics'; }
  if (hostname && hostname.match(/cloudflareinsights/)) { return 'analytics'; }
  if (originRule.match(/googleadservices/) || originRule.match(/doubleclick/)) { return 'advertising'; }
  if (originRule.match(/facebook/) || originRule.match(/twitter/)) { return 'social_interaction'; }

  if (originRule.match(/newsletter/) || originRule.match(/rss/)) { return 'social_interaction'; }

  return DEFAULT_PURPOSE;
}
// function inspired from https://github.com/cliqz-oss/adblocker/blob/master/packages/adblocker-webextension/adblocker.ts#L457
function injectStyles(browser, styles, {
  tabId, frameId, allFrames = false, hostname,
}) {
  // Abort if styles are allowed by user or stylesheet is empty.
  if (store.getters.isStylesAllowedForDomain(hostname) || styles.length === 0) { return; }

  // Abort if API is not available.
  if (browser.tabs === undefined || browser.tabs.insertCSS === undefined) {
    throw new Error('required "tabs" or "tabs.insertCSS" API is not defined');
  }

  const options = {
    allFrames,
    code: styles,
    cssOrigin: 'user',
    matchAboutBlank: true,
    runAt: 'document_start',
  };

  // Proceed with stylesheet injection.
  browser.tabs.insertCSS(tabId, frameId ? { ...options, frameId } : options);
}

// Class inspired from https://github.com/cliqz-oss/adblocker/blob/master/packages/adblocker-webextension/adblocker.ts#L225
class Blocker extends WebExtensionBlocker {
  onBeforeRequest = (browser, details) => {
    const request = fromWebRequestDetails(details);
    if (this.config.guessRequestTypeFromUrl === true && request.type === 'other') {
      request.guessTypeOfRequest();
    }

    if (request.isMainFrame()) {
      this.performHTMLFiltering(browser, request);
      return {};
    }

    if (request.isFirstParty) { return {}; }

    const { redirect, match, filter } = this.match(request);
    const { domain, hostname, tabId } = request;

    // Add request to detected requests in store
    const sourceUrl = details.initiator || details.originUrl || details.documentUrl;
    const { hostname: sourceHostname } = parse(sourceUrl);
    const isBlocking = !store.getters.isScriptsAllowedForDomain(sourceHostname);
    const hasMatched = redirect !== undefined || match === true;
    const isBlocked = hasMatched && isBlocking;

    if (hasMatched) {
      const script = {
        tabId,
        isBlocked,
        name: domain,
        id: hostname,
        mainDomain: hostname,
        mainPurpose: getPurpose(filter),
      };
      store.dispatch('addDetectedScript', script);
    }

    if (!isBlocking) { return {}; }

    if (redirect !== undefined) {
      return { redirectUrl: redirect.dataUrl };
    }

    if (match === true) {
      return { cancel: true };
    }

    return {};
  };

  onRuntimeMessage = (browser, msg, sender) => new Promise((resolve) => {
    const promises = [];

    const { url = '', tab, frameId } = sender;
    if (tab === undefined || tab.id === undefined || frameId === undefined) {
      throw new Error('required "sender.tab", "sender.tab.id", "sender.frameId" information is not available');
    }

    const { action, lifecycle } = msg;

    // Make sure we only listen to messages coming from our content-script
    // based on the value of `action`.
    if (action === 'getCosmeticsFilters') {
      // Extract hostname from sender's URL
      const { hostname = '', domain = '' } = parse(url);
      const { classes, hrefs, ids } = msg;

      const params = {
        domain,
        hostname,
        url,
        classes,
        hrefs,
        ids,
      };

      // Once per tab/page load we inject base stylesheets. These are always
      // the same for all frames of a given page because they do not depend on
      // a particular domain and cannot be cancelled using unhide rules.
      // Because of this, we specify `allFrames: true` when injecting them so
      // that we do not need to perform this operation for sub-frames.
      if (frameId === 0 && lifecycle === 'start') {
        const { active, styles } = this.getCosmeticsFilters({
          ...params,
          // This needs to be done only once per tab
          getBaseRules: true,
          getInjectionRules: false,
          getExtendedRules: false,
          getRulesFromDOM: false,
          getRulesFromHostname: false,
        });

        if (active === false) {
          return;
        }

        promises.push(injectStyles(browser, styles, { tabId: tab.id, hostname, allFrames: true }));
      }

      // Separately, requests cosmetics which depend on the page it self
      // (either because of the hostname or content of the DOM). Content script
      // logic is responsible for returning information about lists of classes,
      // ids and hrefs observed in the DOM. MutationObserver is also used to
      // make sure we can react to changes.
      {
        const {
          active,
          styles,
          scripts,
          extended,
        } = this.getCosmeticsFilters({
          ...params,
          // This needs to be done only once per frame
          getBaseRules: false,
          getInjectionRules: msg.lifecycle === 'start',
          getExtendedRules: msg.lifecycle === 'start',
          getRulesFromHostname: msg.lifecycle === 'start',
          // This will be done every time we get information about DOM mutation
          getRulesFromDOM: msg.lifecycle === 'dom-update',
        });

        if (active === false) { return; }

        promises.push(injectStyles(browser, styles, { tabId: tab.id, frameId, hostname }));

        // Inject scripts from content script
        const isBlocking = !store.getters.isScriptsAllowedForDomain(hostname);
        if (scripts.length !== 0 && isBlocking) {
          resolve({
            active,
            extended,
            scripts,
            styles: '',
          });
        }
      }
    }

    Promise.all(promises);
  });
}

export default Blocker;
