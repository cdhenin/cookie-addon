/*!
 * Some parts of this file are inspired from https://github.com/cliqz-oss/adblocker/tree/master/packages/adblocker and
 * https://github.com/cliqz-oss/adblocker/tree/master/packages/adblocker-webextension-example
 * Copyright (c) 2017-present Cliqz GmbH.
 */

import {
  fullLists,
  fetchResources,
  fetchLists,
} from '@cliqz/adblocker-webextension';
import { pullAllWith } from 'lodash';
import Blocker from './Blocker';

const RESOURCE_URL = 'https://github.com/cdhenin/cookie-addon/-/raw/master/engine/lists/';
const RULES_LIST = [
  ...fullLists,
  `${RESOURCE_URL}/networkAdvertising.txt`,
  `${RESOURCE_URL}/networkAnalytics.txt`,
  `${RESOURCE_URL}/cosmetic.txt`,
];

export default () => Blocker.fromCached(async () => {
  const listsPromises = fetchLists(fetch, RULES_LIST);
  const resourcesPromise = fetchResources(fetch);

  const [lists, resources] = await Promise.all([listsPromises, resourcesPromise]);
  const remoteRules = lists.join('\n');

  const whitelistAsText = await (await fetch(`${RESOURCE_URL}/whitelist.txt`)).text();
  const rules = pullAllWith(
    remoteRules.split(/\n/g),
    whitelistAsText.split(/\n/g),
    (ruleVal, whitelistVal) => ruleVal.trim() === whitelistVal.trim(),
  );

  const engine = Blocker.parse(
    rules.join('\n'),
    { enableCompression: true, enableHtmlFiltering: true, loadCosmeticFilters: true },
  );
  if (resources !== undefined) {
    engine.updateResources(resources, `${resources.length}`);
  }
  engine.enableBlockingInBrowser(browser);

  return engine;
});
