import sys
import json
import struct
import whisper
import torch
from typing import Dict, Any, List, cast


def log(*values):
    print(*values, file=sys.stderr)
    sys.stderr.flush()


def send(data):
    print(json.dumps(data))
    sys.stdout.flush()


def read_buffer_size():
    data = sys.stdin.buffer.read(4)
    return struct.unpack(">I", data)[0]


def read_buffer():
    size = read_buffer_size()
    return sys.stdin.buffer.read(size)


model = whisper.load_model(name="turbo", device="cuda")
log("READY")


while True:
    try:
        audio_buffer = read_buffer()
        log(f"Got audio data with size: {len(audio_buffer)}")

        audio = torch.frombuffer(buffer=audio_buffer, dtype=torch.float32)
        result = model.transcribe(audio=audio, language="ja", task="transcribe")

        segments = cast(List[Dict[str, Any]], result["segments"])
        result = [item["text"] for item in segments]

        send({"result": result, "error": None})
    except Exception as e:
        send({"result": None, "error": str(e)})
