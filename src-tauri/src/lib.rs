mod anki;
mod types;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(reqwest::Client::new())
        .manage(tauri::async_runtime::Mutex::new(types::ConfigInner {
            anki_host: "http://127.0.0.1".to_owned(),
            anki_connect_port: 8765,
            anki_custom_port: 8766,
        }))
        .invoke_handler(tauri::generate_handler![anki::anki_fetch_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
