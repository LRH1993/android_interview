
1.0.1 / 2016-01-03
==================

  * add missing HandleScope in callback (#67, @laverdet)
  * add Travis support for v4.x, v5.x (#60, @robcolburn)
  * appveyor: place .bin into the $PATH

1.0.0 / 2015-08-17
==================

  * added `removeCallback()` and `removeCallbacks()`
  * appveyor: attempt to fix node v0.8
  * appveyor: test x86 and x64
  * travis: attempt to fix node v0.8
  * travis: test "iojs"
  * travis: run on new infrastructure
  * package: update to NAN 2.0 (@kkoopa)
  * package: stricter "bindings" version number
  * package: specify "MIT" license
  * README: update for API change

0.4.1 / 2015-05-09
==================

  * Update to nan ~1.8.4 (#47, @imyller)
  * appveyor: test node v0.12 instead of v0.11

0.4.0 / 2015-02-18
==================

  * travis: test node v0.12
  * package: update "nan" to v1.6.2 for Node v0.12 compatibility (#40, @GitStarInc)
  * src: call callback directly to avoid unwanted preemption (#36)

0.3.4 / 2015-01-27
==================

  * Update dependencies to also work with IO.js #39 (#40, @GitStarInc)
  * Revert "appveyor: attempt to test x86 and x64, Debug and Release configs"
  * appveyor: attempt to test x86 and x64, Debug and Release configs

0.3.3 / 2014-06-04
==================

  * appveyor: more generic comment
  * package: update "mocha" to v1.20.1
  * package: update "nan" to v1.2.0

0.3.2 / 2014-05-25
==================

  * add appveyor.yml file for Windows testing
  * README: use SVG Travis badge
  * README: add appveyor build badge
  * README: correct docs for the callback (#29, @metamatt)
  * .travis: don't test node v0.9.x
  * weakref: fix deprecation warning after nan upgrade
  * weakref: remove "printf()" calls
  * weakref: update for nan v1 API changes
