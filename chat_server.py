from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import asyncio

message_history = []  # List to store JSON messages


async def clear_history_periodically():
    while True:
        await asyncio.sleep(3600)  # 3600 seconds = 1 hour
        message_history.clear()
        message_history.append(
            {"username": "System", "message": "Chat history cleared."}
        )
        print("Chat history cleared.")


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):

    def _set_response(self, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-type", "application/json")
        self.end_headers()

    def do_GET(self):
        if self.path == "/messages":
            self._set_response()
            self.wfile.write(json.dumps(message_history).encode("utf-8"))
        else:
            self._set_response(404)
            self.wfile.write(b"Not Found")

    def do_POST(self):
        content_length = int(self.headers["Content-Length"])
        post_data = self.rfile.read(content_length)
        try:
            data = json.loads(post_data)
            username = data.get("username", "Anonymous")
            chat_message = data.get("message", "")
            message_data = json.dumps({"username": username, "message": chat_message})
            message_history.append(message_data)
            self._set_response()
            self.wfile.write(b"Message received")
        except json.JSONDecodeError:
            self._set_response(400)
            self.wfile.write(b"Invalid JSON")


async def run(
    server_class=HTTPServer, handler_class=SimpleHTTPRequestHandler, port=8080
):
    server_address = ("", port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting http server on port {port}")
    httpd.serve_forever()


async def main():
    asyncio.create_task(clear_history_periodically())
    await asyncio.gather(run())


if __name__ == "__main__":
    asyncio.run(main())
