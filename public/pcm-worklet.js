// PCM downsampler AudioWorklet
// Receives Float32 mono audio at the AudioContext's native sampleRate,
// downsamples to a target rate (default 16000), converts to Int16 PCM,
// and posts ArrayBuffers back to the main thread.

class PCMWorklet extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const opts = (options && options.processorOptions) || {};
    this.targetSampleRate = opts.targetSampleRate || 16000;
    this.inputSampleRate = sampleRate; // global in AudioWorkletGlobalScope
    this.ratio = this.inputSampleRate / this.targetSampleRate;
    this._buffer = [];
    this._bufferLen = 0;
    // ~100ms chunks at target rate
    this._chunkSize = Math.floor(this.targetSampleRate * 0.1);
  }

  _flushIfReady() {
    if (this._bufferLen < this._chunkSize) return;
    // Concatenate
    const merged = new Float32Array(this._bufferLen);
    let offset = 0;
    for (const part of this._buffer) {
      merged.set(part, offset);
      offset += part.length;
    }
    this._buffer = [];
    this._bufferLen = 0;

    // Downsample (simple decimation with averaging)
    const outLen = Math.floor(merged.length / this.ratio);
    const out = new Int16Array(outLen);
    let pos = 0;
    for (let i = 0; i < outLen; i++) {
      const start = Math.floor(i * this.ratio);
      const end = Math.floor((i + 1) * this.ratio);
      let sum = 0;
      let count = 0;
      for (let j = start; j < end && j < merged.length; j++) {
        sum += merged[j];
        count++;
      }
      const sample = count > 0 ? sum / count : 0;
      const s = Math.max(-1, Math.min(1, sample));
      out[pos++] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    this.port.postMessage(out.buffer, [out.buffer]);
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;
    const channel = input[0];
    if (!channel) return true;
    // Copy because the underlying buffer is reused by the runtime
    const copy = new Float32Array(channel.length);
    copy.set(channel);
    this._buffer.push(copy);
    this._bufferLen += copy.length;
    this._flushIfReady();
    return true;
  }
}

registerProcessor("pcm-worklet", PCMWorklet);
