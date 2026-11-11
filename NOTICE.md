# Licences

This project's own work is under the PolyForm Shield License 1.0.0 (`LICENSE`). The third-party material below keeps
its own licence. Releases up to 0.6.4 were published under MIT.

# Third-party material

**DOOM OS** is by Quintus Oostendorp and is used with his permission. `LICENSE-DOOM-OS` is the MIT licence DOOM OS
had when this project began, on 0.6.1-alpha; DOOM OS has its own licence now, published with it. This project is an
add-on built on DOOM OS (the current release on DOOM OS 0.7.3, build 733D; each release says which it is built on):

- The patch in `releases/` carries the DOOM OS changes to Roland's firmware together with this project's
  additions, so the patcher produces one image. The DOOM OS part comes from the DOOM OS release it is built on.
- `releases/*/conductor-patcher.js` is adapted from the DOOM OS patcher script (the SHA-256, patch applier
  and page code).

**Mutable Instruments Yarns: arpeggiator rhythm patterns**

The 22 rhythm patterns of the MIDI FX Arp come from Mutable Instruments Yarns
(`eurorack/yarns/resources.cc`, `lut_arpeggiator_patterns`, https://github.com/pichenettes/eurorack).

Copyright 2013 Emilie Gillet.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

This repository contains **no Roland firmware**. The patcher works on the official Roland file that you supply,
in your browser, and carries only the bytes that differ from it.

SP-404MKII and Roland are trademarks of Roland Corporation. This project is not affiliated with or
endorsed by Roland or by the DOOM OS author.
