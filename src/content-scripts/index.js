/*!
 * Code from https://github.com/cliqz-oss/adblocker/blob/master/packages/adblocker-webextension-example/content-script.ts
 */

import { injectCosmetics } from '@cliqz/adblocker-webextension-cosmetics';

/**
 * `injectCosmetics` is in charge of all ad-blocking logic on the content-script
 * side. It handles the following:
 * - Inject scripts into the page, which might be used to defuse anti-adblockers.
 * - Block the execution of some scripts in the page (only if the
 * 'beforescriptexecute' event is available, currently only on Firefox).
 */

injectCosmetics(window, true /* MutationObserver */);
