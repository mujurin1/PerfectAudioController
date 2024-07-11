import type { AudioVolume } from "../share/PAMMessage";

export interface ManageTab {
  tab: chrome.tabs.Tab;
  audio: AudioVolume;
}

export interface CurrentTabState {
  manage: boolean;
  audio: AudioVolume;
}
