
# Perfect Audio Controller

タブの音量をコントロールするChrome拡張機能です

ダウンロードは[こちら](https://github.com/mujurin1/PerfectAudioController/releases)から

## TODO
* [x] 複数のタブの音量を管理する
* [x] コントロールを適切に終了する
* [x] ショートカットキーで操作する (chrome://extensions/shortcuts)
  * [ ] ショートカットキーで操作した時に変化をユーザーに伝える  
    ショートカットキー操作時にそのタブの全面に薄く表示する感じが理想
* [ ] バッジに音量を表示する
* [ ] アイコンクリック時の動作をカスタムする
  * 要望があれば
* [ ] ミュートボタンを付ける
  * 要望があれば
* [ ] ブーストの最大値を調整する
  * 要望があれば
* [ ] Google ストアに公開する
  * 需要が多そうなら

## 不具合?
* コントロール中のタブのVideoをフルスクリーン表示できない
  * YoutubeやTwitchなどでVideoをフルスクリーンに出来ません
  * これは Chrome の仕様です (Ver:126.0.6478.127 現在)  
    この拡張機能では今のところページのDOMやCSSは触っていません  
    (Content Script を使用していません)
    
