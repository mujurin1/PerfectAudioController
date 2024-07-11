<script lang="ts">
  import AudiableController from "../components/AudiableController.svelte";
  import CurrentController from "../components/CurrentController.svelte";
  import Header from "../components/Header.svelte";
  import Log from "../components/Log.svelte";
  import ManageController from "../components/ManageController.svelte";
  import { popupStore } from "./popupStore.svelte";
</script>

<Header />

<div>
  {#if popupStore.state === "running" || popupStore.state === "reloading"}
    <div class="current">
      <CurrentController />
    </div>

    {#if popupStore.manageTabs.length > 0}
      <div class="manage">
        <div class="name">
          <p>Manage Tabs</p>
        </div>

        {#each popupStore.manageTabs as manageTab}
          <ManageController {manageTab} />
        {/each}
      </div>
    {/if}

    {#if popupStore.audiableTabs.length > 0}
      <div class="audiable">
        <p class="name">Audiable Tabs</p>

        {#each popupStore.audiableTabs as tab}
          <AudiableController {tab} />
        {/each}
      </div>
    {/if}
  {:else if popupStore.state === "initializing"}
    <div>Loading...</div>
  {:else if popupStore.state === "error"}
    <div>
      <p>エラーが発生しました</p>

      <p>{popupStore.initializedError}</p>
    </div>
  {/if}

  <Log />
</div>

<style>
  .name {
    font-size: 0.8rem;
  }

  .current {
    margin-top: 10px;
  }
  .manage {
    margin-top: 13px;
  }
  .audiable {
    margin-top: 13px;
  }
</style>
