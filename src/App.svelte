<script>
  import { onMount, setContext } from "svelte";
  import {
    midiSetup,
    inputPorts,
    outputPorts,
    selectedInput,
    selectedOutput,
    ports,
  } from "./stores.js";
  import Dial from "./Dial.svelte";

  // 	onMount(()=> {

  // 	});

  let showConsole = false;
  let connectionInfo = {
    inputs: "",
    outputs: "",
  };
  let messages = "";

  let connectionInfoContainer = null;
  let midiConsoleContainer = null;

  const msgNames = {
    144: "NOTE ON",
    128: "NOTE OFF",
    176: "CC",
  };

  const showConsoleHandler = (ev) => (showConsole = ev.target.checked);

  const sendCC = (num, val, port) => {
    const msg = [0xb0, num, val];
    const output = $midiSetup.outputs.get(port);
    if (output) {
      output.send(msg);
    }
  };

  const onMIDISuccess = (result) => {
    console.log("MIDI ready!", result);
    $midiSetup = result;
    listInputsAndOutputs(result);
    startLoggingMIDIInput(result);
  };

  const onMIDIFailure = (msg) => {
    console.error(`Failed to get MIDI access - ${msg}`);
  };

  const refreshHandler = () => {
    // inputsContainer.innerHTML = "";
    // outputsContainer.innerHTML = "";
    // midiConsoleContainer.innerHTML = "";
    connectionInfo = {
      inputs: "",
      outputs: "",
    };
    $inputPorts = [];
    $outputPorts = [];
    listInputsAndOutputs($midiSetup);
  };

  const setInputHandler = (e) => {
    $selectedInput = e.target.value;
  };

  const setOutputHandler = (e) => {
    $selectedOutput = e.target.value;
  };

  const listInputsAndOutputs = (midiAccess) => {
    const portsObj = {
      inputs: [],
      outputs: [],
    };

    for (const entry of midiAccess.inputs) {
      const input = entry[1];

      connectionInfo[
        "inputs"
      ] += `Input port [type:'${input.type}'] id:'${input.id}' manufacturer:'${input.manufacturer}' name:'${input.name}'<br>`;

      // set inputs in store
      $inputPorts = [...$inputPorts, input.id];

      // populate inputs selector
      portsObj.inputs.push({
        name: input.name,
        id: input.id,
      });
    }

    for (const entry of midiAccess.outputs) {
      const output = entry[1];
      connectionInfo[
        "outputs"
      ] = `Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}'<br>`;

      // set inputs in store
      $outputPorts = [...$outputPorts, output.id];

      // populate outputs selector
      portsObj.outputs.push({
        name: output.name,
        id: output.id,
      });
    }

    // console.log(connectionInfo);
    $ports = portsObj;
  };

  function onMIDIMessage(event) {
    let str = `${msgNames[event.data[0]]} message received at timestamp ${
      event.timeStamp
    }[${event.data.length} bytes]: `;

    for (const character of event.data) {
      str += `0x${character.toString(16)}`;
    }
    if (showConsole) {
      midiConsoleContainer.insertAdjacentHTML("afterbegin", str + "<br>");
    }
  }

  const startLoggingMIDIInput = (midiAccess, indexOfPort) => {
    midiAccess.inputs.forEach((entry) => {
      entry.onmidimessage = onMIDIMessage;
    });
  };

  navigator.requestMIDIAccess().then((access) => {
    access.onstatechange = (event) => {
      console.log(
        "Ports changed",
        event.port.name,
        event.port.manufacturer,
        event.port.state
      );
    };
    onMIDISuccess(access);
  }, onMIDIFailure);

  setContext("sendCcHandler", sendCC);
</script>

<div class="main-wrapper">
  <div class="functions">
    <button id="refresh" on:click={refreshHandler}>refresh</button>
    <select on:change={setInputHandler} bind:value={$selectedInput}>
      <option>select input</option>
      {#each $ports.inputs as input}
        <option value={input.id}>{input.name}</option>
      {/each}
    </select>
    <select on:change={setOutputHandler} bind:value={$selectedOutput}>
      <option>select output</option>
      {#each $ports.outputs as output}
        <option value={output.id}>{output.name}</option>
      {/each}
    </select>
    <input id="show-console" type="checkbox" on:change={showConsoleHandler} />
    <label for="show-console">Show console</label>
  </div>

  {#if showConsole}
    <div class="connection-info">
      <p>{@html connectionInfo.inputs}</p>
      <p>{@html connectionInfo.outputs}</p>
    </div>
    <div class="console" bind:this={midiConsoleContainer} />
  {/if}

  <div class="dials">
    <Dial cc={41} />
    <Dial cc={42} />
    <Dial cc={43} />
    <Dial cc={44} />
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #000;
    color: rgb(129, 111, 92);
    font-size: 11px;
  }

  label {
    display: inline;
  }
  .main-wrapper {
    position: relative;
  }

  .dials {
    display: flex;
    position: absolute;
    left: 50%;
    top: 100px;
    transform: translate(-50%, 0);
  }

  .connection-info {
    font-size: 11px;
  }
</style>
