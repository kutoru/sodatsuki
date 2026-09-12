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


import json
import select
import socket


class WebRequest:
    def __init__(self, method, headers, body):
        self.method = method
        self.headers = headers
        self.body = body


class WebClient:
    def __init__(self, sock, handler):
        self.sock = sock
        self.handler = handler
        self.readBuff = bytes()
        self.writeBuff = bytes()

    def advance(self, recvSize=1024):
        if self.sock is None:
            return False

        rlist, wlist = select.select([self.sock], [self.sock], [], 0)[:2]
        self.sock.settimeout(5.0)

        if rlist:
            while True:
                try:
                    msg = self.sock.recv(recvSize)
                except (ConnectionResetError, socket.timeout):
                    self.close()
                    return False
                if not msg:
                    self.close()
                    return False
                self.readBuff += msg

                req, length = self.parseRequest(self.readBuff)
                if req is not None:
                    self.readBuff = self.readBuff[length:]
                    self.writeBuff += self.handler(req)
                    break

        if wlist and self.writeBuff:
            try:
                length = self.sock.send(self.writeBuff)
                self.writeBuff = self.writeBuff[length:]
                if not self.writeBuff:
                    self.close()
                    return False
            except:
                self.close()
                return False
        return True

    def close(self):
        if self.sock is not None:
            self.sock.close()
            self.sock = None

        self.readBuff = bytes()
        self.writeBuff = bytes()

    def parseRequest(self, data):
        parts = data.split("\r\n\r\n".encode("utf-8"), 1)
        if len(parts) == 1:
            return None, 0

        lines = parts[0].split("\r\n".encode("utf-8"))
        method = None

        if len(lines) > 0:
            request_line_parts = lines[0].split(" ".encode("utf-8"))
            method = (
                request_line_parts[0].upper() if len(request_line_parts) > 0 else None
            )

        headers = {}
        for line in lines[1:]:
            pair = line.split(": ".encode("utf-8"))
            headers[pair[0].lower()] = pair[1] if len(pair) > 1 else None

        headerLength = len(parts[0]) + 4
        bodyLength = int(headers.get("content-length".encode("utf-8"), 0))
        totalLength = headerLength + bodyLength

        if totalLength > len(data):
            return None, 0

        body = data[headerLength:totalLength]
        return WebRequest(method, headers, body), totalLength


class WebServer:
    def __init__(self, handler):
        self.handler = handler
        self.clients = []
        self.sock = None

    def advance(self):
        if self.sock is not None:
            self.acceptClients()
            self.advanceClients()

    def acceptClients(self):
        rlist = select.select([self.sock], [], [], 0)[0]
        if not rlist:
            return

        clientSock = self.sock.accept()[0]
        if clientSock is not None:
            clientSock.setblocking(False)
            self.clients.append(WebClient(clientSock, self.handlerWrapper))

    def advanceClients(self):
        self.clients = list(filter(lambda c: c.advance(), self.clients))

    def listen(self):
        self.close()

        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.setblocking(False)
        self.sock.bind(("127.0.0.1", 8767))
        self.sock.listen()

    def handlerWrapper(self, req):
        try:
            params = json.loads(req.body.decode("utf-8"))
        except Exception as e:
            reply = format_exception_reply(e)
            body = json.dumps(reply).encode("utf-8")
            headers = self.buildHeaders(body)
            return self.buildResponse(headers, body)

        body = json.dumps(self.handler(params)).encode("utf-8")
        headers = self.buildHeaders(body)

        return self.buildResponse(headers, body)

    def buildHeaders(self, body):
        return [
            ["HTTP/1.1 200 OK", None],
            ["Content-Type", "application/json"],
            ["Content-Length", str(len(body))],
        ]

    def buildResponse(self, headers, body):
        resp = bytes()
        for key, value in headers:
            if value is None:
                resp += "{}\r\n".format(key).encode("utf-8")
            else:
                resp += "{}: {}\r\n".format(key, value).encode("utf-8")

        resp += "\r\n".encode("utf-8")
        resp += body
        return resp

    def close(self):
        if self.sock is not None:
            self.sock.close()
            self.sock = None

        for client in self.clients:
            client.close()

        self.clients = []


def format_success_reply(result):
    return {"result": result, "error": None}


def format_exception_reply(exception):
    return {"result": None, "error": str(exception)}
