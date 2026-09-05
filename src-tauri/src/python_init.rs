use tauri::{plugin::TauriPlugin, Manager, RunEvent, Runtime};

use crate::types::{Ocr, Transcribe};

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    tauri::plugin::Builder::new("python_init")
        .on_event(|app_handle, event| match event {
            RunEvent::Ready => {
                let app = app_handle.clone();

                tauri::async_runtime::spawn(async move {
                    let transcribe: Transcribe<'_> = app.state();
                    let mut transcribe = transcribe.lock().await;

                    if let Err(err) = transcribe.init() {
                        println!("Could not initialize transcribe: {:?}", err);
                    }
                });

                let app = app_handle.clone();

                tauri::async_runtime::spawn(async move {
                    let ocr: Ocr<'_> = app.state();
                    let mut ocr = ocr.lock().await;

                    if let Err(err) = ocr.init() {
                        println!("Could not initialize ocr: {:?}", err);
                    }
                });
            }
            RunEvent::Exit => {
                // kill interpreter or something
            }
            _ => (),
        })
        .build()
}
