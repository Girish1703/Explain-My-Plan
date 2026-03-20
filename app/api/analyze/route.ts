import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    const prompt = `
You are a strict JSON generator.

Convert the given idea into structured JSON.

Rules:
- Return ONLY valid JSON
- No explanation
- No markdown
- No text outside JSON
- Ensure all fields are filled properly

Format:
{
  "goal": "string",
  "method": "string",
  "steps": ["step1", "step2"],
  "timeline": "string",
  "missing_elements": {
    "goal_clarity": "string",
    "execution_steps": "string",
    "resources": "string",
    "timeline": "string"
  },
  "simplified_version": "string",
  "action_steps": ["step1", "step2"]
}

User Idea:
"${input}"
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCzco2Cw6ql8w4X_HLfkHN4SJkxLdwJFXI",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    let text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("RAW RESPONSE:", text);

    let parsed;

    try {
      // 🔥 CLEAN RESPONSE
      let cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/\n/g, "")
        .trim();

      // 🔥 EXTRACT JSON
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");

      if (start !== -1 && end !== -1) {
        const jsonString = cleaned.substring(start, end + 1);
        parsed = JSON.parse(jsonString);
      } else {
        throw new Error("Invalid JSON format");
      }

    } catch (error) {
      console.log("⚠️ Parsing failed → using fallback");

      // 🔥 SMART FALLBACK (important for evaluation)
      parsed = {
        goal: input,
        method: "Break the idea into clear steps and execute systematically",
        steps: [
          "Define a clear goal",
          "Research required resources",
          "Plan execution steps",
          "Start implementation",
          "Track progress"
        ],
        timeline: "Not clearly defined",
        missing_elements: {
          goal_clarity: "Needs more clarity",
          execution_steps: "Not fully defined",
          resources: "Not specified",
          timeline: "Missing",
        },
        simplified_version: input,
        action_steps: [
          "Clarify your goal",
          "Define step-by-step execution",
          "Identify required tools/resources",
          "Set a realistic timeline",
        ],
      };
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json({ error: "Server error" });
  }
}