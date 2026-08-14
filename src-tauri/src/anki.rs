use std::{
    collections::HashMap,
    time::{SystemTime, UNIX_EPOCH},
};

use serde_json::json;

use crate::types::{
    AnkiResponse, AnkiResult, Config, DeckResult, FullNote, Http, Note, ResultExt, Status,
};

#[tauri::command]
pub async fn anki_fetch_status(http: Http<'_>, config: Config<'_>) -> Result<AnkiResult, String> {
    let media_path = call_anki(&http, &config, "getMediaDirPath").await?;
    let decks: HashMap<String, i64> = call_anki(&http, &config, "deckNamesAndIds").await?;

    let mut deck_names: Vec<String> = decks.into_keys().collect();
    deck_names.sort();

    Ok(AnkiResult {
        status: Status::Online,
        media_path: Some(media_path),
        decks: deck_names,
    })
}

#[tauri::command]
pub async fn anki_fetch_deck(
    http: Http<'_>,
    config: Config<'_>,
    deck: String,
    start_timestamp: Option<u128>,
    end_timestamp: Option<u128>,
) -> Result<DeckResult, String> {
    let all_note_ids: Vec<i64> = call_anki_with_params(
        &http,
        &config,
        "findNotes",
        json!({
            "query": format!("deck:{}", deck),
        }),
    )
    .await?;

    let total_notes = all_note_ids.len() as i32;

    let filtered_note_ids: Vec<i64> = call_anki_with_params(
        &http,
        &config,
        "noteIdsBetweenDates",
        json!({
            "deck": deck,
            "start": start_timestamp.unwrap_or(0),
            "end": end_timestamp.unwrap_or_else(|| {
                SystemTime::now().duration_since(UNIX_EPOCH).expect("SystemTime error").as_millis()
            }),
        }),
    )
    .await?;

    let notes: Vec<FullNote> = call_anki_with_params(
        &http,
        &config,
        "notesInfo",
        json!({
            "notes": filtered_note_ids,
        }),
    )
    .await?;

    let formatted_notes = notes
        .into_iter()
        .map(|note| Note {
            id: note.note_id,
            fields: note.fields.into_iter().map(|(k, v)| (k, v.value)).collect(),
        })
        .collect();

    Ok(DeckResult {
        name: deck,
        total_notes: total_notes,
        notes: formatted_notes,
    })
}

async fn call_anki<T>(http: &Http<'_>, config: &Config<'_>, action: &str) -> Result<T, String>
where
    T: serde::de::DeserializeOwned + std::fmt::Debug,
{
    call_anki_with_params(http, config, action, json!({})).await
}

async fn call_anki_with_params<T, U>(
    http: &Http<'_>,
    config: &Config<'_>,
    action: &str,
    params: U,
) -> Result<T, String>
where
    T: serde::de::DeserializeOwned + std::fmt::Debug,
    U: serde::Serialize,
{
    let http: &reqwest::Client = http.inner();
    let config = config.lock().await;

    let port = match action {
        "noteIdsBetweenDates" => config.anki_custom_port,
        _ => config.anki_connect_port,
    };

    let url = format!("{}:{}", config.anki_host, port);
    let body = json!({
        "action": action,
        "version": 5,
        "params": params,
    });

    // println!("Request {}: {:?}", action, body);

    let response = http
        .post(url)
        .json(&body)
        .send()
        .await
        .err_msg()?
        .json::<AnkiResponse<T>>()
        .await
        .err_msg()?;

    // println!("Response {}: {:?}", action, response);

    match response.result {
        Some(r) => Ok(r),
        None => Err(response.error.unwrap_or("Empty Anki error".to_string())),
    }
}
