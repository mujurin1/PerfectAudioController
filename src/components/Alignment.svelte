
<script lang="ts">
  import type { Snippet } from "svelte";

  let { icon, top, left, right } : {
    icon: Snippet,
    top: Snippet,
    left: Snippet,
    right?: Snippet,
  } = $props();
</script>

<div class="container">
  <div class="icon">
    {@render icon()}
  </div>
  <div class="top">
    {@render top()}
  </div>
  <div class="left">
    {@render left()}
  </div>
{#if right}
  <div class="right">
    {@render right()}
  </div>
{/if}
</div>

<style>
  .container {
    display: grid;
    grid-template:
            "icon top  top  " min-content
            "icon left right" 1fr / min-content 1fr min-content;
  }

  .icon {
    grid-area: icon;
    margin-right: 10px;
    
    min-height: 45px;
    min-width: 45px;
  }
  .top {
    grid-area: top;
  }
  .left {
    grid-area: left;
  }
  .right {
    grid-area: right;
    margin-left: 10px;
  }
</style>

<!-- 
<div class="alignment">
  <div class="icon">
    {@render icon()}
  </div>

  <div class="content">
    {@render top()}

    <div>
      <div class="content-left">
        {@render left()}
      </div>
      {#if right}
        <div class="content-right">
          {@render right()}
        </div>
      {/if}
    </div>
  </div>
</div>
<style>
  .alignment {
    display: flex;
    height: 56px;
    margin: 10px 0px;
  }
  .icon {
    width: auto;
    height: 100%;
  }
  .content {
    padding: 0px 10px;
    width: 0;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

    /* 上側 */
    & > div:first-child {
      width: 100%;
    }

    /* 下側 */
    & > div:last-child {
      display: flex;
      min-width: 0;
      /* align-items:stretch; */
      justify-content: stretch;

      /* 左側 */
      & > .content-left {
        flex: 1 1 0;
        margin-right: 10px;
      }
  
      /* 右側 */
      & > .content-right {
         flex: 0 1 0;
      }
    }
  }
</style>
-->
