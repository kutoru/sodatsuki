use serde_json::json;

use crate::types::{AnkiResponse, AnkiResult, Config, Http, Note, ResultExt, Status};

#[tauri::command]
pub async fn anki_fetch_status(http: Http<'_>, config: Config<'_>) -> Result<AnkiResult, String> {
    let config = config.lock().await;

    // const response = await callAnki<Record<string, number>>('deckNamesAndIds');
    let body = json!({
        "action": "getMediaDirPath",
        "version": 5,
        "params": {},
    });

    let res = http
        .post(format!("{}:{}", config.anki_host, config.anki_connect_port))
        .json(&body)
        .send()
        .await;

    let response = match res {
        Ok(r) => r,
        Err(e) => {
            println!("{}", e);

            return Ok(AnkiResult {
                status: Status::Offline,
                media_path: None,
                decks: Vec::default(),
            });
        }
    };

    let res = response.json::<AnkiResponse<String>>().await;

    let json = match res {
        Ok(r) => r,
        Err(e) => {
            println!("{}", e);

            return Ok(AnkiResult {
                status: Status::Offline,
                media_path: None,
                decks: Vec::default(),
            });
        }
    };

    let media_path = match json.result {
        Some(r) => r,
        None => {
            println!("{:?}", json.error);

            return Ok(AnkiResult {
                status: Status::Offline,
                media_path: None,
                decks: Vec::default(),
            });
        }
    };

    Ok(AnkiResult {
        status: Status::Online,
        media_path: Some(media_path),
        decks: Vec::default(),
    })
}

#[tauri::command]
pub async fn anki_fetch_deck(
    state: Config<'_>,
    deck: String,
    start: i64,
    end: i64,
) -> Result<(), ()> {
    let mut state = state.lock().await;
    // state.anki.;
    Ok(())
}

#[tauri::command]
pub async fn anki_save_note(state: Config<'_>, note: Note) -> Result<(), ()> {
    let mut state = state.lock().await;
    // state.anki.;
    Ok(())
}

async fn call_anki<T, U>(
    http: Http<'_>,
    config: Config<'_>,
    action: &str,
    params: Option<U>,
) -> Result<AnkiResponse<T>, String>
where
    T: serde::de::DeserializeOwned + std::fmt::Debug,
    U: serde::Serialize,
{
    let http: &reqwest::Client = http.inner();
    let config = config.lock().await;

    let url = format!("{}:{}", config.anki_host, config.anki_connect_port);
    let body = json!({
        "action": action,
        "version": 5,
        "params": params,
    });

    println!("Body: {:?}", body);

    let response = http
        .post(url)
        .json(&body)
        .send()
        .await
        .err_msg()?
        .json::<AnkiResponse<T>>()
        .await
        .err_msg()?;

    println!("Body: {:?}", response);

    Ok(response)
}
