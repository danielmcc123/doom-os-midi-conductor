# Changelog

## 0.7.3 (11 November 2026)

Built on **DOOM OS 0.7.3 (build 733D)** for Roland firmware 5.52, like 0.7.2. Fixes for MIDI Instruments and DOOM OS's own
instruments, and Loop Stretch after a Euclid.

### Changed
- **Loop Stretch with SOURCE CHAIN** stretches what the slots before it make: a Euclid's rhythm, an Echo's delays and an
  Arp's rate run in its stretched time, so Euclid then Loop Stretch plays the Euclid's notes, stretched. With SOURCE PAD it
  works as before.

### Fixed
- A new MIDI Instrument didn't get its silent sample on DOOM OS 0.7.3. The pad lit up but had no sample, so it couldn't be
  played from the pad, live or in chromatic mode; only the sequencer played it.
- DOOM OS instruments showed the kit name DOOM where a note belongs, for example OCT DOOM2 instead of OCT C2.

## 0.7.2 (7 November 2026)

Built on **DOOM OS 0.7.3 (build 733D)** for Roland firmware 5.52. MIDI FX gains an Arp with a HUMAN setting and Swing, and a
keyboard plays your MIDI FX wherever you play it.

### New
- **DOOM OS 0.7.3 underneath**, built into the patch as before: patch Roland's 5.52 file. MIDI Conductor 0.7.1 with
  DOOM OS 0.7.2 stays on the patcher page under **Show earlier versions**.
- **The Arp** is in MIDI FX. It plays held notes one at a time: a chord from Harmonize before it, a held step, or pads held
  down. RATE, MODE (UP, DOWN, UP-DN, DN-UP, ORDER, RANDOM, CHORD), OCTAVE, GATE, REPEAT, LATCH, and a RHYTHM: ALL, one of 22
  patterns, or a Euclidean rhythm of 2 to 16 steps with HITS of them played. While the pattern plays it keeps to the
  pattern's grid and starts from its top every time the pattern loops, and a step as long as the whole pattern keeps it
  going every bar. LATCH holds the notes you play; a pattern step's notes end with the step. It stops when the pattern
  stops.
- **HUMAN** on the Arp's third page: each note's velocity and length move a little, more as you turn it
  up. It isn't on the CC map.
- **Swing**, a new MIDI FX. While the pattern plays, every second 1/16 (or 1/8) comes later, from AMOUNT 50 (straight) to
  75. Put it last in the chain, so the notes an Arp, Euclid or Echo before it makes swing too.

### Changed
- **Loop Stretch** no longer has a REPEAT setting: switched on, it stretches. A slot saved with REPEAT OFF loads switched off.
- **Loop Stretch and Time Elastic with SOURCE CHAIN** take the slots before them too, so Harmonize then Loop Stretch
  stretches the chord.
- **PITCH/SPEED on DOOM OS's page** reaches DOOM OS when you let go of it, and not at all when you press another key with
  it. On the mixer, a tap opens the EQ as before, and the gear keys no longer open it.

### Fixed
- A keyboard routed to the SP only ran a sample track's or DOOM OS instrument's MIDI FX while rehearsing or recording. It
  runs them any time now, at the keyboard's pitch.
- A keyboard routed to a synth skipped a MIDI Instrument's MIDI FX until something was recorded on its track.
- The gear keys (PITCH/SPEED + PATTERN EDIT or PATTERN SELECT) did nothing on the MIDI FX screens.

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
