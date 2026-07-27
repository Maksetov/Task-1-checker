import { getStore } from "@netlify/blobs";

// Keyed by STUDENT NAME, not IP — 11 machines on one router must not
// throttle each other. One student re-submitting rapidly still gets capped.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_STUDENT_PER_WINDOW = 4;
const MIN_WORDS = 40;
const MAX_CHARS = 6000;

const SYSTEM_PROMPT = `You are an IELTS Academic Writing Task 1 examiner. Mark strictly against the four official criteria: Task Achievement, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy.

Rules:
- Bands are whole or half numbers only.
- Overall is the mean of the four, rounded to the nearest half band.
- Under 150 words: state the Task Achievement penalty explicitly in taNote.
- If actual chart data is provided, check the student's figures and comparisons against it. Inaccurate or invented data is a Task Achievement problem — flag it as a fix with criterion "TA" and quote what the student wrote. Do not penalise reasonable rounding (e.g. "around 250" for 248).
- Every fix must quote the student's actual words verbatim. Never invent a quote.
- Be specific. Name the repeated word and give three alternatives, not "good vocabulary."
- 5 to 8 fixes, covering different problems.
- nextSteps are concrete actions for the next essay, not vague advice.

Return ONLY valid JSON, no markdown fences, no commentary:
{
  "wordCount": number,
  "ta": number, "cc": number, "lr": number, "gra": number, "overall": number,
  "taNote": string,
  "summary": string,
  "strengths": [string],
  "fixes": [{"quote": string, "issue": string, "criterion": "TA"|"CC"|"LR"|"GRA", "better": string}],
  "nextSteps": [string]
}`;

export let storeFactory = () => getStore("task1-class-ratelimit");
export const __setStoreFactory = (fn) => { storeFactory = fn; };

// Injectable so tests don't hit the real Apps Script URL.
export let webhookSender = async (url, payload) => {
  if (!url) return { skipped: true };
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return { ok: r.ok, status: r.status };
};
export const __setWebhookSender = (fn) => { webhookSender = fn; };

const json = (status, obj) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj)
});

const cleanName = s => String(s || "").trim().slice(0, 60);

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return json(400, { error: "Bad request." }); }

  const { essay = "", chartPrompt = "", chartTitle = "", chartData = "", code = "" } = body;
  const student = cleanName(body.student);

  if (!student) return json(400, { error: "Pick your name before submitting." });

  const expected = process.env.ACCESS_CODE;
  if (expected && code.trim().toLowerCase() !== expected.trim().toLowerCase()) {
    return json(401, { error: "Wrong access code." });
  }

  const words = essay.trim().split(/\s+/).filter(Boolean).length;
  if (words < MIN_WORDS) return json(400, { error: `Write at least ${MIN_WORDS} words. You wrote ${words}.` });
  if (essay.length > MAX_CHARS) return json(400, { error: "That is longer than any Task 1 answer needs to be." });

  // --- Rate limit keyed on student name ---
  try {
    const store = storeFactory();
    const key = `student_${student.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    const now = Date.now();
    const raw = await store.get(key, { type: "json" });
    const hits = (raw?.hits || []).filter((t) => now - t < WINDOW_MS);

    if (hits.length >= MAX_PER_STUDENT_PER_WINDOW) {
      const waitMin = Math.ceil((WINDOW_MS - (now - hits[0])) / 60000);
      return json(429, { error: `${student}, you've submitted ${MAX_PER_STUDENT_PER_WINDOW} times this hour. Try again in ${waitMin} minutes, or ask your teacher.` });
    }
    hits.push(now);
    await store.setJSON(key, { hits });
  } catch (e) {
    console.error("Rate limit store error:", e.message);
    if (!expected) {
      return json(503, { error: "The checker is not fully configured. Tell your teacher." });
    }
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) return json(500, { error: "Server is missing its API key. Contact the teacher." });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `TASK PROMPT:\n${chartPrompt.trim() || "(not provided)"}\n\nACTUAL CHART DATA (use this to check whether the student's figures and comparisons are accurate — do not reveal this list back to the student, just use it to judge their claims):\n${chartData.trim() || "(not provided — judge structure and language only, not figure accuracy)"}\n\nSTUDENT RESPONSE (${words} words):\n${essay.trim()}`
          }
        ]
      })
    });

    clearTimeout(timeout);
    const data = await res.json();

    if (!res.ok) {
      console.error("OpenAI error:", data);
      const msg = data?.error?.code === "insufficient_quota"
        ? "The checker is out of credit. Tell your teacher."
        : "The examiner could not be reached. Try again in a moment.";
      return json(502, { error: msg });
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) return json(502, { error: "Empty response. Try again." });

    let parsed;
    try { parsed = JSON.parse(content.replace(/```json|```/g, "").trim()); }
    catch { return json(502, { error: "Could not read the result. Try again." }); }

    parsed.wordCount = words;
    parsed.student = student;
    parsed.chartTitle = chartTitle;

    // Best-effort delivery to the Sheet + Gmail. A webhook failure must
    // never hide the student's own result from them.
    const webhookUrl = process.env.SHEET_WEBHOOK_URL;
    let delivered = true;
    try {
      const r = await webhookSender(webhookUrl, parsed);
      if (r.skipped) delivered = false;
      else if (!r.ok) { delivered = false; console.error("Webhook non-ok status:", r.status); }
    } catch (e) {
      delivered = false;
      console.error("Webhook error:", e.message);
    }

    parsed._delivered = delivered;
    return json(200, parsed);
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === "AbortError") return json(504, { error: "That took too long. Try again." });
    console.error("Handler error:", e);
    return json(500, { error: "Something broke. Try again." });
  }
};
