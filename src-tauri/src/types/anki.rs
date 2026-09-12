use std::collections::HashMap;

#[derive(serde::Serialize, Clone, serde::Deserialize, std::fmt::Debug)]
#[serde(rename_all = "camelCase")]
pub struct AnkiGetInitialResult {
    pub media_path: String,
    pub decks: Vec<String>,
}

#[derive(serde::Serialize, Clone, serde::Deserialize, std::fmt::Debug)]
#[serde(rename_all = "camelCase")]
pub struct AnkiGetDeckResult {
    pub name: String,
    pub total_notes: i32,
    pub notes: Vec<Note>,
}

#[derive(serde::Serialize, Clone, std::fmt::Debug, serde::Deserialize)]
pub struct Note {
    pub id: i64,
    pub fields: HashMap<String, String>,
}

#[derive(serde::Deserialize, std::fmt::Debug)]
pub struct AnkiResponse<T> {
    pub result: Option<T>,
    pub error: Option<String>,
}

#[derive(serde::Deserialize, std::fmt::Debug)]
pub struct CapturedMedia {
    pub name: String,
    pub data: Vec<u8>,
}
