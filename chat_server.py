import asyncio
import json
import websockets

# Set to store connected clients and list for message history
connected_clients = set()
message_history = []  # List of JSON strings representing messages

async def broadcast(message):
    if connected_clients:  # Only broadcast if there are connected clients
        await asyncio.wait([client.send(message) for client in connected_clients])

async def handler(websocket, path):
    # Add new client and send existing message history
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
                # Create the JSON payload for broadcasting
                broadcast_data = json.dumps({
                    "username": username,
                    "message": chat_message
                })
                # Save the message in history
                message_history.append(broadcast_data)
                # Broadcast the new message to all connected clients
                await broadcast(broadcast_data)
            except json.JSONDecodeError:
                print("Received non-JSON message.")
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected.")
    finally:
        connected_clients.remove(websocket)

async def clear_history_periodically():
    while True:
        await asyncio.sleep(3600)  # Wait for one hour (3600 seconds)
        message_history.clear()
        clear_notification = json.dumps({
            "system": True,
            "message": "Chat history cleared."
        })
        await broadcast(clear_notification)
        print("Chat history cleared.")

async def main():
    server = await websockets.serve(handler, "0.0.0.0", 8765)
    print("Chat server started on ws://localhost:8765")
    # Run the history clearing routine concurrently with the server
    asyncio.create_task(clear_history_periodically())
    await server.wait_closed()

asyncio.run(main())
