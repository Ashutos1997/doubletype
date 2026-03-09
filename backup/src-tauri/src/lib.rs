use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tauri::Manager;

#[cfg(target_os = "macos")]
use tauri::ActivationPolicy;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            // Hide from macOS Dock — make it a proper status bar agent
            #[cfg(target_os = "macos")]
            app.set_activation_policy(ActivationPolicy::Accessory);

            // 1. Create Tray Menu
            let toggle_i = MenuItem::with_id(app, "toggle", "Show / Hide", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&toggle_i, &quit_i])?;

            // 2. Build Tray Icon (top macOS status bar)
            let icon = app
                .default_window_icon()
                .ok_or("No default window icon found")?;
            let _tray = TrayIconBuilder::new()
                .icon(icon.clone())
                .menu(&menu)
                .on_menu_event(
                    |app: &tauri::AppHandle, event: tauri::menu::MenuEvent| match event.id.as_ref()
                    {
                        "toggle" => {
                            if let Some(window) = app.get_webview_window("main") {
                                if window.is_visible().unwrap_or(false) {
                                    let _ = window.hide();
                                } else {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    },
                )
                .on_tray_icon_event(|tray, event: tauri::tray::TrayIconEvent| {
                    if let TrayIconEvent::Click { .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
