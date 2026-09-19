mod cmds;
mod types;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .manage(reqwest::Client::new())
        .manage(types::PythonState {
            ocr: tauri::async_runtime::Mutex::new(types::PythonManager::new("ocr".to_string())),
            transcribe: tauri::async_runtime::Mutex::new(types::PythonManager::new(
                "transcribe".to_string(),
            )),
        })
        .invoke_handler(tauri::generate_handler![
            cmds::anki_get_initial,
            cmds::anki_get_deck,
            cmds::anki_open_notes,
            cmds::anki_update_note,
            cmds::anki_get_dupes,
            cmds::copy_to_clipboard,
            cmds::video_select,
            cmds::search_open,
            cmds::file_open,
            cmds::data_open,
            cmds::clip_capture,
            cmds::frame_capture,
            cmds::init_ocr,
            cmds::init_transcribe,
            cmds::run_ocr,
            cmds::run_transcribe,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
