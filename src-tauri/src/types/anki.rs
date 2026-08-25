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

#[derive(serde::Serialize, Clone, std::fmt::Debug, serde::Deserialize, PartialEq, Eq, Hash)]
pub enum Fields {
    Expression,
    Meaning,
    #[serde(rename = "Image_URI")]
    ImageUri,
    Sentence,
    #[serde(rename = "Sentence Audio")]
    SentenceAudio,
    #[serde(rename = "Sentence-Kana")]
    SentenceKana,
    #[serde(rename = "Sentence-English")]
    SentenceEnglish,
    Reading,
    Audio,
}

#[derive(serde::Serialize, Clone, std::fmt::Debug, serde::Deserialize)]
pub struct Note {
    pub id: i64,
    pub fields: HashMap<Fields, String>,
}

#[derive(std::fmt::Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FullNote {
    pub note_id: i64,
    pub fields: HashMap<Fields, FullField>,
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
