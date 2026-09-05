use crate::types::{Ocr, OcrManager, ResultExt, Status, Transcribe, TranscribeManager};

impl OcrManager {
    pub fn new() -> Self {
        Self {
            status: Status::Offline,
        }
    }

    pub fn init(&mut self) -> Result<(), String> {
        pyo3::Python::initialize();

        let result = pyo3::Python::attach(|py| -> pyo3::PyResult<()> {
            py.run(
                cr#"
import easyocr
reader = easyocr.Reader(lang_list=["ja"], gpu=True)
            "#,
                None,
                None,
            )
        })
        .err_msg();

        if result.is_ok() {
            self.status = Status::Online;
        }

        result
    }

    pub fn ocr(&self, image: &[u8]) -> Result<String, String> {
        Err("not implemented".into())
    }
}

impl TranscribeManager {
    pub fn new() -> Self {
        Self {
            status: Status::Offline,
        }
    }

    pub fn init(&mut self) -> Result<(), String> {
        pyo3::Python::initialize();

        let result = pyo3::Python::attach(|py| -> pyo3::PyResult<()> {
            py.run(
                cr#"
import whisper
whisper_model = whisper.load_model(name="turbo", device="cuda")
            "#,
                None,
                None,
            )
        })
        .err_msg();

        if result.is_ok() {
            self.status = Status::Online;
        }

        result
    }

    pub fn transcribe(&self, audio: &[u8]) -> Result<String, String> {
        Err("not implemented".into())
    }
}

// #[tauri::command]
// pub async fn python_init(python: &Python<'_>) -> Result<(), String> {
//     let python = python.lock().await;
//     python.init()
// }

#[tauri::command]
pub fn status_ocr(ocr: Ocr<'_>) -> Status {
    match ocr.try_lock() {
        Ok(ocr) => ocr.status.clone(),
        Err(_) => Status::Loading,
    }
}

#[tauri::command]
pub fn status_transcribe(transcribe: Transcribe<'_>) -> Status {
    match transcribe.try_lock() {
        Ok(transcribe) => transcribe.status.clone(),
        Err(_) => Status::Loading,
    }
}
