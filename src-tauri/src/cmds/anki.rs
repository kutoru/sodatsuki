use base64::Engine;
use serde_json::json;

use crate::{
    cmds::get_unix_ms,
    types::{
        AnkiFetchDeckResult, AnkiFetchStatusResult, AnkiResponse, CapturedMedia, FullNote, Http,
        Note, ResultExt,
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
) -> Result<AnkiFetchStatusResult, String> {
    call_anki(&http, &anki_address, "get_initial").await
}

#[tauri::command]
pub async fn anki_fetch_deck(
    http: Http<'_>,
    anki_address: String,
    deck: String,
    start_timestamp: Option<u128>,
    end_timestamp: Option<u128>,
) -> Result<AnkiFetchDeckResult, String> {
    let all_note_ids: Vec<i64> = call_anki_with_params(
        &http,
        &anki_address,
        "findNotes",
        json!({
            "query": format!("deck:{}", deck),
        }),
    )
    .await?;

    let total_notes = all_note_ids.len() as i32;

    let filtered_note_ids: Vec<i64> = call_anki_with_params(
        &http,
        &anki_address,
        "noteIdsBetweenDates",
        json!({
            "deck": deck,
            "start": start_timestamp.unwrap_or(0),
            "end": end_timestamp.unwrap_or_else(|| {
                get_unix_ms()
            }),
        }),
    )
    .await?;

    let notes: Vec<FullNote> = call_anki_with_params(
        &http,
        &anki_address,
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

    Ok(AnkiFetchDeckResult {
        name: deck,
        total_notes: total_notes,
        notes: formatted_notes,
    })
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
        "guiBrowse",
        json!({
            "noteId": note_id,
        }),
    )
    .await
}

#[tauri::command]
pub async fn anki_save_note(
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

        let result = call_anki_with_params::<String>(
            &http,
            &anki_address,
            "storeMediaFile",
            json!({
                "filename": &new_name,
                "data": data,
            }),
        )
        .await;

        if let Err(err) = result {
            if err != "Empty Anki error" {
                return Err(err);
            }
        }

        // TODO: implement safer replace
        for v in note.fields.values_mut() {
            *v = v.replace(&file.name, &new_name);
        }
    }

    let result = call_anki_with_params::<()>(
        &http,
        &anki_address,
        "updateNoteFields",
        json!({
            "note": note,
        }),
    )
    .await;

    if let Err(err) = result {
        if err != "Empty Anki error" {
            return Err(err);
        }
    }

    Ok(note)
}
