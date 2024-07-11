import { popupStore } from "../popup/popupStore.svelte";
import type { AudioVolume, ManageTabInfo, PAMMessage, PAMMessageResponse } from "./PAMMessage";
import { chromeExtends } from "./typed";

export async function sendMessage<T extends PAMMessageResponse = "NO_RESPONSE">(message: PAMMessage, tryCount = 0): Promise<T> {
  try {
    // ServiceWorker, offscreen のどちらも存在しない場合にエラーが出る
    const result = await chrome.runtime.sendMessage<PAMMessage, T>(message);

    if (result == null) throw new Error();

    return result;
  } catch (e) {
    if (tryCount < 3) {
      await popupStore.reload();

      console.log(popupStore.currentTabState.manage);
      if (popupStore.currentTabState.manage) {
        await startManage(popupStore.currentTab.id!, popupStore.currentTabState.audio);
      }
      for (const manage of popupStore.manageTabs) {
        await startManage(manage.tab.id!, manage.audio);
      }

      return await sendMessage(message, tryCount + 1);
    } else {
      throw new Error("メッセージの送信に３回失敗しました");
    }
  }
}




export async function startManage(tabId: number, volume?: AudioVolume) {
  // activeTab 権限 が有効なタブ（直接拡張機能を呼び出したタブ）のみターゲット可能
  // https://developer.chrome.com/docs/extensions/reference/api/tabCapture?hl=ja#type-GetMediaStreamOptions
  const streamId = await chromeExtends.getMediaStreamId({
    targetTabId: tabId,
  });

  return sendMessage({
    type: "StartManage",
    tabId,
    streamId,
    audioVolume: volume,
  });
}

export function setVolume(tabId: number, volume: AudioVolume) {
  return sendMessage({
    type: "SetAudio",
    tabId,
    audioVolume: volume,
  });
}

export function stopManage(tabId: number) {
  return sendMessage({
    type: "StopManage",
    tabId,
  });
}

export function getManageTabInfos() {
  return sendMessage<ManageTabInfo[]>({ type: "RequestManageTabInfos" });
}

export function tabNotExist(tabId: number) {
  return sendMessage({ type: "TabNotExist", tabId });
}
