use crate::types::Status;

pub struct PythonState {
    pub ocr: tauri::async_runtime::Mutex<PythonManager>,
    pub transcribe: tauri::async_runtime::Mutex<PythonManager>,
}

pub struct PythonManager {
    pub label: String,
    pub status: Status,
    pub process: Option<Process>,
}

#[allow(dead_code)]
pub struct Process {
    pub child: std::process::Child,
    pub stdin: std::process::ChildStdin,
    pub stdout_rx: tokio::sync::watch::Receiver<String>,
    pub stderr_rx: tokio::sync::watch::Receiver<String>,
    pub stdout_handle: tokio::task::JoinHandle<()>,
    pub stderr_handle: tokio::task::JoinHandle<()>,
}

#[derive(serde::Deserialize)]
pub struct OcrMask {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}
