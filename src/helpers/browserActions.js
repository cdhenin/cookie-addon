import isString from 'lodash/isString';
import isInteger from 'lodash/isInteger';
import colors from '../constants/colors';

export function log(element) {
  // eslint-disable-next-line no-console
  console.log(element);
}

export function setBadgeBackgroundColor(color) {
  try {
    browser.browserAction.setBadgeBackgroundColor({ color });
  } catch (error) {
    log('Operation not supported by device');
  }
}

export function setBadgeTextColor(color) {
  try {
    browser.browserAction.setBadgeTextColor({ color });
  } catch (error) {
    log('Operation not supported by device');
  }
}

export function setBadgeText(text) {
  try {
    browser.browserAction.setBadgeText({ text });
  } catch (error) {
    log('Operation not supported by device');
  }
}

export function setIcon(path) {
  try {
    browser.browserAction.setIcon({ path });
  } catch (error) {
    log('Operation not supported by device');
  }
}

export function toggleBadgeAndIcon(blocking = true) {
  const color = blocking ? colors.primary : colors.warn;
  const path = blocking ? 'icons/38.png' : 'icons/38-white.png';

  setBadgeBackgroundColor(color);
  setIcon(path);
}

export const updateBadgeValue = (tabId, value) => {
  if (tabId === -1 || !(isInteger(value) || isString(value))) { return; }
  setBadgeText(value.toString());
};
