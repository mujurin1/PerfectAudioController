
<script lang="ts">
    import { popupStore } from "../popup/popupStore.svelte";
    import type { ManageTab } from "../popup/type";
    import { MAX_BOOST } from "../share/const";
    import { setVolume, stopManage, tabNotExist } from "../share/func";
    import Alignment from "./Alignment.svelte";
    import Icon from "./Icon.svelte";
    import Slider from "./Slider.svelte";


  let { manageTab }: { manageTab: ManageTab } = $props();

  function onSetVolume() {
    setVolume(manageTab.tab.id!, manageTab.audio);
  }

  function onStopManage() {
    void stopManage(manageTab.tab.id!);

    manageTab.audio = { volume: 1, boost: 1 };
  }

  function onTabNotExist() {
    void tabNotExist(manageTab.tab.id!);

    popupStore.deleteManageTab(manageTab.tab.id!);
  }
</script>

<Alignment>
  {#snippet icon()}
    <Icon tab={manageTab.tab} />
  {/snippet}
  {#snippet top()}
    <div class="title">
      {manageTab.tab.title}
    </div>
  {/snippet}
  {#snippet left()}
    <div class="slider">
      <Slider
      step={0.01}
      min={0}
      max={1}
      bind:value={manageTab.audio.volume}
      oninput={onSetVolume}
      colorType="volume"
      />
  </div>
  {/snippet}
  {#snippet right()}
    <div class="slider">
      <Slider
        step={0.5}
        min={1}
        max={MAX_BOOST}
        bind:value={manageTab.audio.boost}
        oninput={onSetVolume}
        colorType="boost"
      />
    </div>
  {/snippet}
</Alignment>

<style>
  .title {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-top: 3px;
  }

  .slider {
    height: 100%;
    display: grid;
    align-items: center;
  }
</style>
