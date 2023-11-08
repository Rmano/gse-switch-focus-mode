// SwitchFocusMode extension (c) 2014 Romano Giannetti <romano.giannetti@gmail.com>
// License: GPLv2+, see http://www.gnu.org/licenses/gpl-2.0.txt
//
// Configuration: choose the kind of FFM you like, be "sloppy" or "mouse"
const FFM_VARIANT='sloppy';

// End configuration
//const Clutter = imports.gi.Clutter;
import Clutter from 'gi://Clutter';
// const St = imports.gi.St;
import St from 'gi://St';
//const Gio = imports.gi.Gio;
import Gio from 'gi://Gio';
// const Main = imports.ui.main;
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

// const ExtensionUtils = imports.misc.extensionUtils;
// const Me = ExtensionUtils.getCurrentExtension();
// seems not useful at all
// import * as Me from './extension.js'

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

let text, button, icon_f, icon_c, wm_prefs;

function _hideMsg() {
	if (text) {
		Main.uiGroup.remove_actor(text);
		text = null;
	}
}

function _showMsg(what) {
	_hideMsg(); // in case it's still linging there
	if (!text) {
		text = new St.Label({ style_class: 'msg-label', text: what });
		Main.uiGroup.add_actor(text);
	}

	text.opacity = 255;
	let monitor = Main.layoutManager.primaryMonitor;
	text.set_position(Math.floor(monitor.width / 2 - text.width / 2),
			Math.floor(monitor.height / 2 - text.height / 2));
        text.ease_property('opacity', 0, { duration: 3000, mode: Clutter.AnimationMode.EASE_OUT_QUAD, onComplete: _hideMsg })
}

function _switch() {
	let what=wm_prefs.get_string('focus-mode');
	if (what == 'click') {
		_showMsg("Setting Focus-follow-mouse");
		button.set_child(icon_f);
		wm_prefs.set_string('focus-mode', FFM_VARIANT);
	} else { // sloppy or mouse
		_showMsg("Setting Click-to-focus");
		button.set_child(icon_c);
		wm_prefs.set_string('focus-mode', 'click');
	}
}

function _sync() {
	let what=wm_prefs.get_string('focus-mode');
	if (what == 'click') {
		button.set_child(icon_c);
	} else { // sloppy or mouse
		button.set_child(icon_f);
	}
}


export default class SwitchFocusType extends Extension {
    constructor(metadata) {
	super(metadata);
	    this._metadata = metadata;
	}
    enable() {
	button = new St.Bin({ style_class: 'panel-button',
		reactive: true,
	       	can_focus: true,
	        track_hover: true });
	let dir;
	dir = this._metadata.path;
	icon_f = new St.Icon({ style_class: 'system-status-icon'});
	icon_f.gicon = Gio.icon_new_for_string(dir + '/icons/fmode.svg');
	icon_c = new St.Icon({ style_class: 'system-status-icon'});
	icon_c.gicon = Gio.icon_new_for_string(dir + '/icons/cmode.svg');
	wm_prefs=new Gio.Settings({schema: 'org.gnome.desktop.wm.preferences'});
	button.connect('button-press-event', _switch);
	// start with the current mode --- sync icon
	_sync();
	Main.panel._rightBox.insert_child_at_index(button, 0);
    }
    disable() {
	Main.panel._rightBox.remove_child(button);
        wm_prefs = null;
        icon_c = null;
        icon_f = null;
        text = null;
        button = null;
    }
}

