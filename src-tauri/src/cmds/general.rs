use std::time::{Duration, SystemTime, UNIX_EPOCH};

use tauri::{AppHandle, Manager};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;

use crate::types::{ResultExt, VideoSelectResult};

pub fn get_unix_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("SystemTime error")
        .as_millis()
}

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

#[tauri::command]
pub async fn file_open(app: AppHandle, path: String) -> Result<(), String> {
    app.opener().open_path(path, None::<&str>).err_msg()
}

#[tauri::command]
pub async fn data_open(app: AppHandle, data: Vec<u8>) -> Result<(), String> {
    let dir = app.path().temp_dir().err_msg()?;
    let name = format!("sodatsuki-{}-temp.jpg", get_unix_ms());

    let pathbuf = dir.join(name);
    let path = pathbuf
        .to_str()
        .ok_or("Could not conver path to str".to_string())
        .err_msg()?;

    std::fs::write(path, data).err_msg()?;

    let path_clone = path.to_string();
    tokio::task::spawn(async move {
        tokio::time::sleep(Duration::from_millis(10_000)).await;
        let result = std::fs::remove_file(path_clone);

        if let Err(err) = result {
            println!("Could not delete temp file: {:?}", err);
        }
    });

    app.opener().open_path(path, None::<&str>).err_msg()
}

#[tauri::command]
pub async fn clip_capture(
    video_path: String,
    start: f64,
    end: f64,
) -> Result<tauri::ipc::Response, String> {
    // TODO: consider https://docs.rs/async-process/latest/async_process/
    let output = std::process::Command::new("ffmpeg")
        .args([
            "-ss",
            &format!("{}ms", start),
            "-t",
            &format!("{}ms", end - start),
            "-i",
            &video_path,
            "-ac",
            "1",
            "-ar",
            "22050",
            "-b:a",
            "96k",
            "-af",
            "dynaudnorm=f=50:g=31:b=true:m=30,volume=-9dB",
            "-acodec",
            "libmp3lame",
            "-f",
            "mp3",
            "-",
        ])
        .output()
        .err_msg()?;

    let code = output
        .status
        .code()
        .ok_or("Missing exit code".to_string())
        .err_msg()?;

    if code != 0 {
        Err(String::from_utf8(output.stderr).err_msg()?)
    } else {
        Ok(tauri::ipc::Response::new(output.stdout))
    }
}

#[tauri::command]
pub async fn frame_capture(
    video_path: String,
    timestamp: f64,
) -> Result<tauri::ipc::Response, String> {
    let output = std::process::Command::new("ffmpeg")
        .args([
            "-ss",
            &format!("{}ms", timestamp),
            "-i",
            &video_path,
            "-vf",
            "scale=-1:720",
            "-frames:v",
            "1",
            "-q:v",
            "4",
            "-f",
            "image2pipe",
            "-",
        ])
        .output()
        .err_msg()?;

    let code = output
        .status
        .code()
        .ok_or("Missing exit code".to_string())
        .err_msg()?;

    if code != 0 {
        Err(String::from_utf8(output.stderr).err_msg()?)
    } else {
        Ok(tauri::ipc::Response::new(output.stdout))
    }
}
