# Transcript to Structured JSON Automation

This automation script converts lecture transcripts into structured JSON format using Google's Gemini AI API.

## Features

- **Automated Processing**: Converts raw transcript text to hierarchical JSON structure
- **Deep Hierarchical Organization**: Creates 3+ layer structure (layer_1, layer_2, layer_3)
- **Detailed Breakdown**: Generates timestamped segments with categories and descriptions
- **Mathematical Focus**: Optimized for educational content with mathematical concepts
- **Error Handling**: Comprehensive validation and error reporting

## Usage

### Prerequisites

1. **Gemini API Key**: You need a valid Google Gemini API key
2. **Node.js**: Ensure Node.js is installed
3. **Dependencies**: Run `npm install` to install required packages

### Running the Script

#### Method 1: Using npm script (Recommended)
```bash
npm run structure-transcript
```

#### Method 2: Direct execution
```bash
node transcript-to-structured.js
```

### Input/Output

- **Input**: `transcript.txt` - Raw lecture transcript with timestamps
- **Output**: `mit_18_06_lecture_01_structured_transcript.json` - Structured JSON file

## Output Format

The script generates a JSON file with the following structure:

```json
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
        "title": "Main Topic",
        "layer_2": [
          {
            "id": "1.1",
            "title": "Sub-topic",
            "layer_3": [
              {"id": "1.1.1", "title": "Specific concept"}
            ]
          }
        ]
      }
    ]
  },
  "detailed_breakdown": [
    {
      "id": "1.1.1",
      "timestamp": "0:00-0:30",
      "category": "introduction|definition|example|method|solution|visualization|extension|transition",
      "subcategory": "specific_subcategory",
      "detail": "Detailed description of the content"
    }
  ]
}
```

## Configuration

### API Key
The script uses the Gemini API key provided in the code:
```javascript
const GEMINI_API_KEY = 'AIzaSyDwF3aqK1i_PLJCIm9exxk6-0gt6yqNp4Q';
```

### File Names
- Input file: `transcript.txt`
- Output file: `mit_18_06_lecture_01_structured_transcript.json`

## Categories

The script assigns one of these categories to each segment:
- `introduction` - Course/lecture introduction
- `definition` - Mathematical definitions and concepts
- `example` - Worked examples and problems
- `method` - Solution methods and techniques
- `solution` - Problem solutions
- `visualization` - Geometric and visual explanations
- `extension` - Extensions to higher dimensions
- `transition` - Transitions between topics

## Error Handling

The script includes comprehensive error handling for:
- Missing transcript file
- API connection issues
- Invalid JSON responses
- File system errors

## Example Output

After running the script, you'll see output like:
```
🚀 Starting transcript structuring process...

📖 Reading transcript from transcript.txt...
✅ Transcript loaded (27237 characters)

Sending transcript to Gemini for structuring...
✅ Successfully saved structured transcript to mit_18_06_lecture_01_structured_transcript.json

📊 Summary:
- Course: MIT 18.06 Linear Algebra
- Lecture: The Geometry of Linear Equations
- Main topics: 1
- Detailed segments: 28

🎉 Process completed successfully!
```

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your Gemini API key is valid and has sufficient quota
2. **File Not Found**: Make sure `transcript.txt` exists in the project root
3. **JSON Parse Error**: The AI response might be malformed; try running again
4. **Network Issues**: Check your internet connection

### Getting Help

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your API key is correct
3. Ensure the transcript file is properly formatted
4. Try running the script again (API responses can vary)

## Customization

To customize the script for different lectures:
1. Update the `OUTPUT_FILE` constant with your desired filename
2. Modify the prompt in `createPrompt()` function for different content types
3. Adjust the hierarchical structure requirements as needed
