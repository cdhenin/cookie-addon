export async function getCurrentTab() {
  const tabs = await browser.tabs.query({ currentWindow: true, active: true });
  return tabs[0] || {};
}

export const reloadTabNoCache = () => browser.tabs.reload({ bypassCache: true });
