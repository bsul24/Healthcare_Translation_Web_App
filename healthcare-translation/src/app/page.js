"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [listening, setListening] = useState(false);
  const [inputLang, setInputLang] = useState("en-US");
  const [outputLang, setOutputLang] = useState("es");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.lang = inputLang;
        recog.onresult = async (event) => {
          let transcript =
            event.results[event.results.length - 1][0].transcript;
          setOriginalText(transcript);
          translateText(transcript);
        };
        setRecognition(recog);
      }
    }
  }, [inputLang]);

  const startListening = () => {
    if (recognition) {
      setListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      setListening(false);
      recognition.stop();
    }
  };

  const translateText = async (text) => {
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, outputLang }),
      });

      const data = await response.json();
      setTranslatedText(data.translation);
    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  const speakText = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = outputLang;
    synth.speak(utterance);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Healthcare Translation App</h1>
      <div className="mb-4">
        <label className="block font-semibold">Input Language:</label>
        <select
          value={inputLang}
          onChange={(e) => setInputLang(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="en-US">English</option>
          <option value="es-ES">Spanish</option>
          <option value="fr-FR">French</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Output Language:</label>
        <select
          value={outputLang}
          onChange={(e) => setOutputLang(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>
      <button
        onClick={listening ? stopListening : startListening}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
      >
        {listening ? "Stop Listening" : "Start Listening"}
      </button>
      <div className="border p-4 rounded mb-4">
        <h2 className="font-semibold">Original Text:</h2>
        <p>{originalText || "Start speaking..."}</p>
      </div>
      <div className="border p-4 rounded mb-4">
        <h2 className="font-semibold">Translated Text:</h2>
        <p>{translatedText || "Waiting for translation..."}</p>
      </div>
      <button
        onClick={() => speakText(translatedText)}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Speak Translation
      </button>
    </div>
  );
}
