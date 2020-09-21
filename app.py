

from flask import Flask, render_template
from flask_socketio import SocketIO


app = Flask(__name__)
socketio = SocketIO(app)


def data():
	return {"data": 12}




@app.route('/')
def default():
	return render_template('controller.html')


@socketio.on("connect")
def ws_conn():
	print("Connected!")
	socketio.emit("status", data())


@socketio.on("disconnect")
def ws_disconn():
	print("Disconnected.")


@socketio.on("get_status")
def ws_get_status(msg):
	print(msg)
	socketio.emit("status", data())



	
if __name__ == '__main__':
	app.run(host="10.0.0.50", port=80)