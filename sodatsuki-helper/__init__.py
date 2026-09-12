# Copyright 2016-2021 Alex Yatskov
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.


import base64
import inspect
import os
import aqt
from aqt.qt import QTimer
from anki.utils import ids2str


from .web import format_exception_reply, format_success_reply
from . import web


class SodatsukiHelper:
    def __init__(self):
        self.timer = None
        self.server = web.WebServer(self.handler)

    def startWebServer(self):
        self.server.listen()
        self.timer = QTimer()
        self.timer.timeout.connect(self.server.advance)
        self.timer.start(25)

    def handler(self, request):
        name = request.get("action", "")
        params = request.get("params", {})

        try:
            method = None

            for methodName, methodInst in inspect.getmembers(
                self, predicate=inspect.ismethod
            ):
                if methodName in ["__init__", "startWebServer", "handler"]:
                    continue

                if methodName == name:
                    method = methodInst
                    break

            if method is None:
                raise Exception("unsupported action")

            api_return_value = methodInst(**params)
            reply = format_success_reply(api_return_value)

        except Exception as e:
            reply = format_exception_reply(e)

        return reply

    def get_initial(self):
        return {
            "mediaPath": os.path.abspath(aqt.mw.col.media.dir()),
            "decks": [x.name for x in aqt.mw.col.decks.all_names_and_ids()],
        }

    def get_deck(self, deck=None, start=None, end=None):
        if deck is None:
            raise Exception("invalid params")

        deck = aqt.mw.col.decks.by_name(deck)
        related_deck_ids = aqt.mw.col.decks.deck_and_child_ids(deck["id"])

        total_notes = aqt.mw.col.db.scalar(
            f"""
                SELECT COUNT() FROM notes
                WHERE EXISTS (
                    SELECT 1 FROM cards WHERE cards.nid = notes.id AND cards.did IN {ids2str(related_deck_ids)}
                )
            """,
        )

        relevant_note_ids = aqt.mw.col.db.list(
            f"""
                SELECT notes.id FROM notes
                WHERE notes.id BETWEEN COALESCE(?, notes.id) AND COALESCE(?, notes.id)
                AND EXISTS (
                    SELECT 1 FROM cards WHERE cards.nid = notes.id AND cards.did IN {ids2str(related_deck_ids)}
                ) ORDER BY notes.id ASC
            """,
            start,
            end,
        )

        notes = []

        for id in relevant_note_ids:
            note = aqt.mw.col.get_note(id)
            model = note.note_type()

            fields = {}

            for field in model["flds"]:
                name = field["name"]
                ord = field["ord"]

                fields[name] = note.fields[ord]

            notes.append(
                {
                    "id": id,
                    "fields": fields,
                }
            )

        return {
            "name": deck["name"],
            "totalNotes": total_notes,
            "notes": notes,
        }

    def store_media_file(self, filename=None, data=None):
        if not (filename or data):
            raise Exception("invalid params")

        if aqt.mw.col.media.have(filename):
            raise Exception("file already exists")

        mediaData = base64.b64decode(data)

        aqt.mw.col.media.write_data(filename, mediaData)

        return True

    def update_note_fields(self, note=None):
        if note is None:
            raise Exception("invalid params")

        anki_note = aqt.mw.col.get_note(note["id"])

        for name, value in note["fields"].items():
            if name in anki_note:
                anki_note[name] = value

        aqt.mw.col.update_note(anki_note)

        return True

    def open_notes(self, noteIds=None):
        if noteIds is None:
            raise Exception("invalid params")

        browser = aqt.dialogs.open("Browser", aqt.mw)
        browser.activateWindow()

        browser.form.searchEdit.lineEdit().setText("nid:" + ",".join(map(str, noteIds)))
        browser.onSearchActivated()

        return True

    def get_dupes(self, expression=None):
        if expression is None:
            raise Exception("invalid params")

        dupe_ids = aqt.mw.col.db.all(
            f"""
                SELECT DISTINCT notes.id, cards.did
                FROM notes
                LEFT JOIN cards ON cards.nid = notes.id
                WHERE notes.sfld = ?
                ORDER BY notes.id DESC;
            """,
            expression,
        )

        results = [
            {
                "id": note_id,
                "deck": aqt.mw.col.decks.name(deck_id),
            }
            for [note_id, deck_id] in dupe_ids
        ]

        return results


sh = SodatsukiHelper()
sh.startWebServer()
