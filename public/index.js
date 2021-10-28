
var sio = io();

sio.on("connect", () => {
	console.log("Connected!");
});

sio.on("disconnect", () => {
	console.log("Disconnected!");
});

sio.on("status", function(msg) {
	console.log(msg);
});

var audioContext = new AudioContext();
var audioRecorder = null;

var recbtn = document.getElementById("recbtn");

var holdTimerID;
var holdCounter = 0;
var recording = false;

var pressHoldEvent = new CustomEvent("pressHold");
var pressHoldDuration = 120;

recbtn.addEventListener("mousedown", StartAudioRecording, false);
recbtn.addEventListener("mouseup", StopAudioRecording, false);
recbtn.addEventListener("touchstart", StartAudioRecording, false);
recbtn.addEventListener("touchend", StopAudioRecording, false);
recbtn.addEventListener("pressHold", StopAudioRecording, false);


function holdTimer() {
	console.log("timer tick.");

	if (holdCounter < pressHoldDuration) {
		holdTimerID = requestAnimationFrame(holdTimer);
		holdCounter++;
	} else {
		recbtn.dispatchEvent(pressHoldEvent);
	}
}

function StartAudioRecording(e) {
	if (!recording) {
		recording = true;
		console.log("Recording audio...");
		requestAnimationFrame(holdTimer);
		//e.preventDefault();
		audioRecorder && audioRecorder.clear();
		audioRecorder && audioRecorder.record();
	}
}

function PostExport(blob) {
	var sioData = {"audio-blob": blob, "audio-pitch": document.getElementById("pitch").value}
	console.log(sioData);
	console.log(document.getElementById("pitch").value);
	sio.emit("audio-blob", sioData);
}

function StopAudioRecording(e) {
	if (recording) {
		recording = false;
		console.log("Stopping audio recording...");
		cancelAnimationFrame(holdTimerID);
		holdCounter = 0;
		audioRecorder.stop();
		audioRecorder.exportWAV(PostExport);
	}
}

function startUserMedia(stream) {
	console.log("Audio input established.");
	var input = audioContext.createMediaStreamSource(stream);
	audioRecorder = new Recorder(input);
}


function initAudio() {
	// https://github.com/mattdiamond/Recorderjs
	try {
		window.AudioContext = (window.AudioContext || window.webkitAudioContext);
		navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
		window.URL = (window.URL || window.webkitUR);

		audioContext = new AudioContext;
		console.log("Audio context initialized.");

	} catch (e) {
		console.log("Web audio not supported in this browser!");
	}

	navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
		console.log("Unable to find audio input.");
	});
};
window.addEventListener('load', initAudio);