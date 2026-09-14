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

pub trait ResultExt<T> {
    fn err_msg(self) -> Result<T, String>;
}

impl<T, U: std::fmt::Debug> ResultExt<T> for Result<T, U> {
    fn err_msg(self) -> Result<T, String> {
        self.map_err(|err| format!("{:?}", err))
    }
}
