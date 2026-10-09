# Third-party material

**DOOM OS** is by Quintus Oostendorp, released under the MIT licence (`LICENSE-DOOM-OS`). This project is an
add-on built on DOOM OS 0.6.2-alpha (build 3824):

- The patch in `releases/` carries the DOOM OS changes to Roland's firmware together with this project's
  additions, so the patcher produces one image. The DOOM OS part comes from the DOOM OS 0.6.2-alpha release.
- `releases/*/conductor-patcher.js` is adapted from the DOOM OS patcher script (the SHA-256, patch applier
  and page code).

This repository contains **no Roland firmware**. The patcher works on the official Roland file that you supply,
in your browser, and carries only the bytes that differ from it.

SP-404MKII and Roland are trademarks of Roland Corporation. This project is not affiliated with or
endorsed by Roland or by the DOOM OS author.
