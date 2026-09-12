use base64::Engine;
use serde_json::json;

use crate::{
    cmds::get_unix_ms,
    types::{
        AnkiGetDeckResult, AnkiGetInitialResult, AnkiResponse, CapturedMedia, Http, Note, ResultExt,
    },
};

async fn call_anki<T>(http: &Http<'_>, anki_address: &str, action: &str) -> Result<T, String>
where
    T: serde::de::DeserializeOwned + std::fmt::Debug,
{
    call_anki_with_params(http, anki_address, action, json!({})).await
}

async fn call_anki_with_params<T>(
    http: &Http<'_>,
    anki_address: &str,
    action: &str,
    params: serde_json::Value,
) -> Result<T, String>
where
    T: serde::de::DeserializeOwned + std::fmt::Debug,
{
    let http: &reqwest::Client = http.inner();

    let body = json!({
        "action": action,
        "params": params,
    });

    // println!("Request {}: {:?}", action, body);

    let response = http
        .post(anki_address)
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

#[tauri::command]
pub async fn anki_get_initial(
    http: Http<'_>,
    anki_address: String,
) -> Result<AnkiGetInitialResult, String> {
    call_anki(&http, &anki_address, "get_initial").await
}

#[tauri::command]
pub async fn anki_get_deck(
    http: Http<'_>,
    anki_address: String,
    deck: String,
    start_timestamp: Option<u128>,
    end_timestamp: Option<u128>,
) -> Result<AnkiGetDeckResult, String> {
    call_anki_with_params(
        &http,
        &anki_address,
        "get_deck",
        json!({
            "deck": deck,
            "start": start_timestamp,
            "end": end_timestamp,
        }),
    )
    .await
}

#[tauri::command]
pub async fn anki_open_note(
    http: Http<'_>,
    anki_address: String,
    note_id: i64,
) -> Result<bool, String> {
    call_anki_with_params(
        &http,
        &anki_address,
        "open_note",
        json!({
            "noteId": note_id,
        }),
    )
    .await
}

#[tauri::command]
pub async fn anki_update_note(
    http: Http<'_>,
    anki_address: String,
    mut note: Note,
    files: Vec<CapturedMedia>,
) -> Result<Note, String> {
    for file in files {
        let label = note
            .fields
            .get("Expression")
            .map_or("".into(), |l| format!("-{}", l));

        let ext = file
            .name
            .split('.')
            .next_back()
            .map_or("".into(), |e| format!(".{}", e));

        let new_name = format!("sodatsuki-{}{}{}", get_unix_ms(), label, ext);

        let data = base64::prelude::BASE64_STANDARD.encode(file.data);

        call_anki_with_params::<bool>(
            &http,
            &anki_address,
            "store_media_file",
            json!({
                "filename": &new_name,
                "data": data,
            }),
        )
        .await?;

        // TODO: implement safer replace
        for v in note.fields.values_mut() {
            *v = v.replace(&file.name, &new_name);
        }
    }

    call_anki_with_params::<bool>(
        &http,
        &anki_address,
        "update_note_fields",
        json!({
            "note": note,
        }),
    )
    .await?;

    Ok(note)
}
