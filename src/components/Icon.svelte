<script lang="ts">
  let { tab }: { tab: chrome.tabs.Tab } = $props();

  async function switchTab() {
    await chrome.windows.update(tab.windowId, { focused: true });
    await chrome.tabs.update(tab.id!, { active: true });
  }
</script>

<button type="button" onclick={switchTab}>
  <img src={tab.favIconUrl} alt="icon" />
</button>

<style>
  button {
    cursor: pointer;
    background-color: transparent;
    border: none;
    padding: 0;

    width: 100%;
    height: 100%;
  }

  img {
    width: 100%;
    height: 100%;

    object-fit: contain;
  }
</style>
