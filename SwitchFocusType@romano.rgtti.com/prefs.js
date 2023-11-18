// Switch Focus Type extension (c) 2023 Romano Giannetti <romano.giannetti@gmail.com>
// License: GPLv2+, see http://www.gnu.org/licenses/gpl-2.0.txt
//
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class SwitchFocusTypePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create a preferences page, with a single group
        const page = new Adw.PreferencesPage({
            title: 'General',
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: 'Behavior',
            description: 'Configure the behavior of the extension',
        });
        page.add(group);

        // Create a new preferences row
        const rowNotification = new Adw.SwitchRow({
            title: 'Show Notifications',
            subtitle: 'Whether to show a notification on change',
        });
        group.add(rowNotification);

        const rowSloppy = new Adw.SwitchRow({
            title: 'Use sloppy focus',
            subtitle: 'Whether to use the sloppy focus-follow-mouse behavior',
        });
        group.add(rowSloppy);

        // Create a settings object and bind the row to the `show-indicator` key
        window._settings = this.getSettings();
        window._settings.bind('show-notifications', rowNotification, 'active',
            Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('use-sloppy', rowSloppy, 'active',
            Gio.SettingsBindFlags.DEFAULT);
    }
}
