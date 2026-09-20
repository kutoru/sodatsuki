use std::{
    os::windows::process::CommandExt,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use tauri::{AppHandle, Manager};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;

use crate::types::{PartialConfig, ResultExt, VideoSelectResult};

pub fn get_unix_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("SystemTime error")
        .as_millis()
}

pub fn ffmpeg(args: &[&str]) -> Result<Vec<u8>, String> {
    let output = std::process::Command::new("ffmpeg")
        .args(args)
        .creation_flags(0x08000000)
        .output()
        .err_msg()?;

    let code = output
        .status
        .code()
        .ok_or("Missing exit code".to_string())?;

    if code != 0 {
        return Err(String::from_utf8(output.stderr).err_msg()?);
    }

    Ok(output.stdout)
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

    let scope = app.asset_protocol_scope();
    scope.allow_file(&path).err_msg()?;

    let name = file_path
        .file_name()
        .ok_or("Could not get video name")?
        .to_str()
        .ok_or("Could not convert name to str")?
        .to_string();

    Ok(VideoSelectResult { path, name })
}

#[tauri::command]
pub async fn search_open(app: AppHandle, query: String) -> Result<(), String> {
    app.opener()
        .open_url(format!("https://jisho.org/search/{}", query), None::<&str>)
        .err_msg()
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
        .ok_or("Could not convert path to str".to_string())
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
    let clip = ffmpeg(&[
        "-ss",
        &format!("{}ms", start),
        "-t",
        &format!("{}ms", end - start),
        "-i",
        &video_path,
        "-ac",
        "1",
        "-ar",
        "44100",
        "-b:a",
        "64k",
        "-af",
        "dynaudnorm=f=50:g=15:b=true:m=30:s=15,volume=-9dB",
        "-acodec",
        "libmp3lame",
        "-f",
        "mp3",
        "-",
    ])?;

    Ok(tauri::ipc::Response::new(clip))
}

#[tauri::command]
pub async fn frame_capture(
    video_path: String,
    timestamp: f64,
) -> Result<tauri::ipc::Response, String> {
    let frame = ffmpeg(&[
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
    ])?;

    Ok(tauri::ipc::Response::new(frame))
}

#[tauri::command]
pub async fn config_open(app: AppHandle) -> Result<(), String> {
    if let Some(config_window) = app.get_webview_window("config") {
        return config_window.set_focus().err_msg();
    }

    let main_window = app
        .get_webview_window("main")
        .ok_or("Could not get main window")?;

    tauri::WebviewWindowBuilder::new(&app, "config", tauri::WebviewUrl::App("#config".into()))
        .title("Config")
        .minimizable(false)
        .min_inner_size(640.0, 640.0)
        .inner_size(640.0, 640.0)
        .center()
        .background_color(tauri::window::Color(0, 0, 0, 255))
        .parent(&main_window)
        .err_msg()?
        .build()
        .err_msg()?;

    Ok(())
}

#[tauri::command]
pub async fn config_save(app: AppHandle, config: PartialConfig) -> Result<(), String> {
    println!("config {:#?}", config);

    // notify frontend about config changes

    Ok(())
}
