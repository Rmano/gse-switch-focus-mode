// Switch Focus Type extension (c) 2023-2026 Romano Giannetti <romano.giannetti@gmail.com>
// License: GPLv2+, see http://www.gnu.org/licenses/gpl-2.0.txt
//
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class SwitchFocusTypePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Keep both settings objects alive for as long as the preferences
        // window exists. Auto-raise values deliberately use GNOME's native
        // schema so this UI remains synchronized with Tweaks and dconf-editor.
        window._settings = this.getSettings();
        window._wmSettings = new Gio.Settings({
            schema: 'org.gnome.desktop.wm.preferences',
        });

        const page = new Adw.PreferencesPage({
            title: 'General',
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const generalGroup = new Adw.PreferencesGroup({
            title: 'General',
        });
        page.add(generalGroup);

        const rowNotification = new Adw.SwitchRow({
            title: 'Show Notifications',
            subtitle: 'Whether to show a notification on change',
        });
        generalGroup.add(rowNotification);

        const ffmGroup = new Adw.PreferencesGroup({
            title: 'Focus follows mouse',
            description: 'Configure the mode selected by the panel button',
        });
        page.add(ffmGroup);

        // Keep the existing boolean setting and bind it directly to a switch.
        // Sloppy is the recommended and schema-default FFM mode.
        const rowSloppy = new Adw.SwitchRow({
            title: 'Use sloppy focus (recommended)',
            subtitle: 'When disabled, focus follows the pointer strictly',
        });
        ffmGroup.add(rowSloppy);

        const rowAutoRaise = new Adw.SwitchRow({
            title: 'Automatically raise focused windows',
            subtitle: 'Only applies to Follow mouse and Sloppy modes',
        });
        ffmGroup.add(rowAutoRaise);

        // GNOME defines this setting as an integer in the range 0..10000 ms,
        // with 500 ms as its system default. A 50 ms step is fine-grained
        // enough for tuning without making keyboard adjustment tedious.
        const rowAutoRaiseDelay = new Adw.SpinRow({
            title: 'Auto-raise delay (ms)',
            subtitle: 'Time before the focused window is raised',
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 10000,
                step_increment: 50,
                page_increment: 500,
                value: window._wmSettings.get_int('auto-raise-delay'),
            }),
            digits: 0,
            numeric: true,
            snap_to_ticks: true,
        });
        ffmGroup.add(rowAutoRaiseDelay);

        window._settings.bind(
            'show-notifications',
            rowNotification,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        window._settings.bind(
            'use-sloppy',
            rowSloppy,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        // Bind the native boolean directly. Reusing it for sensitivity makes
        // the delay visibly inapplicable while auto-raise is disabled.
        window._wmSettings.bind(
            'auto-raise',
            rowAutoRaise,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        window._wmSettings.bind(
            'auto-raise',
            rowAutoRaiseDelay,
            'sensitive',
            Gio.SettingsBindFlags.GET
        );

        // SpinRow.value is a double whereas the GNOME key is an integer, so a
        // normal Gio.Settings.bind() would have incompatible property types.
        // Round on writes and also follow changes made by another program.
        const delayRowId = rowAutoRaiseDelay.connect(
            'notify::value',
            () => {
                const delay = Math.round(rowAutoRaiseDelay.value);

                if (window._wmSettings.get_int('auto-raise-delay') !== delay)
                    window._wmSettings.set_int('auto-raise-delay', delay);
            }
        );

        const delaySettingsId = window._wmSettings.connect(
            'changed::auto-raise-delay',
            () => {
                const delay =
                    window._wmSettings.get_int('auto-raise-delay');

                if (rowAutoRaiseDelay.value !== delay)
                    rowAutoRaiseDelay.value = delay;
            }
        );

        // Preferences run outside GNOME Shell, where connectObject() is not
        // available. Disconnect both sides of the manual delay synchronization
        // while the widget and settings object are still alive.
        window.connect('close-request', () => {
            rowAutoRaiseDelay.disconnect(delayRowId);
            window._wmSettings.disconnect(delaySettingsId);
            return false;
        });
    }
}
