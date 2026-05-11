import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.services.js";

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
            // Added better spacing between text items
            const pageText = content.items.map(item => item.str).join(" ");
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
                }`
            },
            {
                role: "user",
                content: `Analyze this resume text: ${resumeText}`
            }
        ];

        const aiResponse = await askAi(messages);

        // CLEANUP: Remove markdown code blocks if the AI included them
        const cleanJson = aiResponse.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        // Delete file after successful processing
        await fs.promises.unlink(filePath);

        res.json({
            ...parsed,
            resumeText
        });

    } catch (error) {
        console.error("Analysis Error:", error);

        // Cleanup file if an error occurred
        if (filePath && fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath).catch(err => console.log("Cleanup error:", err));
        }
        
        return res.status(500).json({ 
            message: "Failed to analyze resume", 
            error: error.message 
        });
    }
};