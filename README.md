# DOOM OS MIDI Conductor

Play, shape and record your synths from the SP-404MKII, several at once. Pads, CTRL knobs and the sequencer send
MIDI to the gear on the DIN output, each device on its own channel. An add-on for
[DOOM OS](https://klangfeldlabs.com/doom-os/), included in the patch.

**Guide and patcher: https://danielmcc123.github.io/doom-os-midi-conductor/**

> **DOOM OS is included.** The patcher turns Roland's stock 5.52 into one firmware file that contains DOOM OS
> 0.6.2-alpha (build 3824) and the MIDI Conductor together. You don't patch DOOM OS separately, and the patcher
> only accepts Roland's stock file, so it won't touch a file that already has a different DOOM OS in it.
>
> **Experimental. Use at your own risk.** Flashing modified firmware can brick a unit. This is only tested on
> one SP-404MKII running Roland 5.52 with DOOM OS 0.6.2-alpha (build 3824). It changes a few of Roland's own
> routines, which adds risk of its own. Keep your original Roland files so you can go back.

## What you get

- **36 MIDI CTRLs in six banks.** The CTRL knobs send CCs on any channel instead of changing the effect.
  Pick a bank with SHIFT + FX1..FX6.
- **Edit on the unit.** SHIFT + MARK edits each CTRL's device, channel and CC. Settings are saved.
- **Sequence your synths.** Pattern steps play out of the DIN MIDI output as notes on each pad's channel, so one
  pattern plays several synths. See the manual's "Sequence your synths".
- **Per-pad MIDI channels.** Every pad sends notes on its own channel (a pad with no channel sends no note).
  Seven device slots with names.
- **Named CCs** for the Korg Minilogue and NTS-1.
- **Pitched steps.** DOOM's piano roll sends the right note, with the pitch added.
- **Record knob moves.** SHIFT + VALUE records your CTRL moves into the pattern; they play back as CC.
- **Effect motion playback** also goes out as CC.

See the [manual](https://danielmcc123.github.io/doom-os-midi-conductor/manual.html) for every key combo.

## Install

You need Roland's official 5.52 firmware. This repository doesn't include or distribute it.

1. Download Roland's SP-404MKII system update 5.52 and unzip it.
2. Open the [patcher](https://danielmcc123.github.io/doom-os-midi-conductor/patcher.html) and drop
   `SP404MKII_APP1.bin` on it. It runs in your browser and uploads nothing. It checks the file is exactly
   Roland 5.52 and refuses anything else.
3. Download the patched file, keep the name `SP404MKII_APP1.bin`, and use it with Roland's original
   `SP404MKII_APP0.bin`.
4. DOOM OS is already inside the patched file, so there's nothing else to download. Install it the way you install DOOM OS (see the [DOOM OS guide](https://klangfeldlabs.com/doom-os/manual/)).
   To go back, install the original Roland files.

You can also open `patcher.html` from a downloaded copy of this repository.

## Files

`releases/0.2.0-alpha/` holds the patcher script and the checksums of the stock and patched images. The patched
image's SHA-256 is in `checksums.txt`, so you can confirm that what you download matches. `releases/0.1.0-alpha/` is the earlier release, built on DOOM OS 0.6.1-alpha (ED5E), kept for reference.

## Credits and licence

- **DOOM OS** by Quintus Oostendorp (MIT), the foundation of everything here:
  [klangfeld-labs/doom-os](https://github.com/klangfeld-labs/doom-os). `LICENSE-DOOM-OS` is its licence.
- This project is MIT licensed, see `LICENSE`. Third-party notes are in `NOTICE.md`.
- Not affiliated with Roland or the DOOM OS author.
