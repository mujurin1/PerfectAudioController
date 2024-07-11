<script context="module" lang="ts">
  let logs = $state<Record<string, unknown>>({});

  export function setLog(key: undefined | string, message: unknown) {
    // logs.set(key, message);
    logs[key!] = message;
  }
</script>

<script lang="ts">
</script>

<div>
  {#each Object.values(logs) as log}
    <p>{log}</p>
  {/each}
</div>
