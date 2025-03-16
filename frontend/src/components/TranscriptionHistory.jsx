import { useState } from "react";
import axios from "axios";
import { FaCloudUploadAlt, FaHistory } from "react-icons/fa";

const AudioUploader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [transcription, setTranscription] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const handleUpload = async () => {
    if (!file) return setMessage("❌ Please select an audio file first.");

    setUploading(true);
    setMessage("");
    setTranscription("");

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const uploadResponse = await axios.post(
        "http://localhost:5000/upload/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const fileUrl = uploadResponse.data.file_url;
      const filename = file.name;
      setMessage("✅ Upload successful!");

      const transcribeResponse = await axios.post(
        "http://localhost:5000/transcription/transcribe",
        {
          audio_url: fileUrl,
          filename,
        }
      );

      setTranscription(transcribeResponse.data.transcription);
    } catch (error) {
      setMessage("❌ Error processing request.");
      console.error("Error:", error);
    } finally {
      setUploading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/transcription/history"
      );
      setHistory(response.data);
      setShowHistory(true);
    } catch (error) {
      console.error("❌ Error fetching history:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 shadow-lg rounded-lg w-full max-w-md mx-auto text-center border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">📤 Upload & Transcribe</h2>

      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className={`mt-4 flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold transition duration-300 ${
          uploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        <FaCloudUploadAlt className="mr-2" />
        {uploading ? "Processing..." : "Upload & Transcribe"}
      </button>

      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}

      {transcription && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow text-left max-h-40 overflow-auto break-words whitespace-pre-wrap">
          <h3 className="text-lg font-semibold">📝 Transcription:</h3>
          <p className="text-gray-700">{transcription}</p>
        </div>
      )}

      <button
        onClick={fetchHistory}
        className="mt-6 flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold transition duration-300 bg-gray-700 hover:bg-gray-800"
      >
        <FaHistory className="mr-2" />
        Show Transcription History
      </button>

      {showHistory && (
        <div className="mt-6 text-left max-h-60 overflow-auto">
          <h3 className="text-lg font-semibold mb-2">
            📜 Transcription History
          </h3>
          <ul className="space-y-3">
            {history.length === 0 ? (
              <p className="text-gray-500">No history found.</p>
            ) : (
              history.map((item) => (
                <li
                  key={item.id}
                  className="p-3 bg-white rounded shadow break-words whitespace-pre-wrap"
                >
                  <h4 className="font-semibold text-gray-800">
                    {item.filename}
                  </h4>
                  <p className="text-gray-700 max-h-32 overflow-auto">
                    {item.transcription}
                  </p>
                  <span className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;



////////////////////////////////////////





import { useState } from "react";
import axios from "axios";
import { FaMicrophone, FaStop } from "react-icons/fa";

const AudioRecorder = ({ onRecordingComplete }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState("");

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        const file = new File([blob], `recording-${Date.now()}.wav`, {
          type: "audio/wav",
        });
        setAudioBlob(blob);

        const formData = new FormData();
        formData.append("audio", file);
        formData.append("filename", file.name);

        try {
          const uploadResponse = await axios.post(
            "http://localhost:5000/upload/upload",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          const fileUrl = uploadResponse.data.file_url;

          const transcribeResponse = await axios.post(
            "http://localhost:5000/transcription/transcribe",
            { audio_url: fileUrl, filename: file.name }
          );

          setTranscription(transcribeResponse.data.transcription);
        } catch (error) {
          console.error("Error uploading/transcribing:", error);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    } else {
      console.error("No active media recorder found");
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-h-max w-full max-w-md mx-auto text-center border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">🎤 Record & Transcribe</h2>

      <button
        onClick={recording ? stopRecording : startRecording}
        className={`flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold transition duration-300 ${
          recording
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {recording ? (
          <FaStop className="mr-2" />
        ) : (
          <FaMicrophone className="mr-2" />
        )}
        {recording ? "Stop Recording" : "Start Recording"}
      </button>

      {audioBlob && (
        <audio
          controls
          src={URL.createObjectURL(audioBlob)}
          className="mt-4 w-full rounded-lg shadow"
        ></audio>
      )}

      {transcription && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow text-left break-words whitespace-pre-wrap">
          <h3 className="text-lg font-semibold">📝 Transcription:</h3>
          <p className="text-gray-700">{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
