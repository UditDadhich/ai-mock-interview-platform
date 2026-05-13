import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.services.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

export const analyzeResume = async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }
    filePath = req.file.path;

    const fileBuffer = await fs.promises.readFile(filePath);
    const unit8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({ data: unit8Array }).promise;

    let resumeText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    const messages = [
      {
        role: "system",
        content: `You are a resume parser. Extract data into the exact JSON format provided. 
                Do not include any conversational text or markdown blocks. 
                {
                  "role": "Current or targeted job title",
                  "experience": "Years of experience",
                  "projects": ["list of project names"],
                  "skills": ["list of technical skills"]
                }`,
      },
      {
        role: "user",
        content: `Analyze this resume text: ${resumeText}`,
      },
    ];

    const aiResponse = await askAi(messages);

    // CLEANUP: Remove markdown code blocks if the AI included them
    const cleanJson = aiResponse.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    // Delete file after successful processing
    await fs.promises.unlink(filePath);

    res.json({
      ...parsed,
      resumeText,
    });
  } catch (error) {
    console.error("Analysis Error:", error);

    // Cleanup file if an error occurred
    if (filePath && fs.existsSync(filePath)) {
      await fs.promises
        .unlink(filePath)
        .catch((err) => console.log("Cleanup error:", err));
    }

    return res.status(500).json({
      message: "Failed to analyze resume",
      error: error.message,
    });
  }
};

export const generateQuestion = async (req, res) => {
  try {
    const { role, experience, mode, resumeText, projects, skills } = req.body;

    role = role?.trim();
    experience = experience.trim();
    mode: mode?.trim();

    if (!role || !experience || !mode) {
      return res
        .status(400)
        .json({ message: "Role , Experience and Mode are required." });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.credits < 50) {
      return res.status(400).json({
        message: "Not enough credits.Minimum 50 credits required.",
      });
    }

    const projectText =
      Array.isArray(projects) && projects.length ? projects.join(", ") : "None";

    const skillsText =
      Array.isArray(skills) && projects.length ? skills.join(", ") : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
        Role: ${role}
        Experience: ${experience}
        InterviewMode: ${mode}
        Projects: ${projectText}
        Skills: ${skillsText}
        Resume: ${safeResume}
        `;

    if (!userPrompt.trim()) {
      return res.status(400).json({
        message: "Prompt content is empty.",
      });
    }

    const message = [
      {
        role: "system",
        content: `
                You are a real human interviewer conducting a professional interview.

                Speak in simple, natural English as if you are directly talking to the candidate.

                Generate exactly 5 interview questions.

                Strict Rules:
                -Each question must contain between 15 and 25 words.
                -Each question must be simple complete sentence.
                -Do NOT number them.
                -Do NOT add explanations.
                -Do NOT add extra text before or after.
                -One question per line only.
                -Keep language simple and conversational.
                -Questions must feel practical and realistic.

                Difficulty progression:
                Question 1 -> easy
                Question 2 -> easy
                Question 3 -> medium
                Question 4 -> medium
                Question 5 -> hard
                Make questions based on the candidate's role , experience ,interviewMode , projects , skills and resume details.
                `,
      },

      {
        role: "user",
        content: userPrompt,
      },
    ];

    const aiResponse = await askAi(message);

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({
        message: "AI returned empty response.",
      });
    }

    const questionsArray = aiResponse
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      return res.status(500).json({
        message: "AI failed to generate questions.",
      });
    }

    user.credits -= 50;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120][index],
      })),
    });

    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    const interview = await Interview.findById(interviewId);
    const question = interview.questions[questionIndex];

    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer";
      question.answer = "";

      await interview.save();

      return res.json({
        feedback: question.feedback,
      });
    }

    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = answer;

      await interview.save();

      return res.json({
        feedback: question.feedback,
      });
    }

    const messages = [
      {
        role: "system",
        content: `
            You are a professional human interviewer evaluating a candidate's answer in a real interview.

            Evaluate naturally and fairly, like a real person would.

            Score the answer in these areas (0 to 10):

            1. Confidence - Does the answer sound clear, confident and well-presented?
            2. Communication - Is the language simple, clear and easy to understand?
            3. Correctness - Is the answer accurate, relevant, and complete?

            Rules:
            -Be realistic and unbiased.
            -Do not give random high scores.
            - If the answer is weak, score low.
            - If the answer is strong and detailed, score high.
            - Consider clarity, structure, and relevance.

            Calculate:
            finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

            Feedback Rules:
            - Write natural human feedback.
            - 10 to 15 words only.
            - Sound like real interview feedback.
            - Can suggest improvement if needed.
            - Do NOT repeat the question.
            - Do NOT explain scoring.
            - Keep tone professional and honest.

            Return ONLY valid JSON in this format:

            {
              "confidence": number,
              "communication": number,
              "correctness": number,
              "finalScore": number,
              "feedback": "short human feedback"
            }
            `,
      },
      {
        role: "user",
        content: `
            Question: ${question.question}
            Answer: ${answer}
    `,
      },
    ];

    const aiResponse = await askAi(message)

    const parsed = JSON.parse(aiResponse);

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;

    await interview.save();f
  } catch (error) {}
};
