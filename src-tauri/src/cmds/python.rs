use pyo3::types::{PyAnyMethods, PyDict, PyDictMethods};

use crate::{
    cmds::ffmpeg,
    types::{Ocr, OcrManager, OcrMask, ResultExt, Status, Transcribe, TranscribeManager},
};

impl OcrManager {
    pub fn new() -> Self {
        Self {
            status: Status::Offline,
        }
    }

    fn init(&mut self) -> Result<(), String> {
        self.status = Status::Offline;

        pyo3::Python::attach(|py| {
            py.run(
                cr#"
import easyocr
reader = easyocr.Reader(lang_list=["ja"], gpu=True)

def ocr(buffer):
    result = reader.readtext(image=buffer, detail=0)
    return result
                "#,
                None,
                None,
            )
        })
        .err_msg()?;

        self.status = Status::Online;

        Ok(())
    }

    fn ocr(&self, image: &[u8]) -> Result<Vec<String>, String> {
        pyo3::Python::attach(|py| -> pyo3::PyResult<Vec<String>> {
            let ocr = py.eval(c"ocr", None, None)?;

            let kwargs = PyDict::new(py);
            kwargs.set_item("buffer", image)?;

            let results = ocr.call((), Some(&kwargs))?.extract()?;
            Ok(results)
        })
        .err_msg()
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

        pyo3::Python::attach(|py| {
            py.run(
                cr#"
import numpy as np
import whisper
whisper_model = whisper.load_model(name="turbo", device="cuda")

def transcribe(buffer):
    audio = np.frombuffer(buffer=buffer, dtype=np.float32)
    result = whisper_model.transcribe(audio=audio, language="ja", task="transcribe")

    segments = result["segments"]
    result = [item["text"] for item in segments]
    return result
                "#,
                None,
                None,
            )
        })
        .err_msg()?;

        self.status = Status::Online;

        Ok(())
    }

    fn transcribe(&self, audio: &[u8]) -> Result<Vec<String>, String> {
        pyo3::Python::attach(|py| -> pyo3::PyResult<Vec<String>> {
            let transcribe = py.eval(c"transcribe", None, None)?;

            let kwargs = PyDict::new(py);
            kwargs.set_item("buffer", audio)?;

            let results = transcribe.call((), Some(&kwargs))?.extract()?;
            Ok(results)
        })
        .err_msg()
    }
}

#[tauri::command]
pub async fn init_ocr(ocr: Ocr<'_>) -> Result<(), String> {
    let mut ocr = ocr.lock().await;

    match ocr.status {
        Status::Online => Ok(()),
        _ => ocr.init(),
    }
}

#[tauri::command]
pub async fn init_transcribe(transcribe: Transcribe<'_>) -> Result<(), String> {
    let mut transcribe = transcribe.lock().await;

    match transcribe.status {
        Status::Online => Ok(()),
        _ => transcribe.init(),
    }
}

#[tauri::command]
pub async fn run_ocr(
    ocr: Ocr<'_>,
    video_path: String,
    timestamp: f64,
    mask: OcrMask,
) -> Result<Vec<String>, String> {
    let image = ffmpeg(&[
        "-ss",
        &format!("{}ms", timestamp),
        "-i",
        &video_path,
        "-vf",
        &format!(
            "crop=in_w*{}:in_h*{}:in_w*{}:in_h*{}",
            mask.width, mask.height, mask.x, mask.y,
        ),
        "-frames:v",
        "1",
        "-q:v",
        "1",
        "-f",
        "image2pipe",
        "-",
    ])?;

    let ocr = ocr.lock().await;
    ocr.ocr(&image)
}

#[tauri::command]
pub async fn run_transcribe(
    transcribe: Transcribe<'_>,
    video_path: String,
    start: f64,
    end: f64,
) -> Result<Vec<String>, String> {
    let audio = ffmpeg(&[
        "-ss",
        &format!("{}ms", start),
        "-t",
        &format!("{}ms", end - start),
        "-i",
        &video_path,
        "-ac",
        "1",
        "-ar",
        "16000",
        "-acodec",
        "pcm_f32le",
        "-f",
        "f32le",
        "-",
    ])?;

    let transcribe = transcribe.lock().await;
    transcribe.transcribe(&audio)
}
