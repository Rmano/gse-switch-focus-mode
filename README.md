# Switch Focus Type gnome-shell extension

By Romano Giannetti <romano@rgtti.com> , <romano.giannetti@gmail.com>

Icons based on LockKeys extension by Kazimieras Vaina *et al.* at https://extensions.gnome.org/extension/36/lock-keys/

You are on the `master` branch (Gnome Shell version ≥ 45).

### Rationale

This extension is oriented to user that likes to have their focus
mode set to "sloppy" (an enhanced focus-follow-mouse mode, FFM), or "mouse", but sometimes
they need to switch to the click-to-focus (CTF) mode because some program
misbehave: for example, a lot of programs running under `wine` will fail
to correctly show menus when in Focus Follow Mouse (the menu disappears shortly
after popping up because the window which is the menu is unable to get focus).
Notice that most of the time, you want to set `auto-raise` with FFM:

    dconf write /org/gnome/desktop/wm/preferences/auto-raise true

More settings are available with `gnome-tweaks`.

### Features

Click on the icon to change from FFM (_F_ icon) to CTF (_C_ icon).
Each click toggle the status.

There are three main branches in the repository: the **legacy** one, for Gnome Shells up to 3.36, the **legacy2** branch, for shells from 3.38 to 44 (authored by @F-i-f), and **master** for newer versions.

Works on gnome-shell 3.10 to 3.36, (`legacy` branch), and 3.38 to 44 (`legacy2` branch), and on 45 (`master` branch).

The options for activating or not the notifications or for choosing between `sloppy` and `mouse` mode are available only from gnome 45 (version 13).

If you want to test it on another version,
just try to add the version to `metadata.json` and tell me if it works for you.

![Screencast](https://raw.githubusercontent.com/Rmano/gse-switch-focus-mode/master/screencast.gif)


### Install

You can install this extension from [the Gnome extensions site](https://extensions.gnome.org/); the correct version *should* be used automatically.


If you want to install from source, just copy/link the directory `SwitchFocusType@romano.rgtti.com` to your
`~/.local/share/gnome-shell/extensions/`, restart the shell, enable it with
`gnome-tweak-tool` or equivalent. If you clone the repository, remember to check out the correct branch with `git checkout master` or `git checkout legacy` depending on the version of your shell.

By default it switches between "sloppy" and "click" to focus modes, and it notifies every change;
the behavior is adjustable with the options (you can access them with your extension manager of choice).

To change other options (like for example auto-raise behavior and similar)
open `dconf-editor`  (install it if you need to) and navigate to the schema
`org.gnome.desktop.wm.preferences`: you will find all the other
options there; this extension will touch only the `focus-mode` key and
leave alone all the others parameters.


