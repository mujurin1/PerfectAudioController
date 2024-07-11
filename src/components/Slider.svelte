<script lang="ts">
  let {
    step = 1,
    min = 0,
    max = 100,
    value = $bindable(50),
    colorType,
    oninput,
  }: {
    step?: number;
    min?: number;
    max?: number;
    value?: number;
    colorType?: "volume" | "boost";
    oninput?: (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => void;
  } = $props();

  let input = $state<HTMLInputElement>();
  let per = $derived((value - min) / (max - min));

  $effect(() => {
    if (input == null) return;
    input.style.setProperty("--range", `${per * 100}%`);
  });
</script>

<div class="parent">
  <input
    bind:this={input}
    class="zero"
    class:volume={colorType === "volume"}
    class:boost={colorType === "boost"}
    class:zero={per === 0}
    type="range"
    {step}
    {min}
    {max}
    bind:value
    {oninput}
  />
</div>

<style>
  .parent {
    min-height: 10px;
    padding: 3px 0px;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  input[type="range"] {
    cursor: pointer;
    height: 6px;
    width: 100%;
    min-width: 80px;
    margin: 0px 0px 0px 0px;
    border-radius: 5px;

    background-image: linear-gradient(to right, #000, #e5dd73);
    background-size: var(--range, 0%) 100%;
    background-color: #d7d7d7;
    background-repeat: no-repeat;

    &,
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
    }

    &::-webkit-slider-thumb {
      position: relative;
      height: 15px;
      width: 15px;
      background: #bbba54;
      border-radius: 50%;
      /* border: 2px solid #e6e6e6; */
      transition:
        width 0.15s ease-in-out,
        height 0.15s ease-in-out,
        transform 0.3s ease-in-out;
    }

    &:hover::-webkit-slider-thumb {
      width: 18px;
      height: 18px;
      transition: background 0.3s ease-in-out;
    }

    &.volume {
      background-image: linear-gradient(to right, hsl(240, 100%, 75%), hsl(240, 100%, 75%));
      &::-webkit-slider-thumb {
        background: hsl(240, 100%, 83%);
      }
    }
    &.boost {
      background-image: linear-gradient(to right, hsl(345, 100%, 75%), hsl(345, 100%, 75%));
      &::-webkit-slider-thumb {
        background: hsl(345, 100%, 83%);
      }
    }
    &.zero::-webkit-slider-thumb {
      background: gray;
    }
  }
</style>
