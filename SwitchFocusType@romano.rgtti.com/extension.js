const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const ExtensionUtils = imports.misc.extensionUtils;
const Meta = ExtensionUtils.getCurrentExtension();
const Util = imports.misc.util;

let text, button, icon_f, icon_c;

var focus;
const FFM=0;
const CTF=0;

function _set_FFM() {
	Util.spawn(['gsettings', 'set', 'org.gnome.desktop.wm.preferences', 'focus-mode', 'sloppy']);
}

function _set_CTF() {
	Util.spawn(['gsettings', 'set', 'org.gnome.desktop.wm.preferences', 'focus-mode', 'click']);
}


function _hideMsg() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _showMsg(what) {
    if (!text) {
        text = new St.Label({ style_class: 'helloworld-label', text: what });
        Main.uiGroup.add_actor(text);
    }

    text.opacity = 255;
    let monitor = Main.layoutManager.primaryMonitor;
    text.set_position(Math.floor(monitor.width / 2 - text.width / 2),
                      Math.floor(monitor.height / 2 - text.height / 2));
    Tweener.addTween(text,
                     { opacity: 0,
                       time: 2,
                       transition: 'easeOutQuad',
                       onComplete: _hideMsg });
}

function _switch() {
	if (focus == FFM) {
		focus = CTF;
		_showMsg("Setting Click-to-focus");
		button.set_child(icon_c);
		_set_CTF();
	}
	else {
		focus = FFM;
		_showMsg("Setting Focus-follow-mouse");
    		button.set_child(icon_f);
		_set_FFM();
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
    button.set_child(icon_f);
    focus = FFM;
    _set_FFM();
    button.connect('button-press-event', _switch);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
