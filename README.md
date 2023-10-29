# Switch Focus Type gnome-shell extension

By Romano Giannetti <romano@rgtti.com> , <romano.giannetti@gmail.com>

Icons based on LockKeys extension by Kazimieras Vaina et al. at https://extensions.gnome.org/extension/36/lock-keys/

You are on the `master` branch (Gnome Shell version ≥ 45, still ***not working***).

### Rationale

This extension is oriented to user that likes to have their focus
mode set to "sloppy" (an enhanced focus-follow-mouse mode, FFM), but sometime
they need to switch to the click-to-focus (CTF) mode because some program
misbehave: for example, a lot of programs running under wine will fail
to correctly show menus when in Focus Follow Mouse (the menu disappears shortly
after popping up because the window which is the menu is unable to get focus).

### Features

Click on the icon to change from FFM (_F_ icon) to CTF (_C_ icon).
Each click toggle the status.

There are three main branches in the repository: the **legacy** one, for Gnome Shells up to 3.36, the **legacy2** branch, for shells from 3.38 to 44 (authored by @F-i-f), and **master** for newer versions.

Works on gnome-shell 3.10 to 3.36, (`legacy` branch), and 3.38 to 44 (`legacy2` branch). **Currently it does not work for Gnome Shell 45 and newer.**

If you want to test it on another version,
just try to add the version to `metadata.json` and tell me if it works for you.

![Screencast](https://raw.githubusercontent.com/Rmano/gse-switch-focus-mode/master/screencast.gif)

### Install

You can install this extension from [the Gnome extensions site](https://extensions.gnome.org/); the correct version *should* be used automatically.


If you want to install from source, just copy/link the directory `SwitchFocusType@romano.rgtti.com` to your
`~/.local/share/gnome-shell/extensions/`, restart the shell, enable it with
`gnome-tweak-tool` or equivalent. If you clone the repository, remember to check out the correct branch with `git checkout master` or `git checkout legacy` depending on the version of your shell.

Normally switch between "sloppy" and "click" to focus modes. If you prefer
"mouse" mode, edit the file `extensions.js` and change the line

    const FFM_VARIANT='sloppy';

to

    const FFM_VARIANT='mouse';

To change other options (like for example auto-raise behavior and similar)
open `dconf-editor`  (install it if you need to) and navigate to the schema
`org.gnome.desktop.wm.preferences` --- you will find all the other
options there; this extension will touch only the `focus-mode` key and
leave alone all the others parameters.

### Known issues

* Should be configurable to choose between "sloppy" and "mouse" mode,
if I could only find how to do it :-)
* The icon will not be highlighted on mouse-over (?)

