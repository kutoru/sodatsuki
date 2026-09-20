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
pub struct PartialConfig {
    pub anki_address: Option<String>,
    pub auto_apply_date_filter: Option<bool>,
    pub tz_offset: Option<i32>,
    pub python_path: Option<String>,
    pub auto_init_ocr: Option<bool>,
    pub auto_init_transcribe: Option<bool>,
    pub python_output_transform: Option<PythonOutputTransform>,
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
