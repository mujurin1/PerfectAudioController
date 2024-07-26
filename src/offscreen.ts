import type { CheckExistTabs, CheckExistTabsResult } from "./background/backgroundMessage";
import { MAX_BOOST } from "./share/const";
import type { AudioVolume, ExtensionCommand, ManageTabInfo, PAMMessage, PAMMessageResponse, SetAudio, SetAudioResponse, StartManage, StartManageResponse, StopManage, TabNotExist } from "./share/PAMMessage";
import { navigatorEx } from "./share/typed";

interface TabState {
  stream: MediaStream;
  audioContext: AudioContext;
  source: MediaStreamAudioSourceNode;
  gainNode: GainNode;
  audio: AudioVolume;
}

const tabStates = new Map<number, TabState>();
chrome.runtime.onMessage.addListener(receiveMessage);

function getTabIds() {
  const ids: number[] = [];
  for (const id of tabStates.keys()) ids.push(id);
  return ids;
}

// 一定時間毎に終了チェック
(() => {
  setInterval(async () => {
    if (tabStates.size === 0) close();

    const result: CheckExistTabsResult = await chrome.runtime.sendMessage({
      type: "CheckExistTabs",
      tabIds: getTabIds(),
    } satisfies CheckExistTabs);

    if (result.existTabs.length === 0) close();

    for (const id of result.notExistTabs)
      tabStates.delete(id);
  }, 60_000 * 10);  // 10分
})();

function receiveMessage(
  message: PAMMessage,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: PAMMessageResponse) => void,
) {
  let promise: Promise<PAMMessageResponse> | void;

  switch (message.type) {
    case "StartManage":
      promise = startManage(message);
      break;
    case "SetAudio":
      promise = setAudio(message, sendResponse);
      break;
    case "StopManage":
      promise = stopManage(message);
      break;
    case "RequestManageTabInfos":
      promise = getManageTabs(sendResponse);
      break;
    case "TabNotExist":
      promise = tabNotExist(message);
      break;
    default:
      return;
  }

  if (promise != null) {
    void promise.then(sendResponse);
    return true;
  } else {
    // 何かしらのメッセージを返さないと offscreen が対応したかどうかが分からないため
    sendResponse("NO_RESPONSE");
  }
}

async function startManage(message: StartManage): Promise<StartManageResponse> {
  let tabState = tabStates.get(message.tabId);

  if (tabState == null) {
    const stream = await navigatorEx.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: message.streamId,
        },
      },
    });

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);

    const gainNode = audioContext.createGain();
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    tabState = { stream, audioContext, source, gainNode, audio: { volume: 1, boost: 1 } };
    tabStates.set(message.tabId, tabState);

    // ストリームがアクティブでなくなったら呼ばれる
    // ※一部ブラウザではサポートされていない
    stream.addEventListener("inactive", () => {
      tabStates.delete(message.tabId);

      if (tabStates.size === 0) close();
    });
  }

  if (message.audioVolume != null) {
    changeVolume(tabState, message.audioVolume);
  }

  return { tabId: message.tabId, audio: tabState.audio };
}

function setAudio({ tabId, audioVolume }: SetAudio, sendResponse: (response: SetAudioResponse) => void) {
  const state = tabStates.get(tabId);
  if (state == null) return;

  changeVolume(state, audioVolume);

  sendResponse(state.audio);
}

function stopManage({ tabId }: StopManage) {
  const state = tabStates.get(tabId);
  if (state == null) return;

  state.stream.getTracks().forEach(track => track.stop());
  void state.audioContext.close();
  tabStates.delete(tabId);
}

function getManageTabs(sendMessage: (response: ManageTabInfo[]) => void) {
  const infos: ManageTabInfo[] = [];

  for (const tabId of tabStates.keys()) {
    const status = tabStates.get(tabId)!;
    infos.push({
      tabId,
      audio: status.audio,
    });
  }

  sendMessage(infos);
}

function tabNotExist({ tabId }: TabNotExist) {
  const state = tabStates.get(tabId);
  if (state == null) return;

  state.stream.getTracks().forEach(track => track.stop());
  void state.audioContext.close();
  tabStates.delete(tabId);
}


function changeVolume(state: TabState, audioVolume: AudioVolume | ExtensionCommand) {
  // if (Object.prototype.hasOwnProperty.call(audioVolume, "value")) {
  if (typeof audioVolume === "string") {
    changeVolumeCommand(state, audioVolume);
  } else {
    state.audio = audioVolume;
  }

  const volume = state.audio.volume * state.audio.boost;
  state.gainNode.gain.setTargetAtTime(volume, 0, 0.1);
}

function changeVolumeCommand(state: TabState, command: ExtensionCommand) {
  if (
    state.audio.boost > 1 ||
    (state.audio.volume === 1 && command === "Volume Up")
  ) {
    // change boost
    const changeValue = command === "Volume Up" ? 0.5 : -0.5;
    state.audio.boost += changeValue;
    if (state.audio.boost < 0) state.audio.boost = 0;
    else if (state.audio.boost > MAX_BOOST) state.audio.boost = MAX_BOOST;
  } else {
    // change volume
    // 0~1 -> 0~10.0
    const value = state.audio.volume / 0.1;
    const changeValue = command === "Volume Up" ? 0.6 : - 0.6;
    state.audio.volume = Math.round(value + changeValue) / 10;  // *0.1 だと誤差が出るので
    if (state.audio.volume < 0) state.audio.volume = 0;
  }
}
