from flask import Flask
from flask.ext.socketio import SocketIO

app = Flask(__name__)
app.url_map.strict_slashes = False
socketio = SocketIO(app, async_mode='eventlet')
import web.home
