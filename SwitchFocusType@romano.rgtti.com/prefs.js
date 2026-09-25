// Switch Focus Type extension (c) 2023-2026 Romano Giannetti <romano.giannetti@gmail.com>
// License: GPLv2+, see http://www.gnu.org/licenses/gpl-2.0.txt
//
// AI usage in this version: searching APIs, cleaning lifetime rules, helping conversion
// from depreacted/old API. Code re-written, understood ;-) and tested by the (human,
// until proof of the contrary) author, in spite of confused ideas from openAI about how to
// keep the local use_sloppy and the global focus-mode in sync ;-).
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
        // global (desktop) settings, used to read and modify focus behavior
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

        // boolean auto-raise; this is directly read aand modified from global
        // desktop options
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

        // Start binding things.
        // For example, the next one binds, two-ways, the values in the pref windows
        // and the values in the GSettings schema
        // See https://gjs.guide/extensions/development/preferences.html#prefs-js

        window._settings.bind(
            'show-notifications', rowNotification, 'active',
            Gio.SettingsBindFlags.DEFAULT // two-ways binding
        );

        window._settings.bind(
            'use-sloppy', rowSloppy, 'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        // Bind the native boolean directly. Reusing it for sensitivity makes
        // the delay visibly inapplicable while auto-raise is disabled.
        // notice that this is directly bound to the desktop schema, so if
        // you change it in, say, GNOME Tweaks it will change here (tested)
        window._wmSettings.bind(
            'auto-raise', rowAutoRaise, 'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        // mark the auto-raise delay in grey and disable it if the auto-raise
        // boolean is false.
        window._wmSettings.bind(
            'auto-raise', rowAutoRaiseDelay, 'sensitive',
            Gio.SettingsBindFlags.GET // only from wmSettings to here
        );

        // SpinRow.value is a double whereas the GNOME key is an integer, so a
        // normal Gio.Settings.bind() would have incompatible property types.
        // Round on writes and also follow changes made by another program.
        // I need to manually connect to the signal to do the rounding
        const delayRowId = rowAutoRaiseDelay.connect(
            'notify::value',
            () => {
                const delay = Math.round(rowAutoRaiseDelay.value);
                // avoid changing the setting if there has been really no change
                if (window._wmSettings.get_int('auto-raise-delay') !== delay)
                    window._wmSettings.set_int('auto-raise-delay', delay);
            }
        );

        // the other way around, if the value is changed
        // checked with dconf-editor
        const delaySettingsId = window._wmSettings.connect(
            'changed::auto-raise-delay',
            () => {
                const delay =
                    window._wmSettings.get_int('auto-raise-delay');
                // avoid changing the setting if there has been really no change
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
