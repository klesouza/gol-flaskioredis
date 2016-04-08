from flask import Flask, jsonify, request, make_response, current_app
from web import app, socketio
from web.gol import GOL
import os
import json, os
from flask.ext.socketio import emit
import numpy as np
import eventlet
import numpy as np

eventlet.monkey_patch()

@app.route('/')
def index():
    appdir = os.path.abspath(os.path.dirname(__file__))
    with app.app_context():
        current_app.model = None
    return make_response(open(os.path.join(appdir, 'views/index.html')).read())

@app.route('/start')
def start():
    with app.app_context():
        print current_app.model
    return 'ok'
import time

@socketio.on('run', namespace='/test')
def ws_run(message):
    with app.app_context():
        current_app.gol = GOL()
        X = np.zeros((17, 17))
        X[2, 4:7] = 1
        X[4:7, 7] = 1
        X += X.T
        X += X[:, ::-1]
        X += X[::-1, :]
        X = np.array(message["data"])
        current_app.gol.start(X)

@socketio.on('stop', namespace='/test')
def ws_stop():
    with app.app_context():
        current_app.gol.stop()

@socketio.on('getiter', namespace='/test')
def test_getiter():
    with app.app_context():
        str = current_app.gol.get_step()
        emit('update', str)

@socketio.on('connect', namespace='/test')
def test_connect():
    emit('status', {'data': 1})

@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print 'close'
    emit('status', {'data': 0})

@socketio.on('alive', namespace='/test')
def test_alive():
    print 'alive'
