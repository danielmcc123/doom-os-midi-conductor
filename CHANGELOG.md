# Changelog

## 0.7.1 (1 November 2026)

Built on **DOOM OS 0.7.2 (build 359C)** for Roland firmware 5.52, like 0.7.0. Better for running a rig of synths from the SP.

### New
- **Program changes per pattern.** Each pattern can switch devices 1 to 6 to a program of your choice, with a bank sent
  as MSB or LSB. They go out when play starts and when the pattern changes, and only to a synth whose program actually
  changes, so a synth that keeps its program isn't reset. Set them in **MIDI SETTINGS > PATTERN > PROGRAM CHANGES**.
- **MIDI CLOCK setting** in the DOOM OS settings tab, under MIDI CONDUCTOR. **FOLLOW** (the default) starts and stops
  your gear with the SP. With **ALWAYS** the clock never stops, so synths and loopers stay in time while the SP is
  stopped, and you start and stop your gear yourself:
  - **PITCH/SPEED + PATTERN EDIT** starts or stops your gear on its own: on the next bar while a pattern plays, straight
    away when the SP is stopped.
  - **PITCH/SPEED + PATTERN SELECT** starts or stops your gear together with the SP's pattern.
- **Pause the routes.** Hold **SHIFT + REMAIN** to stop everything coming in from your routed devices, and hold it again to
  bring the routes back. Use it when a synth that plays the SP should play only itself for a while.

### Changed
- The SP no longer sends a MIDI Start every time the pattern loops, so gear that follows its clock (a looper, a
  synth's sequencer) runs on instead of jumping back to its start.
- **MIDI SETTINGS > PATTERN** now has PROGRAM CHANGES and CLEAR AUTOMATION.

### Fixed
- MIDI Instrument notes could come out a note or two off (a C played as an A#) depending on the pad. Every pad now
  starts from C3.
- Euclid on a sample pad with GATE off kept playing after the pattern looped. Its rhythm now ends where the pattern
  loops and starts fresh when play starts again.
- The Euclid screen's step marker follows that track's own rhythm.

## 0.7.0 (30 October 2026)

Built on **DOOM OS 0.7.2 (build 359C)** for Roland firmware 5.52. The biggest release yet: MIDI Instruments, MIDI FX,
new device screens and a setup that belongs to each project.

### New
- **DOOM OS 0.7.2 underneath**, with its instrument switching on the fly.
- **MIDI Instruments.** Pick **MIDI** in DOOM OS's instrument picker and tap a pad: it plays your synth, gets a track in
  the pattern, lights blue, and has its own MIDI INSTRUMENT page to choose the synth or a raw channel. This replaces the
  PADS screen.
- **MIDI FX.** Six slots on every track, run in order: Harmonize, Echo, Scale, Chance, Randomize, Dispatch, Euclid,
  Loop Stretch, LFO, ENV and Time Elastic. Open them with **PITCH/SPEED + FX1..FX6**. The CHAIN page
  (**PITCH/SPEED + RECORD SETTING**) switches, reorders and removes effects, and sets each slot's SOURCE (the chain or the
  pad's own note) so Euclids can layer into polyrhythms.
- **MIDI FX on samples and DOOM OS instruments.** The same chains work on sample tracks and on DOOM OS's own instruments:
  repeats, rhythms, chance and, on chromatic pads, chords and scales.
- **Euclid TIE.** Euclid's GATE goes one past 100%: each hit rings until the next, which suits samples.
- **LFO and ENV** move a synth's controls, or the SP's mixer and MIDI FX settings, in time with the music. Pick the
  TARGET from a list with RECORD SETTING.
- **New DEVICES screens**: channel, name, CC names, INPUT ONLY and USAGE (what uses a device). **DEVICES.CSV** brings your
  synths in with their CC names and channels, and exports them again. The [patcher page](patcher.html#devices) makes one from the
  synths you pick.
- **The CC MAP**: map a controller's or a synth's dials to another synth, or to a track's mixer, MIDI FX and EQ, each with
  a range (backwards to invert).
- **GHOST** follows DOOM OS's mixer and EQ: level, pan, bus and EQ like a sample track.
- **Per project.** Devices, routes, CTRLs, MIDI Instruments and MIDI FX belong to each project. Deleting a project deletes
  its MIDI setup too.
- **MIDI Conductor settings** in the DOOM OS settings tab: START ANIM, PICKUP and CTRL VIEW (dials or bars).

### Changed
- **Synths aren't built into the firmware any more.** Pick them on the patcher page, download `DEVICES.CSV` and import it
  on the SP. Change them at any time without patching again.
- Recording dial moves is now **MARK + REC** (SHIFT + VALUE goes back to DOOM OS). Holding **MARK** catches a dial on
  MIDI Controls, GHOST and MIDI FX.
- Setting a CTRL's synth and control on the MIDI Controls page is **RECORD SETTING** (MARK is catch).
- MIDI SETTINGS (SHIFT + REMAIN) has DEVICES, ROUTES and PATTERN. Pads are set up as MIDI Instruments instead.
- Device pickers leave out devices with no channel and input-only devices.

### Coming from 0.6
Your devices, routes and CTRLs move into the first project the SP starts in. Pads you set on the old PADS screen are
cleared after a few seconds: make them again as MIDI Instruments (see the manual). The Arp is left out of MIDI FX in this
release while it is reworked.

## 0.6.5 and earlier

Alpha releases built on DOOM OS 0.6.x (0.6.5: DOOM OS 0.6.2-alpha, build 3824). They can still be patched from
**Earlier versions** on the [patcher](patcher.html#previous), and the 0.6.5 manual is kept at
[releases/0.6.5-alpha/manual.html](releases/0.6.5-alpha/manual.html).
