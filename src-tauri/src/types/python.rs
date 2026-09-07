use crate::types::Status;

pub struct OcrManager {
    pub status: Status,
}

pub struct TranscribeManager {
    pub status: Status,
}

#[derive(serde::Deserialize)]
pub struct OcrMask {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}
