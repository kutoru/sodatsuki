use pyo3::types::{PyAnyMethods, PyDict, PyDictMethods};

use crate::types::{Ocr, OcrManager, ResultExt, Status, Transcribe, TranscribeManager};

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
        pyo3::Python::attach(|py| -> pyo3::PyResult<String> {
            let reader = py.eval(c"reader", None, None)?;

            let kwargs = PyDict::new(py);
            kwargs.set_item("image", image)?;
            kwargs.set_item("detail", 0)?;

            let results: Vec<String> = reader
                .call_method("readtext", (), Some(&kwargs))?
                .cast_into()?
                .extract()?;

            println!("results: {:?} {:?}", results.len(), results);

            let joined = results.join("");

            Ok(joined)
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

        // pyo3::Python::initialize();

        pyo3::Python::attach(|py| {
            py.run(
                cr#"
import numpy as np
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

    fn transcribe(&self, audio: &[u8]) -> Result<String, String> {
        pyo3::Python::attach(|py| -> pyo3::PyResult<String> {
            py.run(
                cr#"
def transcribe(buffer):
    audio = np.frombuffer(buffer=buffer, dtype=np.float32)
    result = whisper_model.transcribe(audio=audio, language="ja", task="transcribe")

    segments = result["segments"]
    result = [item["text"] for item in segments]
    return result
            "#,
                None,
                None,
            )?;

            let transcribe = py.eval(c"transcribe", None, None)?;

            let kwargs = PyDict::new(py);
            kwargs.set_item("buffer", audio)?;

            let results: Vec<String> = transcribe.call((), Some(&kwargs))?.extract()?;

            println!("results: {:?} {:?}", results.len(), results);

            let joined = results.join("");

            Ok(joined)
        })
        .err_msg()
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

#[tauri::command]
pub async fn exec_ocr(ocr: Ocr<'_>, video_path: String, timestamp: f64) -> Result<String, String> {
    let output = std::process::Command::new("ffmpeg")
        .args([
            "-ss",
            &format!("{}ms", timestamp),
            "-i",
            &video_path,
            "-vf",
            "scale=-1:1080",
            "-frames:v",
            "1",
            "-q:v",
            "2",
            "-f",
            "image2pipe",
            "-",
        ])
        .output()
        .err_msg()?;

    let code = output
        .status
        .code()
        .ok_or("Missing exit code".to_string())
        .err_msg()?;

    if code != 0 {
        return Err(String::from_utf8(output.stderr).err_msg()?);
    }

    let ocr = ocr.lock().await;
    ocr.ocr(&output.stdout)
}

#[tauri::command]
pub async fn exec_transcribe(
    transcribe: Transcribe<'_>,
    video_path: String,
    start: f64,
    end: f64,
) -> Result<String, String> {
    let output = std::process::Command::new("ffmpeg")
        .args([
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
        ])
        .output()
        .err_msg()?;

    let code = output
        .status
        .code()
        .ok_or("Missing exit code".to_string())
        .err_msg()?;

    if code != 0 {
        return Err(String::from_utf8(output.stderr).err_msg()?);
    }

    let transcribe = transcribe.lock().await;
    transcribe.transcribe(&output.stdout)
}
