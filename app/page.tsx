"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ✅ DYNAMIC CLARITY SCORE
  const calculateScore = (data: any) => {
    let score = 0;

    // Goal
    if (data?.goal) {
      if (data.goal.length > 60) score += 25;
      else if (data.goal.length > 30) score += 15;
      else score += 10;
    }

    // Steps
    if (data?.steps && data.steps.length > 0) {
      if (data.steps.length >= 5) score += 25;
      else if (data.steps.length >= 3) score += 15;
      else score += 10;
    }

    // Timeline
    if (data?.timeline) {
      const timeline = data.timeline.toLowerCase();

      if (
        timeline.includes("week") ||
        timeline.includes("month") ||
        timeline.includes("day")
      ) {
        score += 25;
      } else if (
        !timeline.includes("not") &&
        !timeline.includes("missing")
      ) {
        score += 15;
      }
    }

    // Missing Elements
    const missing = data?.missing_elements;

    if (missing) {
      let missingCount = 0;

      Object.values(missing).forEach((val: any) => {
        if (
          val?.toLowerCase().includes("missing") ||
          val?.toLowerCase().includes("unclear")
        ) {
          missingCount++;
        }
      });

      if (missingCount === 0) score += 25;
      else if (missingCount <= 2) score += 15;
      else score += 5;
    }

    return score;
  };

  const handleAnalyze = async () => {
    if (!input) return;

    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ input }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const score = result ? calculateScore(result) : 0;

  return (
    <div className="min-h-screen bg-[#f5f5f4] text-gray-800">

      {/* Navbar */}
      <div className="flex justify-between items-center px-8 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 text-white p-2 rounded-lg">✨</div>
          <div>
            <h1 className="font-semibold text-lg">Explain My Plan</h1>
            <p className="text-sm text-gray-500">AI Clarity & Structuring Tool</p>
          </div>
        </div>

        <button className="border px-4 py-1 rounded-full text-sm text-gray-600">
          API Key ✓
        </button>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center mt-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-3xl">
          Turn messy ideas into <br /> clear, actionable plans
        </h1>

        <p className="text-gray-500 mt-4 max-w-xl">
          Paste your raw idea below. Our AI will structure it, identify gaps,
          score its clarity, and give you concrete next steps.
        </p>

        <div className="mt-10 w-full max-w-3xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your idea here..."
            className="w-full h-40 p-5 rounded-xl border outline-none resize-none text-lg"
          />

          {/* Examples */}
          <div className="flex flex-wrap gap-2 mt-3 text-sm text-gray-500">
            <span>💡 Try an example:</span>

            <button
              onClick={() =>
                setInput("I want to start a YouTube channel and earn money quickly")
              }
              className="bg-gray-200 px-3 py-1 rounded-full"
            >
              YouTube channel
            </button>

            <button
              onClick={() =>
                setInput("I want to build a SaaS product for students")
              }
              className="bg-gray-200 px-3 py-1 rounded-full"
            >
              SaaS product
            </button>
          </div>

          {/* Button */}
          <div className="flex justify-end mt-5">
            <button
              onClick={handleAnalyze}
              className="bg-green-700 text-white px-6 py-3 rounded-xl text-lg hover:bg-green-800 transition"
            >
              {loading ? "Analyzing..." : "Analyze My Plan →"}
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS */}
      {result && (
        <div className="max-w-4xl mx-auto mt-10 space-y-4 px-4">

          {/* 🔥 BONUS: BEFORE vs AFTER */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-bold text-lg mb-3">Before vs After</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Before</h3>
                <p className="text-sm text-gray-600">{input}</p>
              </div>

              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">After</h3>
                <p className="text-sm text-gray-800">
                  {result.simplified_version}
                </p>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-bold text-lg mb-2">Clarity Score</h2>
            <p
              className={`text-3xl font-bold ${
                score > 80
                  ? "text-green-600"
                  : score > 50
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {score} / 100
            </p>
          </div>

          {/* Goal */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-bold text-lg mb-2">Goal</h2>
            <p>{result.goal}</p>
          </div>

          {/* Method */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-bold text-lg mb-2">Method / Approach</h2>
            <p>{result.method}</p>
          </div>

          {/* Steps */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-bold text-lg mb-2">Steps</h2>
            <ul className="list-disc ml-5">
              {result.steps?.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Timeline */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-bold text-lg mb-2">Timeline</h2>
            <p
              className={`${
                !result.timeline ||
                result.timeline.toLowerCase().includes("not")
                  ? "text-red-500 font-medium"
                  : ""
              }`}
            >
              {result.timeline &&
              !result.timeline.toLowerCase().includes("not")
                ? result.timeline
                : "Missing"}
            </p>
          </div>

          {/* Missing */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-bold text-lg mb-2">Missing Elements</h2>
            <ul className="list-disc ml-5">
              <li>Goal Clarity: {result.missing_elements?.goal_clarity}</li>
              <li>Execution Steps: {result.missing_elements?.execution_steps}</li>
              <li>Resources: {result.missing_elements?.resources}</li>
              <li>Timeline: {result.missing_elements?.timeline}</li>
            </ul>
          </div>

          {/* Simplified */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-bold text-lg mb-2">Simplified Version</h2>
            <p>{result.simplified_version}</p>
          </div>

          {/* Actions */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-bold text-lg mb-2">Action Steps</h2>
            <ul className="list-disc ml-5">
              {result.action_steps?.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
}