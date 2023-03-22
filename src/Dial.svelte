<script>
  import { onMount, getContext } from "svelte";
  import { selectedOutput } from "./stores.js";
  import Nexus from "nexusui";
  export let cc;

  let dial;
  let dialElement;
  let label;
  let labelElement;
  let prevVal = 64;

  const sendCC = getContext("sendCcHandler");

  onMount(() => {
    let dial = new Nexus.Dial(dialElement, {
      size: [200, 200],
      interaction: "vertical",
      min: 0,
      max: 127,
      step: 1,
      value: 64,
    });
    dial.colorize("accent", "#ff0");
    dial.colorize("fill", "#333");

    let label = new Nexus.Number(labelElement);
    label.link(dial);

    dial.on("change", (e) => {
      let newVal = Math.floor(e);
      if ($selectedOutput) {
        // debouncing sortof, more change detection
        if (newVal < prevVal || newVal > prevVal) {
          sendCC(cc, newVal, String($selectedOutput));
          prevVal = newVal;
        }
      }
    });
  });
</script>

<div class="dial-wrapper">
  <div class="cc-num">cc:{cc}</div>
  <div class="dial" bind:this={dialElement} />
  <div class="label" bind:this={labelElement} />
</div>

<style>
  .dial-wrapper {
    margin: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .cc-num {
    /* color: white; */
  }
  .label {
    margin: 15px 0;
  }
</style>
