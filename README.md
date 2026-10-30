# DOOM OS MIDI Conductor

Play, sequence and tweak your synths from the SP-404MKII. Pads play notes, CTRL dials send CC, and patterns drive
every synth on its own channel. Built on [DOOM OS](https://klangfeldlabs.com/doom-os/), which is included.

**Guide and patcher: https://danielmcc123.github.io/doom-os-midi-conductor/**

> **Experimental.** Modified firmware can brick your SP-404MKII. This is tested on one unit only, with Roland 5.52
> and DOOM OS 0.7.2 (build 359C), and it changes some of Roland's own routines. Keep Roland's original files
> so you can go back.

## What it does

- **Sequence your synths.** Pick MIDI in DOOM OS's instrument picker and a pad plays your synth, with its own track.
  Pattern steps go out as MIDI notes, piano-roll pitches and all.
- **MIDI FX.** Six slots on every track: Harmonize, Echo, Scale, Chance, Randomize, Dispatch, Euclid, Loop Stretch, LFO,
  ENV and Time Elastic. They work on samples and DOOM OS's instruments too. PITCH/SPEED + FX1..FX6 opens a slot.
- **36 dials of CC.** Six banks of six CTRLs, each sending any CC to any synth. SHIFT + FX1..FX6 picks the bank.
- **Record dial moves.** MARK + REC records CTRL moves into the pattern. Each pattern keeps its own, saved on the SP.
- **Knows your synths.** Pick `CUTOFF`, not CC 43. Built-in lists for the Korg Minilogue, MS2000, NTS-1 and volcas,
  Behringer Grind and TD-3-MO, Roland S-1, Novation Bass Station II, Yamaha MODX M, Elektron Digitone II and
  Audiothingies MicroMonsta 2, or load your own with `DEVICES.CSV`.
- **Route synth to synth.** Play one synth's keys and another plays along; map dials onto another synth's controls, or
  onto the SP's mixer, EQ and MIDI FX, with the CC MAP.
- **All on the unit, per project.** SHIFT + REMAIN sets up synths and routes, with a help line on every screen. Each
  project keeps its own setup.
- **Play and record the SP from a keyboard.** Notes routed to the SP play the pad of DOOM OS's current track, pitched,
  and are recorded in record mode with their pitch and velocity.

## Up and running

1. Download Roland's SP-404MKII system update **5.52** and unzip it. It isn't in this repository.
2. Drop `SP404MKII_APP1.bin` on the [patcher](https://danielmcc123.github.io/doom-os-midi-conductor/patcher.html)
   and pick your synths. It runs in your browser, uploads nothing, and refuses anything but Roland's stock 5.52.
3. Keep the name `SP404MKII_APP1.bin` and install it the same way as DOOM OS ([DOOM OS manual](https://klangfeldlabs.com/doom-os/manual/)). DOOM OS is already inside.
4. Follow the [quick start](https://danielmcc123.github.io/doom-os-midi-conductor/manual.html#quick): a synth on a
   pad and a dial in six steps.

To go back, install Roland's original files. `patcher.html` also works from a downloaded copy of this repository.
What changed in each release is in [CHANGELOG.md](CHANGELOG.md).

## Files

`releases/<version>/` holds each release's patcher script and `checksums.txt`, with the SHA-256 of the stock and
patched images so you can check your file. 0.7.0 is built on DOOM OS 0.7.2 (359C). 0.6.5 (DOOM OS 0.6.2-alpha, 3824)
can still be patched from **Previous versions** on the patcher page, and its manual is in `releases/0.6.5-alpha/`. Older
releases are kept for reference; 0.1.0 was built on DOOM OS 0.6.1-alpha (ED5E).

## Credits and licence

- **DOOM OS** by Quintus Oostendorp, the foundation of everything here, used with permission:
  [klangfeld-labs/doom-os](https://github.com/klangfeld-labs/doom-os). `LICENSE-DOOM-OS` is the MIT licence it had on 0.6.1-alpha; its current licence is in its repository.
- MIDI Conductor's own work is licensed under the PolyForm Shield License 1.0.0 (`LICENSE`). In plain words: it is free to use,
  including for making music, and you are welcome to link to the patcher page. It is free and meant to stay that way, so the licence
  doesn't let anyone else sell it or build a rival product from it. DOOM OS is used with permission from Quintus Oostendorp
  (see `NOTICE.md`). Releases up to 0.6.4 were published under MIT. Third-party notes are in `NOTICE.md`.
- Not affiliated with Roland or the DOOM OS author.
