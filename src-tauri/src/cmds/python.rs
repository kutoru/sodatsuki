use std::io::Write;

use crate::{
    cmds::ffmpeg,
    types::{ApiResponse, OcrMask, Process, Python, PythonManager, Status},
};

impl PythonManager {
    pub fn new(label: String) -> Self {
        Self {
            label,
            status: Status::Offline,
            process: None,
        }
    }

    pub async fn init(&mut self, args: &[&str]) -> Result<(), String> {
        let mut child = std::process::Command::new(args.first().unwrap())
            .args(args.iter().skip(1))
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .unwrap();

        let stdin = child.stdin.take().unwrap();
        let mut stdout = child.stdout.take().unwrap();
        let mut stderr = child.stderr.take().unwrap();

        let (stdout_tx, stdout_rx) = tokio::sync::watch::channel("".to_string());
        let (stderr_tx, mut stderr_rx) = tokio::sync::watch::channel("".to_string());

        let lbl_clone = self.label.clone();
        let stdout_handle = tokio::task::spawn_blocking(move || {
            while let Some(value) = read_until_nl(&mut stdout) {
                println!("{} stdout: {:?}", lbl_clone, value);

                stdout_tx.send(value).unwrap();
            }
        });

        let lbl_clone = self.label.clone();
        let stderr_handle = tokio::task::spawn_blocking(move || {
            while let Some(value) = read_until_nl(&mut stderr) {
                println!("{} stderr: {:?}", lbl_clone, value);

                stderr_tx.send(value).unwrap();
            }
        });

        stderr_rx.changed().await.unwrap();

        {
            let value = stderr_rx.borrow();
            if *value != "READY" {
                panic!("Process returned something other than READY: {:#?}", *value)
            }
        }

        self.process = Some(Process {
            child,
            stdin,
            stdout_rx,
            stderr_rx,
            stdout_handle,
            stderr_handle,
        });

        self.status = Status::Online;

        Ok(())
    }

    pub async fn run(&mut self, data: &[u8]) -> Result<Vec<String>, String> {
        let process = self
            .process
            .as_mut()
            .ok_or("Process is missing".to_string())?;

        let header = (data.len() as u32).to_be_bytes();
        process.stdin.write_all(&header).unwrap();
        process.stdin.write_all(data).unwrap();

        process.stdout_rx.changed().await.unwrap();
        let value = process.stdout_rx.borrow();

        let response: ApiResponse<Vec<String>> = serde_json::from_str(&value).unwrap();

        match response.result {
            Some(r) => Ok(r),
            None => Err(response.error.unwrap_or("Empty python error".to_string())),
        }
    }

    // TODO: utilize for cleanup
    #[allow(dead_code)]
    pub async fn kill(&mut self) -> Result<(), String> {
        let process = self
            .process
            .as_mut()
            .ok_or("Process is missing".to_string())?;

        process.child.kill().unwrap();

        self.status = Status::Offline;

        let mut process = self.process.take().unwrap();

        process.child.wait().unwrap();
        process.stdout_handle.await.unwrap();
        process.stderr_handle.await.unwrap();

        Ok(())
    }
}

fn read_until_nl<T: std::io::Read>(proc: &mut T) -> Option<String> {
    const CR: u8 = 0x000D;
    const NL: u8 = 0x000A;

    let mut value = String::new();
    let mut buf = [0; 1];

    loop {
        proc.read_exact(&mut buf).ok()?;

        match buf {
            [CR] => continue,
            [NL] => break,
            [c] => value.push(c as char),
        }
    }

    Some(value)
}

#[tauri::command]
pub async fn init_ocr(python: Python<'_>, python_path: String) -> Result<(), String> {
    let mut ocr = python.ocr.lock().await;

    match ocr.status {
        Status::Online => Ok(()),
        _ => ocr.init(&[&python_path, "./src/python/ocr.py"]).await,
    }
}

#[tauri::command]
pub async fn init_transcribe(python: Python<'_>, python_path: String) -> Result<(), String> {
    let mut transcribe = python.transcribe.lock().await;

    match transcribe.status {
        Status::Online => Ok(()),
        _ => {
            transcribe
                .init(&[&python_path, "./src/python/transcribe.py"])
                .await
        }
    }
}

#[tauri::command]
pub async fn run_ocr(
    python: Python<'_>,
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

    let mut ocr = python.ocr.lock().await;
    ocr.run(&image).await
}

#[tauri::command]
pub async fn run_transcribe(
    python: Python<'_>,
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

    let mut transcribe = python.transcribe.lock().await;
    transcribe.run(&audio).await
}
