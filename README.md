# Generator-TCG

A command line utility for The Control Group split testing team. An existing directory (the default variation) is cloned and renamed with the desired prefix and suffix. The new files will then serve as a variation against which the control will be tested.

This tool assumes that the user will navigate to the `funnel/source/sections/{section}` directory before running any commands. See below for potential modifications to this functionality.

### Existing Features:

* clone default variation into the appropriate directory/sub-directory, rename all files according to desired namespace and suffix.
* rename `.jsrc` files to `.js`
* prevent hidden files from being copied and renamed (.DS_Store, for example)
* cloning is prevented when the subdirectory already exists

### Future Features:

* create the appropriate subdirectory (numerically speaking) dynamically. This would prevent us from having to input the desired suffix.
* What if both .jsrc AND .js files exist? Maybe use the [glob module](https://www.npmjs.com/package/glob).
  * if .jsrc and .js exist OR if only .js exists, do nothing.
  * if only .jsrc exists, convert to .js.
  * if neither exist, print a message: "No JSRC or JS files exist!"
* convert to ES6 syntax?
  * possibly with [this plugin](https://www.npmjs.com/package/js-beautify)
* modify so commands can be executed from the *funnel* directory.
