// Minimal Web Audio repro harness (starter)
// Goal: keep it tiny and modifiable for debugging clicks/pops/jitter.

const logEl = document.getElementById("log");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const gainSlider = document.getElementById("gain");

let ctx = null;
let osc = null;
let gain = null;

function log(msg) {
  logEl.textContent += msg + "\n";
}

startBtn.onclick = async () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  await ctx.resume();
  log(`sampleRate=${ctx.sampleRate}`);

  osc = ctx.createOscillator();
  gain = ctx.createGain();
  gain.gain.value = Number(gainSlider.value);

  osc.connect(gain).connect(ctx.destination);
  osc.start();
};

stopBtn.onclick = async () => {
  if (osc) osc.stop();
  osc = null;
  if (ctx) await ctx.suspend();
};

gainSlider.oninput = () => {
  if (!gain || !ctx) return;
  const v = Number(gainSlider.value);
  // Replace with ramping/smoothing while debugging clicks/pops:
  gain.gain.setValueAtTime(v, ctx.currentTime);
};

