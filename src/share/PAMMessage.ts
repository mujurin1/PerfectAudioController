
/** manifest.json (vite.config.ts) で定義した拡張機能コマンド */
export type ExtensionCommand = "Volume Up" | "Volume Down";

/**
 * `type:string` 必須
 */
export type PAMMessage = StartManage | SetAudio | StopManage | RequestManageTabInfos | TabNotExist;
export type PAMMessageResponse = StartManageResponse | SetAudioResponse | ManageTabInfos | "NO_RESPONSE";

export interface AudioVolume {
  /** 0 ~ 1 */
  volume: number;
  /** 1 ~ 6 */
  boost: number;
}

export interface StartManage {
  type: "StartManage";
  tabId: number;
  streamId: string;
  audioVolume?: AudioVolume | ExtensionCommand;
}
export type StartManageResponse = ManageTabInfo;

export interface SetAudio {
  type: "SetAudio";
  tabId: number;
  audioVolume: AudioVolume | ExtensionCommand;
}
export type SetAudioResponse = AudioVolume;

export interface StopManage {
  type: "StopManage";
  tabId: number;
}

export interface RequestManageTabInfos {
  type: "RequestManageTabInfos";
}
export type ManageTabInfos = ManageTabInfo[];

export interface ManageTabInfo {
  tabId: number;
  audio: AudioVolume;
}
export interface TabNotExist {
  type: "TabNotExist";
  tabId: number;
}
