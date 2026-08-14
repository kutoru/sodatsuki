pub struct ConfigInner {
    pub anki_host: String,
    pub anki_connect_port: i32,
    pub anki_custom_port: i32,
}

pub type Config<'a> = tauri::State<'a, tauri::async_runtime::Mutex<ConfigInner>>;
pub type Http<'a> = tauri::State<'a, reqwest::Client>;

#[derive(serde::Serialize, Clone)]
pub enum Status {
    Online,
    Loading,
    Offline,
}

pub trait ResultExt<T> {
    fn err_msg(self) -> Result<T, String>;
}

impl<T, U: std::fmt::Debug> ResultExt<T> for Result<T, U> {
    fn err_msg(self) -> Result<T, String> {
        self.map_err(|err| format!("{:?}", err))
    }
}
