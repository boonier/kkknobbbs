import { writable } from "svelte/store";

export const midiSetup = writable(0);

export const selectedInput = writable(
  localStorage.getItem("selectedInput") || ""
);
selectedInput.subscribe((val) => {
  localStorage.setItem("selectedInput", val);
});

export const selectedOutput = writable(
  localStorage.getItem("selectedOutput") || ""
);
selectedOutput.subscribe((val) => {
  localStorage.setItem("selectedOutput", val);
});

export const ports = writable({
  inputs: [],
  outputs: [],
});
export const inputPorts = writable([]);
export const outputPorts = writable([]);
