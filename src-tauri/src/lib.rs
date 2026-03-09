use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tauri::Manager;

#[cfg(target_os = "macos")]
use tauri::ActivationPolicy;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .setup(|app| {
            // Hide from macOS Dock — make it a proper status bar agent
            #[cfg(target_os = "macos")]
            app.set_activation_policy(ActivationPolicy::Accessory);

            // 1. Create Tray Menu
            let toggle_i = MenuItem::with_id(app, "toggle", "Show / Hide", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&toggle_i, &quit_i])?;

            // 2. Build Tray Icon (top macOS status bar)
            let tray_bytes = include_bytes!("../icons/trayIconTemplate@2x.png");
            let icon = tauri::image::Image::from_bytes(tray_bytes)
                .unwrap_or_else(|_| app.default_window_icon().unwrap().clone());
            let _tray = TrayIconBuilder::new()
                .icon(icon)
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
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
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { position, .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            // Only reposition on show to feel like a popover
                            if !window.is_visible().unwrap_or(false) {
                                let window_size = window.outer_size().unwrap_or_default();
                                let x = position.x - (window_size.width as f64 / 2.0);
                                let y = position.y;
                                let _ = window.set_position(tauri::PhysicalPosition::new(x, y));
                            }
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
