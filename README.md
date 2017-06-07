# Generator-TCG

A command line utility for The Control Group split testing team. An existing directory (the default variation) is cloned and renamed with the desired prefix and suffix. The new files will then serve as a variation against which the control will be tested.

This tool assumes that the user will navigate to the `funnel/source/sections/{section}` directory before running any commands. See below for potential modifications to this functionality.

### How to Use:

When the command "yo tcg" is run in the target directory, you will have to answer four questions. Here's an example of how you might answer:

* **Which directory do you wish to copy?** [gg]
* **Which subdirectory?** [gg-33]
* **Desired prefix?** [jc]
* **Desired suffix?** [01]

The answers above will result in `gg/gg-33` (the folders and all files within) being duplicated and renamed to `jc/jc-01`. To be clear, by "suffix" I am referring to the numerical value *after* the hyphen.

### Existing Features:

* The default variation is cloned into the appropriate directory/sub-directory (which is created if it doesn't yet exist) and all files are renamed according to the desired namespace and suffix.
* Hidden files are prevented from being copied and renamed (.DS_Store, for example).
* Cloning is prevented when the subdirectory already exists.
* The user is alerted when she attempts to copy a directory that does not exist.

### Future Features:

* Create the appropriate subdirectory dynamically (numerically speaking). This would prevent us from having to input the desired suffix manually because it would find the subdirectory with the highest numerical value and then rename the duplicated directory (and the files within) with the **next** numerical value. If the most recent file name is `jc-44.js`, the program will create `jc-45.js`.
* Allow commands to be executed from the *funnel* directory.
* Find a way to eliminate `setTimeout()`.
