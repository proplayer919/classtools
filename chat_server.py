import asyncio
import json
import websockets
from http import HTTPStatus

connected_clients = set()
message_history = []  # List to store JSON messages


async def process_request(path, request_headers):
    # Check if the request is trying to perform a WebSocket upgrade.
    # If not, return a proper HTTP response.
    if request_headers.get("Upgrade", "").lower() != "websocket":
        return HTTPStatus.BAD_REQUEST, [], b"Expected WebSocket handshake\n"
    # Return None to continue with the normal handshake
    return None


async def broadcast(message):
    if connected_clients:
        await asyncio.wait([client.send(message) for client in connected_clients])


async def handler(websocket, path):
    # Register new client and send existing message history
    connected_clients.add(websocket)
    print("Client connected.")
    for msg in message_history:
        await websocket.send(msg)
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                username = data.get("username", "Anonymous")
                chat_message = data.get("message", "")
                broadcast_data = json.dumps(
                    {"username": username, "message": chat_message}
                )
                message_history.append(broadcast_data)
                await broadcast(broadcast_data)
            except json.JSONDecodeError:
                print("Received non-JSON message.")
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected.")
    finally:
        connected_clients.remove(websocket)


async def clear_history_periodically():
    while True:
        await asyncio.sleep(3600)  # 3600 seconds = 1 hour
        message_history.clear()
        clear_notification = json.dumps(
            {"system": True, "message": "Chat history cleared."}
        )
        await broadcast(clear_notification)
        print("Chat history cleared.")


async def main():
    server = await websockets.serve(
        handler,
        "0.0.0.0",
        8080,
        process_request=process_request,  # Use our custom request processor
    )
    print("Chat server started on ws://localhost:8080")
    asyncio.create_task(clear_history_periodically())
    await server.wait_closed()


asyncio.run(main())
