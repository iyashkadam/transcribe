import "./App.css";
import AudioRecorder from "./components/AudioRecorder.jsx";
import AudioUploader from "./components/AudioUploader.jsx";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

function App() {
  return (
    <>
      <motion.h1 
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-6 text-5xl font-extrabold shadow-xl tracking-wide rounded-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        🗣️ <Typewriter
          words={[
            "Speech-to-Text Transcription 🎙️",
            "Convert Audio to Text Easily! ✨"
          ]}
          loop={Infinity} // Continuous looping
          cursor
          cursorStyle="|"
          typeSpeed={70}  // Increased speed for smoother effect
          deleteSpeed={40}
          delaySpeed={1200}
        />
      </motion.h1>

      <motion.div
        className="flex justify-center items-center h-screen bg-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        <AudioUploader />
        <AudioRecorder />
      </motion.div>
    </>
  );
}

export default App;
