<script lang="ts">
  import { popupStore } from "../popup/popupStore.svelte";
  import { MAX_BOOST } from "../share/const";
  import { setVolume, startManage, stopManage } from "../share/func";
  import Alignment from "./Alignment.svelte";
  import Icon from "./Icon.svelte";
  import Slider from "./Slider.svelte";


  async function onStartManage() {
    if (popupStore.currentTabState.manage) return;

    await startManage(popupStore.currentTab.id!, popupStore.currentTabState.audio);
    popupStore.currentTabState.manage = true;
  }

  function onSetVolume() {
    if (!popupStore.currentTabState.manage) {
      onStartManage();
      return;
    }

    setVolume(popupStore.currentTab.id!, popupStore.currentTabState.audio);
  }

  function onClose() {
    void stopManage(popupStore.currentTab.id!);

    popupStore.currentTabState.manage = false;
    popupStore.currentTabState.audio = { volume: 1, boost: 1 };
  }

  function onToggle() {
    if(!popupStore.currentTabState.manage)
      void onStartManage();
    else onClose();
  }
</script>


<div class="title">
  <p>{popupStore.currentTab.title}</p>
</div>

<Alignment>
  {#snippet icon()}
    <Icon tab={popupStore.currentTab} />
  {/snippet}
  {#snippet top()}
  <Slider
    step={0.01}
    min={0}
    max={1}
    bind:value={popupStore.currentTabState.audio.volume}
    oninput={onSetVolume}
    colorType="volume"
  />
  {/snippet}
  {#snippet left()}
    <div class="flex">
      <button class="toggle" type="button" class:on={popupStore.currentTabState.manage} onclick={onToggle}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-84 31.5-156.5T197-763l56 56q-44 44-68.5 102T160-480q0 134 93 227t227 93q134 0 227-93t93-227q0-67-24.5-125T707-707l56-56q54 54 85.5 126.5T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-40-360v-440h80v440h-80Z"/></svg>
      </button>
      <p style="min-width: 82px;">VOLUME: {Math.round(popupStore.currentTabState.audio.volume * 100)}%</p>
    </div>
  {/snippet}
  {#snippet right()}
    <p style="padding-left: 10px;">BOOST: {popupStore.currentTabState.audio.boost - 1}</p>

    <Slider
      step={0.5}
      min={1}
      max={MAX_BOOST}
      bind:value={popupStore.currentTabState.audio.boost}
      oninput={onSetVolume}
      colorType="boost"
    />
  {/snippet}
</Alignment>

<style>
  .title {

    & p {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      font-size: 1rem;

      max-width: 100%;
    }
  }

  .flex {
    display: flex;
    justify-content: space-between;
    margin-right:5px;
  }

  .toggle {
      cursor: pointer;
      user-select: none;
      fill: #9b9b9b;
      background-color: #e6e5e5;
      border-radius: 35%;
      border-width: 0;
      width: auto;
      height: 30px;
      padding: 3px;

      transition: background-color 0.3s ease-in-out;

      &.on {
        fill: #1b6cef;
      }

      &:hover {
        background-color: #dedada;
      }
    }
</style>
