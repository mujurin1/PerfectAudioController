import { mount } from "svelte";
import "../app.css";
import Popup from "./Popup.svelte";
// import App from "./old.App.svelte";

const app = mount(Popup, {
  target: document.querySelector("#app")!,
  // props: { some: 'property' }
});

export default app;
