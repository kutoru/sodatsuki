use tauri::AppHandle;
use tauri_plugin_clipboard_manager::ClipboardExt;

use crate::types::ResultExt;

#[tauri::command]
pub async fn copy_to_clipboard(app: AppHandle, text: String) -> Result<(), String> {
    app.clipboard().write_text(text).err_msg()
}
