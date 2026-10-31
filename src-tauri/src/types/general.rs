use std::collections::HashMap;

use crate::types::PythonState;

pub type Http<'a> = tauri::State<'a, reqwest::Client>;
pub type Python<'a> = tauri::State<'a, PythonState>;

#[allow(dead_code)]
#[derive(serde::Serialize, Clone)]
pub enum Status {
    Online,
    Loading,
    Offline,
}

#[derive(serde::Serialize, Clone)]
pub struct VideoSelectResult {
    pub path: String,
    pub name: String,
}

#[derive(serde::Deserialize, std::fmt::Debug)]
pub struct ApiResponse<T> {
    pub result: Option<T>,
    pub error: Option<String>,
}

#[derive(serde::Deserialize, serde::Serialize, std::fmt::Debug)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub anki_address: String,
    pub auto_apply_date_filter: bool,
    pub tz_offset: i32,
    pub python_path: String,
    pub auto_init_ocr: bool,
    pub auto_init_transcribe: bool,
    pub python_output_transform: PythonOutputTransform,
    pub zoom: f64,
    pub clip_process_args: ClipProcessArgs,
    pub frame_process_args: FrameProcessArgs,
}

#[derive(serde::Deserialize, serde::Serialize, std::fmt::Debug)]
#[serde(rename_all = "camelCase")]
pub struct PythonOutputTransform {
    pub join_char: String,
    pub replace_chars: HashMap<String, String>,
}

pub trait ResultExt<T> {
    fn err_msg(self) -> Result<T, String>;
}

impl<T, U: std::fmt::Debug> ResultExt<T> for Result<T, U> {
    fn err_msg(self) -> Result<T, String> {
        self.map_err(|err| format!("{:?}", err))
    }
}

#[derive(serde::Deserialize, serde::Serialize, std::fmt::Debug)]
#[serde(rename_all = "camelCase")]
pub struct ClipProcessArgs {
    pub ac: u32,
    pub ar: u32,
    pub bitrate: u32,
    pub norm_framelen: u32,
    pub norm_gausssize: u32,
    pub norm_maxgain: f64,
    pub norm_altboundary: bool,
    pub norm_compress: f64,
    pub volume: f64,
}

#[derive(serde::Deserialize, serde::Serialize, std::fmt::Debug)]
#[serde(rename_all = "camelCase")]
pub struct FrameProcessArgs {
    pub scale_filter: String,
    pub qscale: u32,
}
