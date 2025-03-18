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
        "https://transcribe-7nrf.onrender.com/upload/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const fileUrl = uploadResponse.data.file_url;
      const filename = file.name;
      setMessage("✅ Upload successful!");

      const transcribeResponse = await axios.post(
        "https://transcribe-7nrf.onrender.com/transcription/transcribe",
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
    if (showHistory) {
      setShowHistory(false);
      return;
    }

    try {
      const response = await axios.get(
        "https://transcribe-7nrf.onrender.com/transcription/history"
      );
      setHistory(response.data);
      setShowHistory(true);
    } catch (error) {
      console.error("❌ Error fetching history:", error);
    }
  };

  return (
    <div className="relative p-6 bg-gray-100 shadow-lg rounded-lg w-full max-w-2xl mx-auto text-center border border-gray-200">
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
        className={`mt-4 flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold transition duration-300 ${uploading
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
        {showHistory ? "Hide" : "Show"} Transcription History
      </button>

      {showHistory && (
        <div className="absolute left-0 w-full bg-white p-4 rounded-lg shadow-lg border border-gray-300 max-h-48 overflow-y-auto z-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">
            📜 Transcription History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">Filename</th>
                  <th className="border border-gray-300 p-2">Transcription</th>
                  <th className="border border-gray-300 p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-gray-500 text-center p-3">
                      No history found.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => ( // ✅ Show only 3 initially but allow full scroll
                    <tr key={item.id} className="border-t">
                      <td className="border border-gray-300 p-2 truncate max-w-[150px]">
                        {item.filename}
                      </td>
                      <td className="border border-gray-300 p-2 max-h-32 overflow-auto max-w-[300px] truncate">
                        {item.transcription}
                      </td>
                      <td className="border border-gray-300 p-2 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
