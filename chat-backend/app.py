from flask import Flask
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS so the React app can talk to it
app.config['SECRET_KEY'] = 'pstream-secret!'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('join')
def on_join(data):
    room = data.get('room')
    if room:
        join_room(room)
        # Optional: emit a system message to the room when someone joins
        # emit('message', {'type': 'system', 'text': 'A user joined.'}, room=room)

@socketio.on('leave')
def on_leave(data):
    room = data.get('room')
    if room:
        leave_room(room)

@socketio.on('chat_message')
def on_chat_message(data):
    room = data.get('room')
    if room:
        # Broadcast the message to everyone in the room except the sender
        emit('chat_message', data, room=room, include_self=False)

if __name__ == '__main__':
    print("Starting Basement Flask WebSocket Chat Server on port 3001...")
    socketio.run(app, debug=True, port=3001)
