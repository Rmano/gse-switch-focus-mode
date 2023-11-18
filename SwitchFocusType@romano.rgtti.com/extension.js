// Switch Focus Type extension (c) 2023 Romano Giannetti <romano.giannetti@gmail.com>
// License: GPLv2+, see http://www.gnu.org/licenses/gpl-2.0.txt
//
import Clutter from 'gi://Clutter';
import St from 'gi://St';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

let button, icon_f, icon_c, wm_prefs, my_prefs;

function _ffm_variant(p_sloppy) {
        if (p_sloppy) {
                return "sloppy"
        } else {
                return "mouse"
        }
}

function _switch() {
	let what=wm_prefs.get_string('focus-mode');
        let pNotify=my_prefs.get_boolean('show-notifications');
        let p_sloppy=my_prefs.get_boolean('use-sloppy');
	if (what == 'click') {
                if (pNotify) {
		        Main.notify("Switch Focus Mode",
                                "Setting Focus-Follow-Mouse(" + _ffm_variant(p_sloppy) + ")");
                }
                button.set_child(icon_f);
		wm_prefs.set_string('focus-mode', _ffm_variant(p_sloppy));
	} else { // sloppy or mouse
                if (pNotify) {
                        Main.notify("Switch Focus Mode", "Setting Click-to-focus");
                }
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
        // get settings
	this._settings = this.getSettings();
	icon_f = new St.Icon({ style_class: 'system-status-icon'});
	icon_f.gicon = Gio.icon_new_for_string(dir + '/icons/fmode.svg');
	icon_c = new St.Icon({ style_class: 'system-status-icon'});
	icon_c.gicon = Gio.icon_new_for_string(dir + '/icons/cmode.svg');
	wm_prefs=new Gio.Settings({schema: 'org.gnome.desktop.wm.preferences'});
        my_prefs= this.getSettings();
        button.connect('button-press-event', _switch);
	// start with the current mode --- sync icon
	_sync();
	Main.panel._rightBox.insert_child_at_index(button, 0);
    }
    disable() {
	Main.panel._rightBox.remove_child(button);
        button.destroy();
        button = null;
        wm_prefs = null;
        my_prefs = null;
        icon_c = null;
        icon_f = null;
    }
}

