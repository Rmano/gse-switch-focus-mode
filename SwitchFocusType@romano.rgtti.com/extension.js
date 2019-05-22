// SwitchFocusMode extension (c) 2014 Romano Giannetti <romano.giannetti@gmail.com>
// License: GPLv2+, see http://www.gnu.org/licenses/gpl-2.0.txt
//
// Configuration: choose the kind of FFM you like, be "sloppy" or "mouse"
const FFM_VARIANT='sloppy';

// End configuration 
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const ExtensionUtils = imports.misc.extensionUtils;
const Meta = ExtensionUtils.getCurrentExtension();
const Util = imports.misc.util;
const Gio = imports.gi.Gio;

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
	Tweener.addTween(text,
			{ opacity: 0,
				time: 3,
		transition: 'easeOutQuad',
		onComplete: _hideMsg });
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

function init() {
	button = new St.Bin({ style_class: 'panel-button',
		reactive: true,
	       	can_focus: true,
	       	x_fill: true,
	      	y_fill: false,
	        track_hover: true });
	Gtk.IconTheme.get_default().append_search_path(Meta.dir.get_child('icons').get_path());
	icon_f = new St.Icon({ icon_name: 'fmode',
		style_class: 'system-status-icon' });
	icon_c = new St.Icon({ icon_name: 'cmode',
		style_class: 'system-status-icon' });
	wm_prefs=new Gio.Settings({schema: 'org.gnome.desktop.wm.preferences'});
	button.connect('button-press-event', _switch);
}

function enable() {
	// start with the current mode --- sync icon 
	_sync();
	Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
	Main.panel._rightBox.remove_child(button);
}
