import type { ExtensionCommand, PAMMessageResponse, SetAudio, StartManage, StartManageResponse } from "../share/PAMMessage";
import { chromeExtends } from "../share/typed";
import type { CheckExistTabs, CheckExistTabsResult, ServiceWorkerMessage } from "./backgroundMessage";

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, _tab) => {
//   if (changeInfo.audible !== undefined) {
//     updateIcon(tabId, changeInfo.audible);
//   }
// });

// chrome.tabs.onActivated.addListener(activeInfo => {
//   chrome.tabs.get(activeInfo.tabId, tab => {
//     updateIcon(tab.id, tab.audible);
//   });
// });

// function updateIcon(tabId?: number, isAudible?: boolean) {
//   const details = {
//     path: isAudible ? "/green.png" : "/red.png",
//     tabId,
//   } satisfies chrome.action.TabIconDetails;

//   void chrome.action.setIcon(details);
// }


chrome.commands.onCommand.addListener(async (_command, tab) => {
  const command = _command as ExtensionCommand;
  await getOffscreen();

  switch (command) {
    case "Volume Up":
    case "Volume Down": {
      const result: PAMMessageResponse = await chrome.runtime.sendMessage({
        type: "SetAudio",
        tabId: tab.id!,
        audioVolume: command,
      } satisfies SetAudio);

      if (result == null || result === "NO_RESPONSE") {
        // console.log("create stream");
        const streamId = await chromeExtends.getMediaStreamId({
          targetTabId: tab.id!,
        });

        const result: StartManageResponse = await chrome.runtime.sendMessage({
          type: "StartManage",
          tabId: tab.id!,
          audioVolume: command,
          streamId,
        } satisfies StartManage);

        if (result == null) throw new Error("StartManage の呼び出しに失敗しました");
      }

      // TODO: 音量の変更をタブに表示
      break;
    }
  }
});

chrome.runtime.onMessage.addListener((message: ServiceWorkerMessage, sender, sendResponse) => {
  let promise: Promise<unknown> | undefined;
  switch (message.type) {
    case "CheckExistTabs":
      promise = checkExistTabs(message);
  }

  if (promise != null) {
    void promise.then(sendResponse);
    return true;
  }
});

async function checkExistTabs(message: CheckExistTabs): Promise<CheckExistTabsResult> {
  const existTabs: number[] = [];
  const notExistTabs: number[] = [];

  const tabIds = await chrome.tabs.query({})
    .then(tabs => tabs.filter(t => t.id!).map(t => t.id!));

  for (const tabId of message.tabIds) {
    if (tabIds.findIndex(id => id === tabId) !== -1)
      existTabs.push(tabId);
    else notExistTabs.push(tabId);
  }

  return {
    type: "CheckExistTabsResult",
    existTabs,
    notExistTabs
  };
}

async function getOffscreen() {
  const existingContexts = await chrome.runtime.getContexts({});

  let offscreenDocument = existingContexts.find(c => c.contextType === chrome.runtime.ContextType.OFFSCREEN_DOCUMENT);

  if (!offscreenDocument) {
    offscreenDocument = await chromeExtends.createDocument({
      url: "offscreen.html",
      reasons: [chrome.offscreen.Reason.USER_MEDIA],
      justification: "Audio Volume Manage from chrome.tabCapture API",
    });
  }

  return offscreenDocument;
}