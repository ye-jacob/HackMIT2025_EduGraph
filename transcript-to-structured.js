#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Configuration
const GEMINI_API_KEY = 'AIzaSyDwF3aqK1i_PLJCIm9exxk6-0gt6yqNp4Q';
const TRANSCRIPT_FILE = 'transcript.txt';
const OUTPUT_FILE = 'mit_18_06_lecture_01_structured_transcript.json';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Parse transcript file and extract content
 */
function parseTranscript(filename) {
    try {
        const content = fs.readFileSync(filename, 'utf8');
        return content;
    } catch (error) {
        console.error(`Error reading transcript file: ${error.message}`);
        process.exit(1);
    }
}

/**
 * Create the prompt for Gemini to structure the transcript
 */
function createPrompt(transcriptContent) {
    return `
You are an expert educational content analyst specializing in mathematics and linear algebra. I need you to convert a lecture transcript into a detailed structured JSON format that captures the hierarchical organization of educational content.

Here is the transcript:

${transcriptContent}

Please analyze this transcript and create a structured JSON with the following format:

{
  "lecture_info": {
    "course": "MIT 18.06 Linear Algebra",
    "lecture_number": 1,
    "instructor": "Gilbert Strang", 
    "title": "The Geometry of Linear Equations"
  },
  "hierarchical_structure": {
    "layer_1": [
      {
        "id": "1",
        "title": "Main Topic Title",
        "layer_2": [
          {
            "id": "1.1", 
            "title": "Sub-topic",
            "layer_3": [
              {"id": "1.1.1", "title": "Specific concept"},
              {"id": "1.1.2", "title": "Another specific concept"}
            ]
          },
          {"id": "1.2", "title": "Another sub-topic"}
        ]
      }
    ]
  },
  "detailed_breakdown": [
    {
      "id": "1.1",
      "timestamp": "0:00-0:30",
      "category": "introduction|definition|example|method|solution|visualization|extension|transition",
      "subcategory": "specific_subcategory_name",
      "detail": "Detailed description of what happens in this segment, including specific mathematical concepts, equations, and examples mentioned"
    }
  ]
}

CRITICAL REQUIREMENTS:
1. Create a DEEP hierarchical structure with 3+ layers that reflects the educational flow
2. Use EXACT timestamps from the transcript (format: "start:end")
3. Assign appropriate categories: introduction, definition, example, method, solution, visualization, extension, transition
4. Create meaningful subcategories that describe the specific mathematical content
5. Provide DETAILED descriptions that capture:
   - Specific mathematical concepts and equations
   - Examples with numbers and solutions
   - Visual descriptions and geometric interpretations
   - Key transitions and emphasis points
6. Ensure the hierarchical structure has at least 3 layers deep (layer_1, layer_2, layer_3)
7. Make sure all IDs are unique and follow the pattern (1, 1.1, 1.1.1, etc.)
8. Focus on mathematical concepts, examples, and pedagogical structure
9. Include important transitions and emphasis points (like starred concepts)
10. Create MANY detailed breakdown segments (aim for 50+ segments)
11. Each segment should be 30-60 seconds of content
12. Include specific mathematical notation, equations, and examples in the details

Return ONLY the JSON object, no additional text or formatting.
`;
}

/**
 * Call Gemini API to structure the transcript
 */
async function structureTranscript(transcriptContent) {
    try {
        console.log('Sending transcript to Gemini for structuring...');
        
        const prompt = createPrompt(transcriptContent);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Clean up the response to extract just the JSON
        let jsonText = text.trim();
        
        // Remove any markdown code blocks if present
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        return jsonText;
    } catch (error) {
        console.error(`Error calling Gemini API: ${error.message}`);
        throw error;
    }
}

/**
 * Validate and save the structured JSON
 */
function saveStructuredTranscript(jsonText) {
    try {
        // Parse to validate JSON format
        const structuredData = JSON.parse(jsonText);
        
        // Basic validation
        if (!structuredData.lecture_info || !structuredData.hierarchical_structure || !structuredData.detailed_breakdown) {
            throw new Error('Invalid JSON structure: missing required fields');
        }
        
        // Save to file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(structuredData, null, 2));
        console.log(`✅ Successfully saved structured transcript to ${OUTPUT_FILE}`);
        
        // Print summary
        console.log('\n📊 Summary:');
        console.log(`- Course: ${structuredData.lecture_info.course}`);
        console.log(`- Lecture: ${structuredData.lecture_info.title}`);
        console.log(`- Main topics: ${structuredData.hierarchical_structure.layer_1.length}`);
        console.log(`- Detailed segments: ${structuredData.detailed_breakdown.length}`);
        
    } catch (error) {
        console.error(`Error saving structured transcript: ${error.message}`);
        throw error;
    }
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('🚀 Starting transcript structuring process...\n');
        
        // Check if transcript file exists
        if (!fs.existsSync(TRANSCRIPT_FILE)) {
            console.error(`❌ Transcript file '${TRANSCRIPT_FILE}' not found!`);
            process.exit(1);
        }
        
        // Parse transcript
        console.log(`📖 Reading transcript from ${TRANSCRIPT_FILE}...`);
        const transcriptContent = parseTranscript(TRANSCRIPT_FILE);
        console.log(`✅ Transcript loaded (${transcriptContent.length} characters)\n`);
        
        // Structure with Gemini
        const structuredJson = await structureTranscript(transcriptContent);
        
        // Save result
        saveStructuredTranscript(structuredJson);
        
        console.log('\n🎉 Process completed successfully!');
        
    } catch (error) {
        console.error(`❌ Process failed: ${error.message}`);
        process.exit(1);
    }
}

// Run the main function
main();
