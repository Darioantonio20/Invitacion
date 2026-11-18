// Música norteña navideña generada en el navegador (Web Audio API).
// "Jingle Bells" (dominio público) a ritmo de polka norteña:
// acordeón con vibrato + bajo "oom-pah" + tarola.
// Si pones un archivo en /public/musica.mp3, se usará ese en su lugar.

const N = { C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196, A3: 220, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 }

// [nota, beats]
const A = [['E5',1],['E5',1],['E5',2], ['E5',1],['E5',1],['E5',2], ['E5',1],['G5',1],['C5',1.5],['D5',.5], ['E5',4]]
const B1 = [['F5',1],['F5',1],['F5',1.5],['F5',.5], ['F5',1],['E5',1],['E5',1],['E5',.5],['E5',.5],
  ['E5',1],['D5',1],['D5',1],['E5',1], ['D5',2],['G5',2]]
const B2 = [['F5',1],['F5',1],['F5',1],['F5',1], ['F5',1],['E5',1],['E5',1],['E5',.5],['E5',.5],
  ['G5',1],['G5',1],['F5',1],['D5',1], ['C5',4]]
const MELODY = [...A, ...B1, ...A, ...B2]
const CHORDS = ['C','C','C','C','F','C','D','G', 'C','C','C','C','F','C','G','C']
const CH = { C: ['C3','E4','G4','C5'], F: ['F3','F4','A4','C5'], G: ['G3','D4','G4','B4'], D: ['D3','D4','F4','A4'] }
const ALT = { C: 'G3', F: 'C3', G: 'D3', D: 'A3' }

const BPM = 168
const BEAT = 60 / BPM

export function createMusic() {
  let ctx, master, timer, playing = false, nextTime = 0, bar = 0, mIdx = 0, mTime = 0, audioEl

  const tone = (freq, t, dur, type, vol, opts = {}) => {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = type
    o.frequency.value = freq
    if (opts.detune) o.detune.value = opts.detune
    if (opts.vibrato) {
      const l = ctx.createOscillator(), lg = ctx.createGain()
      l.frequency.value = 5.5; lg.gain.value = 6
      l.connect(lg).connect(o.detune); l.start(t); l.stop(t + dur + .1)
    }
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vol, t + (opts.attack ?? .02))
    g.gain.setTargetAtTime(0, t + dur * .85, .04)
    o.connect(g).connect(opts.dest || master)
    o.start(t); o.stop(t + dur + .3)
  }

  const accordion = (f, t, d) => {
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400
    lp.connect(master)
    tone(f, t, d, 'sawtooth', .07, { vibrato: true, dest: lp })
    tone(f, t, d, 'sawtooth', .05, { detune: 9, dest: lp })
    tone(f, t, d, 'square', .025, { detune: -7, dest: lp })
  }

  const snare = (t, vol = .08) => {
    const len = ctx.sampleRate * .08, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
    const s = ctx.createBufferSource(), g = ctx.createGain(), hp = ctx.createBiquadFilter()
    hp.type = 'highpass'; hp.frequency.value = 1500
    s.buffer = buf; g.gain.value = vol
    s.connect(hp).connect(g).connect(master); s.start(t)
  }

  const scheduleBar = (t) => {
    const c = CHORDS[bar % CHORDS.length], [root, ...upper] = CH[c]
    // oom-pah (bajo sexto + bajo): 1 y 3 bajo, 2 y 4 acorde
    for (let b = 0; b < 4; b++) {
      const bt = t + b * BEAT
      if (b % 2 === 0) tone(N[b === 0 ? root : ALT[c]], bt, BEAT * .7, 'triangle', .22)
      else { upper.forEach((n) => tone(N[n], bt, BEAT * .35, 'square', .03, { attack: .005 })); snare(bt) }
    }
    snare(t + 3.5 * BEAT, .04)
  }

  const scheduler = () => {
    while (nextTime < ctx.currentTime + .3) {
      scheduleBar(nextTime)
      const barEnd = nextTime + 4 * BEAT
      while (mTime < barEnd) {
        const [n, beats] = MELODY[mIdx % MELODY.length]
        accordion(N[n], mTime, beats * BEAT * .92)
        mTime += beats * BEAT; mIdx++
      }
      nextTime = barEnd; bar++
    }
  }

  const startSynth = () => {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    ctx.resume()
    master = ctx.createGain(); master.gain.value = .6; master.connect(ctx.destination)
    nextTime = mTime = ctx.currentTime + .1; bar = 0; mIdx = 0
    timer = setInterval(scheduler, 100)
  }

  return {
    get playing() { return playing },
    async play() {
      if (playing) return
      playing = true
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
      ctx.resume()
      audioEl = audioEl || new Audio('/musica.mp3')
      audioEl.loop = true; audioEl.volume = .7
      try { await audioEl.play() } catch { audioEl = null; startSynth() }
    },
    stop() {
      playing = false
      if (audioEl) audioEl.pause()
      clearInterval(timer)
      if (master) { master.gain.setTargetAtTime(0, ctx.currentTime, .05); master = null }
    },
  }
}
