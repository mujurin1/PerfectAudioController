
<script lang="ts">
  import { popupStore } from "../popup/popupStore.svelte";
  import type { AudioVolume } from "../share/PAMMessage";
  import { startManage } from "../share/func";
  import Alignment from "./Alignment.svelte";
  import Icon from "./Icon.svelte";

  let { tab }: { tab: chrome.tabs.Tab } = $props();
  let failed = $state(false);
  
  async function onStartManage(tab: chrome.tabs.Tab, volume?: AudioVolume) {
    // chrome.tabCapture API はユーザーが拡張機能を操作した場合のみアクセス可能
    // タブページのキャプチャはそのタブで拡張機能の操作をして貰う必要がある
    // https://developer.chrome.com/docs/extensions/reference/api/tabCapture#concepts_and_usage

    try {
      await startManage(tab.id!, volume);
    } catch {
      failed = true;
      return;
    }

    popupStore.audiableToManage(tab, volume);
  }
  
  async function switchTab() {
    await chrome.windows.update(tab.windowId, { focused: true });
    await chrome.tabs.update(tab.id!, { active: true });
  }
</script>

<Alignment>
{#snippet icon()}
  <Icon {tab} />
{/snippet}
{#snippet top()}
  <div class="title">
    {tab.title}
  </div>
{/snippet}
{#snippet left()}
  {#if failed}
    <button class="manage-button" type="button" onclick={switchTab}>
      Failed.. Click to switch tab
    </button>
  {:else}
    <button class="manage-button" type="button" onclick={() => onStartManage(tab)}>
      Click to start manage
    </button>
  {/if}
{/snippet}
</Alignment>

<style>
  .title {
    width: 100%;
    margin-bottom: 4px;
    font-size: 1rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .manage-button {
    cursor: pointer;
    font-size: 1rem;
    width: 100%;
    height: 100%;
  }
</style>
