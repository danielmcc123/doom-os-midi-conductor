# DOOM OS MIDI Conductor

Play, sequence and tweak your synths from the SP-404MKII. Pads play notes, CTRL dials send CC, and patterns drive
every synth on its own channel. Built on [DOOM OS](https://klangfeldlabs.com/doom-os/), which is included.

**Guide and patcher: https://danielmcc123.github.io/doom-os-midi-conductor/**

> **Experimental.** Modified firmware can brick your SP-404MKII. This is tested on one unit only, with Roland 5.52
> and DOOM OS 0.6.2-alpha (build 3824), and it changes some of Roland's own routines. Keep Roland's original files
> so you can go back.

## What it does

- **Sequence your synths.** Pattern steps go out as MIDI notes, each pad on its own synth. Piano-roll pitches come along.
- **36 dials of CC.** Six banks of six CTRLs, each sending any CC to any synth. SHIFT + FX1..FX6 picks the bank.
- **Record dial moves.** SHIFT + VALUE records CTRL moves into the pattern. Each pattern keeps its own, saved on the SP.
- **Knows your synths.** Pick `CUTOFF`, not CC 43. Built-in lists for the Korg Minilogue, NTS-1 and volcas,
  Behringer Grind and TD-3-MO, Roland S-1, Elektron Digitone II and Audiothingies MicroMonsta 2, or load your own.
- **Route synth to synth.** Play one synth's keys and another plays along; map one synth's dials onto another's controls.
- **All on the unit.** SHIFT + REMAIN sets up synths, pads and routes, with a help line on every screen.
- **Effect motion** from DOOM OS goes out as CC too.

## Up and running

1. Download Roland's SP-404MKII system update **5.52** and unzip it. It isn't in this repository.
2. Drop `SP404MKII_APP1.bin` on the [patcher](https://danielmcc123.github.io/doom-os-midi-conductor/patcher.html)
   and pick your synths. It runs in your browser, uploads nothing, and refuses anything but Roland's stock 5.52.
3. Keep the name `SP404MKII_APP1.bin` and install it with Roland's original `SP404MKII_APP0.bin`, the same way as
   DOOM OS ([DOOM OS manual](https://klangfeldlabs.com/doom-os/manual/)). DOOM OS is already inside.
4. Follow the [quick start](https://danielmcc123.github.io/doom-os-midi-conductor/manual.html#quick): a synth on a
   pad and a dial in five steps.

To go back, install Roland's original files. `patcher.html` also works from a downloaded copy of this repository.

## Files

`releases/<version>/` holds each release's patcher script and `checksums.txt`, with the SHA-256 of the stock and
patched images so you can check your file. Older releases are kept for reference; 0.1.0 was built on DOOM OS
0.6.1-alpha (ED5E).

## Credits and licence

- **DOOM OS** by Quintus Oostendorp (MIT), the foundation of everything here:
  [klangfeld-labs/doom-os](https://github.com/klangfeld-labs/doom-os). Its licence is `LICENSE-DOOM-OS`.
- This project is MIT licensed (`LICENSE`). Third-party notes are in `NOTICE.md`.
- Not affiliated with Roland or the DOOM OS author.
