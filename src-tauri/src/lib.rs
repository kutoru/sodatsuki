mod cmds;
mod types;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .manage(reqwest::Client::new())
        .manage(tauri::async_runtime::Mutex::new(types::ConfigInner {
            anki_host: "http://127.0.0.1".to_owned(),
            anki_connect_port: 8765,
            anki_custom_port: 8766,
        }))
        .invoke_handler(tauri::generate_handler![
            cmds::anki_fetch_status,
            cmds::anki_fetch_deck,
            cmds::anki_open_note,
            cmds::anki_save_note,
            cmds::copy_to_clipboard,
            cmds::video_select,
            cmds::file_open,
            cmds::data_open,
            cmds::clip_capture,
            cmds::frame_capture,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
