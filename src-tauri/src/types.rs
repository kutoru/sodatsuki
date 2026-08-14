use std::collections::HashMap;

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

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AnkiResult {
    pub status: Status,
    pub media_path: Option<String>,
    pub decks: Vec<String>,
}

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DeckResult {
    pub name: String,
    pub total_notes: i32,
    pub notes: Vec<Note>,
}

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    pub note_id: i64,
    pub fields: HashMap<String, String>,
}

#[derive(serde::Deserialize, std::fmt::Debug)]
pub struct AnkiResponse<T> {
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
