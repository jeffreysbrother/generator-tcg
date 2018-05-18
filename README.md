# Generator-TCG

A command line utility for The Control Group split testing team. An existing directory (the default variation) is cloned and renamed according to a pre-established convention. The new files will then serve as a variation against which the control will be tested.

This tool assumes that the user will navigate to the `funnel/` directory before running any commands. Another assumption is that a `config.json` file exists in the `funnel/` directory. The purpose of this file is to specify the developer's initials; it should look something like this:

```
{
  "developer": "jc"
}
```

Please keep in mind that the utility of this tool is very dependent upon your directory structure; if the following structure is not realized, the damn thing probably won't do you any good at all:

```
funnel
└── source
    └── sections
        ├── home
        │   ├── ga
        │   │   └── ga-01
        │   │       ├── ga-01.js
        │   │       ├── ga-01.less
        │   │       └── ga-01.php
        │   └── bm
        │       └── bm-01
        │           ├── bm-01.js
        │           ├── bm-01.less
        │           └── bm-01.php
        └── report-review
            ├── ga
            │   ├── ga-01
            │   │   ├── ga-01.js
            │   │   ├── ga-01.less
            │   │   └── ga-01.php
            │   └── ga-02
            │       ├── ga-02.js
            │       ├── ga-02.less
            │       └── ga-02.php
            └── jc
                └── jc-01
                    ├── jc-01.js
                    ├── jc-01.less
                    └── jc-01.php
```

Chances are, your project will not be structured in this way. If this is the case, you can run the command `yo tcg --create-tree` to generate a dummy file tree just like the one above. After doing this, simply move into the `funnel/` directory and execute `yo tcg` again.

## Installation:

`npm install --global yo generator-tcg`

## How to Use:

When the command `yo tcg` is executed, the user must answer four questions. Here's an example of how one might answer:

* **What section are you working on?**  report-review
* **Which directory do you wish to copy?**  ga-33
* **How many variations would you like?**  1
* **Please enter a short branch description:**  nav

The answers above will result in `ga/ga-33` (the folders and all files within) being duplicated and renamed to `jc/jc-02` (since *my* config file sets developer to "jc", and since in the above example, `jc-02` immediately follows `jc-01`, numerically). TCG's current naming convention is enforced: user's initials (two letters), a hyphen, and 2-3 numbers. The numeric portion of the name will have left padding when the value is less than 10 (`jc-01` rather than `jc-1`).

The generator will then checkout a new branch `jc_report-review_nav`, stage all changes, commit them, and push (setting the upstream to the newly-created branch). However, the last (4th) prompt and all Git commands will be skipped if one of the following is true: 1) the user includes the flag `--skip-git`, 2) the current working directory is not a Git repository.

Two additional prompts will appear if the user has a missing `config.json` file and decides to create and configure it:

* **Create config.json?** Yes
* **What are your initials?** jc

## Existing Features:

* Running the generator will immediately checkout the "master" branch and perform a "git pull", to ensure that all subsequent actions are performed on the most up-to-date code. A new branch will be created, staged, committed, and pushed. However, as mentioned above, this can be prevented by adding the flag `--skip-git`. This might be necessary if you decide to add an additional variation copied from a directory that only exists in the current feature branch. Keep in mind that this flag disables *all* Git actions.
* The default variation is cloned into the appropriate directory/sub-directory (which is created if it doesn't yet exist) and all files are renamed according to whatever files already exist in the target directory (suffixes are incremented numerically).
* Developer initials are retrieved from `funnel/config.json`. This is used to rename the duplicated files and folders.
* Alert user if `config.json` is missing, empty, technically invalid, misconfigured, or if the developer key is set to an empty string.
* Hidden files are prevented from being copied and renamed (.DS_Store, for example).
* User input validation.
* Maximum number of variations is set to 10 (in order to prevent a huge number of files being created inadvertently).
* Handle necessary Git commands to push a new branch to the remote, ensuring that the new branch doesn't already exist locally or remotely.
* Prevent execution of these Git commands if the current working directory is not a Git repo.
* Append comment to the end of the PHP file, e.g. `<!-- copied from ga-33 -->`. This can be prevented by adding the flag `--skip-comment`.

## Future Features:

- [x] Find a way to eliminate `setTimeout()`.
- [x] Create the appropriate subdirectory dynamically (numerically speaking). This would prevent us from having to input the desired suffix manually because it would find the subdirectory with the highest numerical value and then rename the duplicated directory (and the files within) with the **next** numerical value. If the most recent file name is `jc-44.js`, the program will create `jc-45.js`. We could ask the user "How many variations?" instead of expecting them to type the variation names manually. Adam also suggested that we retrieve the developer initials from the config file.
- [x] Allow the generator to also handle the necessary Git commands: checkout new branch, stage changes, commit with message "copied [default variation]", and push. This could be optional functionality (possibly selected as an option in the prompt, or maybe overridden with an additional flag such as "--skip-git").
- [x] Add the ability to check if REMOTE branch exists before doing anything.
- [x] Add the ability to override the default functionality of checking out the master branch. The user might want to duplicate a directory that only exists in the current feature branch (for example, if he suddenly decides to create an additional variation).
- [x] Add a comment to the PHP file denoting which variation was copied.
- [x] If a copied PHP file contains a comment such as `<!-- copied from ga-33 -->`, replace this comment with the appropriate one instead of merely appending another to that file.
- [ ] Allow user to prepare for a route-group test; this requires the ability to duplicate *multiple* directories (within different sections).
- [ ] Autocomplete upon hitting tab during the first two prompts.
- [ ] Retrieve default variation automatically. Maybe ask "Copy default variation?" which defaults to "yes" (so we have the option to select another, if necessary).
- [ ] Populate `config.json` as needed if it is empty.
