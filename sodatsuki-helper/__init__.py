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


import inspect
import os
import aqt
from aqt.qt import QTimer


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

        print(name, params)

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

    def open_note(self, noteId=None):
        if noteId is None:
            raise Exception("Invalid params")

        browser = aqt.dialogs.open("Browser", aqt.mw)
        browser.activateWindow()

        browser.form.searchEdit.lineEdit().setText(f"nid:{noteId}")
        browser.onSearchActivated()

        return True


sh = SodatsukiHelper()
sh.startWebServer()
