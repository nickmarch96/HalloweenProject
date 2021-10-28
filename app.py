import socketio
from playsound import playsound
import librosa
import soundfile
import time
import RPi.GPIO as GPIO


sio = socketio.Server()
app = socketio.WSGIApp(sio, static_files={
	"/": "./public/"
	})


global_vars = {
	"waveBuffer": "buffer.wav",
	"dispenseTime": 5
	}

GPIO.setmode(GPIO.BCM)
GPIO.setup(23, GPIO.OUT)


@sio.on("connect")
def connect(sid, environ):
	print(sid, "Connected!")

@sio.on("disconnect")
def disconnect(sid):
	print(sid, "disconnected...")

@sio.on("data")
def data_recv(sid, data):
	print("Received data!")
	print(sid, data)

@sio.on("audio-blob")
def recv_audio(sid, data):
	print("Received audio!")
	blob = data["audio-blob"]
	pitch = data["audio-pitch"]
	if not pitch:
		return

	print("Building buffer and processing audio...", end="")
	with open(global_vars["waveBuffer"], "wb") as o:
		o.write(data["audio-blob"])

	try:
		y, sr = librosa.load(global_vars["waveBuffer"])
		y_shifted = librosa.effects.pitch_shift(y, sr, n_steps=int(data["audio-pitch"])*-1)

		soundfile.write(global_vars["waveBuffer"], y_shifted, sr)

		print("done")
		playsound("buffer.wav")
	except:
		print("Failed...")


@sio.on("dispense")
def dispense(sid, data):
	print("Dispensing Candy!")

	GPIO.output(23, GPIO.HIGH)
	time.sleep(global_vars["dispenseTime"])
	GPIO.output(23, GPIO.LOW)


