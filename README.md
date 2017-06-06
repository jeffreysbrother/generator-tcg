# Generator-TCG

A command line utility for The Control Group split testing team. An existing directory (the default variation) is cloned and renamed with the desired prefix and suffix. The new files will then serve as a variation against which the control will be tested.

This tool assumes that the user will navigate to the `funnel/source/sections/{section}` directory before running any commands. See below for potential modifications to this functionality.

### Existing Features:

* clone default variation into the appropriate directory/sub-directory, rename all files according to desired namespace and suffix.
* rename `.jsrc` files to `.js`
* prevent hidden files from being copied and renamed (.DS_Store, for example)
* cloning is prevented when the subdirectory already exists

### Future Features:

* create the appropriate subdirectory dynamically (numerically speaking). This would prevent us from having to input the desired suffix manually because it would find the subdirectory with the highest numerical value and then rename the duplicated directory (and the files within) with the **next** numerical value. If the "greatest" value is `jc-44.js`, it would create `jc-45.js`.
* What if both .jsrc AND .js files exist? Maybe use the [glob module](https://www.npmjs.com/package/glob).
  * if .jsrc and .js exist OR if only .js exists, do not rename the extensions. (there is currently an issue here; if both exist, the contents of the .jsrc file overrides the existing contents of the .js file and the original .jsrc is deleted)
  * if only .jsrc exists, convert to .js.
  * if neither exist, print a message: "No JSRC or JS files exist!"
  * (other fringe cases) if there are multiple .js files, multiple .jsrc files, or if there are no .js or .jsrc files
* convert to ES6 syntax?
  * possibly with [this plugin](https://www.npmjs.com/package/js-beautify)
* modify so commands can be executed from the *funnel* directory.
* is there a way to eliminate the setTimeout() function? We need to force synchronous execution in the renameJS() method.
* need a way to handle the error that arises after attempting to copy a directory that doesn't exist
