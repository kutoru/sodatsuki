use crate::types::{Ocr, OcrManager, ResultExt, Status, Transcribe, TranscribeManager};

async fn python_attach<F>(f: F) -> Result<(), String>
where
    F: FnOnce(pyo3::Python) -> pyo3::PyResult<()> + Send + 'static,
{
    tauri::async_runtime::spawn(async { pyo3::Python::attach(f) })
        .await
        .err_msg()?
        .err_msg()
}

impl OcrManager {
    pub fn new() -> Self {
        Self {
            status: Status::Offline,
        }
    }

    fn init(&mut self) -> Result<(), String> {
        self.status = Status::Offline;

        // pyo3::Python::initialize();

        pyo3::Python::attach(|py| {
            py.run(
                cr#"
import easyocr
reader = easyocr.Reader(lang_list=["ja"], gpu=True)
                "#,
                None,
                None,
            )
        })
        .err_msg()?;

        self.status = Status::Online;

        Ok(())
    }

    fn ocr(&self, image: &[u8]) -> Result<String, String> {
        Err("not implemented".into())
    }
}

impl TranscribeManager {
    pub fn new() -> Self {
        Self {
            status: Status::Offline,
        }
    }

    fn init(&mut self) -> Result<(), String> {
        self.status = Status::Offline;

        // pyo3::Python::initialize();

        pyo3::Python::attach(|py| {
            py.run(
                cr#"
import whisper
whisper_model = whisper.load_model(name="turbo", device="cuda")
                "#,
                None,
                None,
            )
        })
        .err_msg()?;

        self.status = Status::Online;

        Ok(())
    }

    async fn transcribe(&self, audio: &[u8]) -> Result<String, String> {
        Err("not implemented".into())
    }
}

#[tauri::command]
pub async fn init_ocr(ocr: Ocr<'_>) -> Result<(), String> {
    let mut ocr = ocr.lock().await;
    ocr.init()
}

#[tauri::command]
pub async fn init_transcribe(transcribe: Transcribe<'_>) -> Result<(), String> {
    let mut transcribe = transcribe.lock().await;
    transcribe.init()
}
