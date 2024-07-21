// 
// @types/chrome が実際の型と合ってないのでそれをいい感じにするためのコードのみ記述する
// 

/* # 拡張機能のスクリプト実行環境一覧
 * 
 * content
 *   * ユーザーが閲覧しているタブページ内に挿入するスクリプト
 *   * Chrome Extends API は一部使用不可
 * 
 * background (Service Workder)
 *   * バックグラウンドで動作するワーカー
 *   * Chrome Extends API は一部使用不可
 *   * DOM が存在しない
 *   * パフォーマンスのために起動後約30秒で終了する?
 *     再起動時にメモリは破棄される (状態は維持されない)
 * 
 * forground (popup/option)
 *   * ポップアップやオプションページなどの拡張機能専用のページで動作するスクリプト
 *   * Chrome Extends API は全て(?)使用可能
 *   * ページを閉じるとメモリは破棄される (状態は維持されない)
 * 
 * offscreen https://developer.chrome.com/docs/extensions/reference/api/offscreen
 *   * バックグラウンドで動作する非表示なDOMを持つワーカー(?)
 *   * Chrome Extends API は `chrome.runtime` のみ使用可能
 *   * background と違い終了しない限りは動作し続ける
 *     (`AUDIO_PLAYBACK` の場合を除く)
 */


export const chromeExtends = {
  getCapturedTabs() {
    return (chrome.tabCapture.getCapturedTabs as any)() as Promise<chrome.tabCapture.CaptureInfo[]>;
  },
  getMediaStreamId(options: chrome.tabCapture.GetMediaStreamOptions) {
    return (chrome.tabCapture.getMediaStreamId as any)(options) as Promise<string>;
  },
  createDocument(parameters: chrome.offscreen.CreateParameters) {
    return chrome.offscreen.createDocument(parameters) as unknown as Promise<chrome.runtime.ExtensionContext>;
  }
} as const;


interface MediaStreamConstraints {
  audio?: boolean | MediaTrackConstraints & {
    mandatory: {
      chromeMediaSource: "tab";
      chromeMediaSourceId: string;
    };
  };
  peerIdentity?: string;
  preferCurrentTab?: boolean;
  video?: boolean | MediaTrackConstraints & {
    mandatory: {
      chromeMediaSource: "tab";
      chromeMediaSourceId: string;
    };
  };
}
export const navigatorEx = {
  getUserMedia(constraints?: MediaStreamConstraints) {
    return navigator.mediaDevices.getUserMedia(constraints);
  },
} as const;


