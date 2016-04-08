import os
from web import app, socketio


def runserver():
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('WEB_HOST', '127.0.0.0')
    #app.run(port=port, debug=True)
    #app.config['SECRET_KEY'] = 'secret!'
    socketio.run(app, host=host, port=port, debug=True, use_reloader=True)

if __name__ == '__main__':
    runserver()
