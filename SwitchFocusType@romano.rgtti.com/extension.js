// Switch Focus Type extension (c) 2023-2026 Romano Giannetti <romano.giannetti@gmail.com>
// License: GPLv2+, see http://www.gnu.org/licenses/gpl-2.0.txt
//
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const FOCUS_CLICK = 'click';
const FOCUS_MOUSE = 'mouse';
const FOCUS_SLOPPY = 'sloppy';

export default class SwitchFocusType extends Extension {
    enable() {
        this._wmSettings = new Gio.Settings({
            schema: 'org.gnome.desktop.wm.preferences',
        });
        this._settings = this.getSettings();

        // Use the public panel-indicator API instead of inserting a private
        // St.Bin directly into Main.panel._rightBox.
        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, true);
        this._icon = new St.Icon({style_class: 'system-status-icon'});
        this._indicator.add_child(this._icon);

        // Direct actor event signals are deprecated in GNOME Shell 51.
        // ClickGesture also gives us one controller for pointer clicks and
        // touchscreen taps. Recognition happens on release, allowing a
        // pointer/touch sequence to be cancelled before it toggles the mode.
        const clickGesture = new Clutter.ClickGesture({
            required_button: Clutter.BUTTON_PRIMARY,
        });
        clickGesture.connect('recognize', () => this._toggle());
        this._indicator.add_action(clickGesture);

        // Keep the icon synchronized even when another program, such as
        // GNOME Tweaks or dconf-editor, changes the focus mode.
        this._focusModeId = this._wmSettings.connect(
            'changed::focus-mode', () => this._syncIcon());

        // If the preferred FFM variant is changed while FFM is active, apply
        // it immediately. When click-to-focus is active we merely remember the
        // preference for the next toggle.
        this._ffmPreferenceId = this._settings.connect(
            'changed::use-sloppy', () => this._applyPreferredFfmMode());

        this._syncIcon();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._wmSettings.disconnect(this._focusModeId);
        this._settings.disconnect(this._ffmPreferenceId);

        // Destroy the child explicitly; destroying the indicator also releases
        // its actor-owned ClickGesture and the gesture's signal handler.
        this._icon.destroy();
        this._indicator.destroy();

        this._indicator = null;
        this._icon = null;
        this._focusModeId = null;
        this._ffmPreferenceId = null;
        this._wmSettings = null;
        this._settings = null;
    }

    _preferredFfmMode() {
        return this._settings.get_boolean('use-sloppy')
            ? FOCUS_SLOPPY
            : FOCUS_MOUSE;
    }

    _applyPreferredFfmMode() {
        const currentMode = this._wmSettings.get_string('focus-mode');

        // Auto-raise and its delay are native GNOME settings. They remain
        // stored while click-to-focus is active and GNOME applies them only
        // when the focus mode is "mouse" or "sloppy".
        if (currentMode === FOCUS_CLICK)
            return;

        const preferredMode = this._preferredFfmMode();
        if (currentMode !== preferredMode)
            this._wmSettings.set_string('focus-mode', preferredMode);
    }

    _toggle() {
        const currentMode = this._wmSettings.get_string('focus-mode');
        const targetMode = currentMode === FOCUS_CLICK
            ? this._preferredFfmMode()
            : FOCUS_CLICK;

        if (this._settings.get_boolean('show-notifications')) {
            const message = targetMode === FOCUS_CLICK
                ? 'Setting click-to-focus'
                : `Setting focus-follows-mouse (${targetMode})`;
            Main.notify(this.metadata.name, message);
        }

        // The changed::focus-mode signal updates the icon.
        this._wmSettings.set_string('focus-mode', targetMode);
    }

    _syncIcon() {
        const mode = this._wmSettings.get_string('focus-mode');
        const followsMouse = mode !== FOCUS_CLICK;
        const iconStem = followsMouse ? 'fmode' : 'cmode';

        // Reuse one St.Icon. Replacing its GIcon releases the previous value
        // automatically; no temporary St widgets need to be destroyed.
        this._icon.gicon = Gio.icon_new_for_string(
            `${this.path}/icons/${iconStem}.svg`);
        this._indicator.accessible_name = followsMouse
            ? `Focus follows mouse (${mode})`
            : 'Click to focus';
    }
}
