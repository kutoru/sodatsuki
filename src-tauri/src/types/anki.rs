use std::collections::HashMap;

use crate::types::Status;

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AnkiFetchStatusResult {
    pub status: Status,
    pub media_path: Option<String>,
    pub decks: Vec<String>,
}

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AnkiFetchDeckResult {
    pub name: String,
    pub total_notes: i32,
    pub notes: Vec<Note>,
}

#[derive(serde::Serialize, Clone, std::fmt::Debug, serde::Deserialize)]
pub struct Note {
    pub id: i64,
    pub fields: HashMap<String, String>,
}

#[derive(std::fmt::Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FullNote {
    pub note_id: i64,
    pub fields: HashMap<String, FullField>,
}

#[derive(std::fmt::Debug, serde::Deserialize)]
pub struct FullField {
    pub value: String,
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
