import sys
import json
import struct
import easyocr


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


reader = easyocr.Reader(lang_list=["ja"], gpu=True)
log("READY")


while True:
    try:
        image_buffer = read_buffer()
        log(f"Got image data with size: {len(image_buffer)}")

        result = reader.readtext(image=image_buffer, detail=0)
        send({"result": result, "error": None})
    except Exception as e:
        send({"result": None, "error": str(e)})
