use tauri::{AppHandle, Manager};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_dialog::DialogExt;

use crate::types::{ResultExt, VideoSelectResult};

#[tauri::command]
pub async fn copy_to_clipboard(app: AppHandle, text: String) -> Result<(), String> {
    app.clipboard().write_text(text).err_msg()
}

#[tauri::command]
pub async fn video_select(app: AppHandle) -> Result<VideoSelectResult, String> {
    let window = app
        .get_webview_window("main")
        .ok_or("Could not get main window")?;

    let file_path = app
        .dialog()
        .file()
        .set_parent(&window)
        .add_filter("", &["mp4", "mkv"])
        .blocking_pick_file()
        .ok_or("Could not get file path")?
        .into_path()
        .err_msg()?;

    let path = file_path
        .to_str()
        .ok_or("Could not convert path to str")?
        .to_string();

    let name = file_path
        .file_name()
        .ok_or("Could not get video name")?
        .to_str()
        .ok_or("Could not convert name to str")?
        .to_string();

    Ok(VideoSelectResult { path, name })
}
