const Groq = require("groq-sdk");

function getInstructionForPreset(preset, language) {
  let focus = "correctness, maintainability, readability, performance, security, scalability, and test coverage.";
  
  if (preset === "security") {
    focus = "security vulnerabilities, injection risks, data leakage, authentication/authorization issues, and secure coding best practices.";
  } else if (preset === "performance") {
    focus = "performance bottlenecks, memory leaks, algorithmic complexity (Big O), API speed, resource utilization, and caching opportunities.";
  } else if (preset === "refactor") {
    focus = "clean code principles, modularity, DRY principle, SOLID design patterns, readability, naming conventions, and reducing cognitive complexity.";
  }

  return `You are an expert senior code reviewer with 10+ years of professional software engineering experience.
Review the submitted ${language || "JavaScript"} code focusing strictly on: ${focus}

Be direct, critical, and constructive.

Provide the review in clean, professional Markdown with these sections:
- 📊 Summary (Brief overview of findings)
- ⚠️ Crucial Issues (Bulleted list of bugs, issues, or risks)
- 💡 Suggested Fixes & Rationale (Explain WHY the issues exist and HOW to fix them)
- 🚀 Improved Code (A complete rewrite or refactored version highlighting improvements)
- 📝 Final Best Practices (A short list of future-proof recommendations)`;
}

async function generateContent(code, language = "javascript", preset = "general") {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing in BackEnd/.env");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const instructions = getInstructionForPreset(preset, language);

  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: instructions
      },
      {
        role: "user",
        content: `Please review my ${language} code snippet:\n\n\`\`\`${language}\n${code}\n\`\`\``,
      },
    ],
  });

  return response.choices[0]?.message?.content || "No review generated.";
}

module.exports = generateContent;