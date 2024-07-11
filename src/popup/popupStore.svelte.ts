import { getManageTabInfos, tabNotExist } from "../share/func";
import type { AudioVolume } from "../share/PAMMessage";
import { chromeExtends } from "../share/typed";
import type { CurrentTabState, ManageTab } from "./type";

let state = $state<"initializing" | "running" | "reloading" | "error">("initializing");
let initializedError = $state<string>();
let currentTab = $state<chrome.tabs.Tab>(null!);
let audiableTabs = $state<chrome.tabs.Tab[]>(null!);
let offscreen = $state<chrome.runtime.ExtensionContext>(null!);
let manageTabs = $state<ManageTab[]>(null!);
let currentTabState = $state<CurrentTabState>(null!);

export const popupStore = {
  get state() { return state; },
  get initializedError() { return initializedError; },
  get currentTab() { return currentTab; },
  get audiableTabs() { return audiableTabs; },
  get offscreen() { return offscreen; },
  get manageTabs() { return manageTabs; },
  get currentTabState() { return currentTabState; },

  deleteManageTab(tabId: number) {
    const manageIndex = manageTabs.findIndex(t => t.tab.id === tabId);
    if (manageIndex !== -1) {
      manageTabs.splice(manageIndex, 1);
      return;   // manage にあれば audiable には存在しない
    }

    const audiableTabIndex = audiableTabs.findIndex(t => t.id === tabId);
    if (audiableTabIndex !== -1) audiableTabs.splice(audiableTabIndex, 1);
  },
  audiableToManage(tab: chrome.tabs.Tab, audio?: AudioVolume) {
    const audiableIndex = audiableTabs.findIndex(t => t.id === tab.id);
    if (audiableIndex === -1) return;

    audiableTabs.splice(audiableIndex, 1);
    manageTabs.push({ tab, audio: audio ?? { volume: 1, boost: 1 } });
  },
  /**
   * 必要な状態のみを再読み込みする
   */
  async reload() {
    state = "reloading";

    manageTabs = [];

    offscreen = await getOffscreen();
    manageTabs = await getManageTabs();
    getCurrentTabAndRemoveManageTabs();

    state = "running";
  },
};

void initialize();

//
//
//

function initialize() {
  async function _initialize() {
    if (state !== "initializing") return;

    const currentTabPromise = chrome.tabs.query({ currentWindow: true, active: true }).then(tabs => tabs[0]);
    const audiableTabsPromise = chrome.tabs.query({ audible: true });
    const offscreenPromise = getOffscreen();

    currentTab = (await currentTabPromise) ?? throwError("現在のタブが存在しません！");
    offscreen = await offscreenPromise;

    // ここ以下は offscreen が必要
    manageTabs = await getManageTabs();

    // manageTabs, currentTab が必要
    currentTabState = getCurrentTabAndRemoveManageTabs() ?? { manage: false, audio: { volume: 1, boost: 1 } };

    audiableTabs = await audiableTabsPromise  // manageTabs, currentTab が必要
      .then(tabs => tabs.filter(tab => manageTabs.every(mt => mt.tab.id !== tab.id) && tab.id !== currentTab.id));

    state = "running";
  }

  return _initialize()
    .catch((msg: unknown) => {
      state = "error";
      initializedError = JSON.stringify(msg);
    });
}

async function getOffscreen() {
  const existingContexts = await chrome.runtime.getContexts({});

  let offscreenDocument = existingContexts.find(c => c.contextType === chrome.runtime.ContextType.OFFSCREEN_DOCUMENT);

  if (!offscreenDocument) {
    offscreenDocument = await chromeExtends.createDocument({
      url: "offscreen.html",
      reasons: [chrome.offscreen.Reason.USER_MEDIA],
      justification: "Audio Volume Control from chrome.tabCapture API",
    });
  }

  return offscreenDocument;
}

async function getManageTabs() {
  const tabInfos = await getManageTabInfos();

  const manageTabs: ManageTab[] = [];
  const notFoundTabIds: number[] = [];
  const getTabPromises: Promise<void>[] = [];

  for (const { tabId, audio } of tabInfos) {
    getTabPromises.push(
      chrome.tabs.get(tabId)
        .then(tab => void manageTabs.push(({ tab, audio })))
        .catch(() => void notFoundTabIds.push(tabId))
    );
  }

  await Promise.all(getTabPromises);

  await Promise.all(notFoundTabIds.map(tabNotExist));

  return manageTabs;
}

function getCurrentTabAndRemoveManageTabs(): CurrentTabState | undefined {
  const currentIndex = manageTabs.findIndex(({ tab }) => currentTab.id === tab.id);
  if (currentIndex === -1) return;

  const current = manageTabs[currentIndex];
  manageTabs.splice(currentIndex, 1);
  return { manage: true, audio: current.audio };
}


function throwError(msg: string) {
  throw new Error(msg);
}
