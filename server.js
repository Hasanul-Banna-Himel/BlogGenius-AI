const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Endpoint to generate blog post
app.post('/generate-blog', async (req, res) => {
    try {
        const { topic, length } = req.body;
        
        // Set word count based on length
        let wordCount;
        switch (length) {
            case 'short':
                wordCount = 300;
                break;
            case 'long':
                wordCount = 1000;
                break;
            case 'medium':
            default:
                wordCount = 600;
        }
        
        // Prepare prompt for Gemini API
        const prompt = `
        Generate a well-structured blog post about "${topic}". The blog post should:
        - Be approximately ${wordCount} words in length
        - Include a catchy title
        - Have an introduction, 3-5 body sections with subheadings, and a conclusion
        - Include relevant examples and practical advice
        - Be written in markdown format with # for main title and ## for subheadings
        - Use a conversational, informative tone
        - Focus on providing value to readers interested in this topic
        `;
        
        // Call Gemini API
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': process.env.GEMINI_API_KEY
                }
            }
        );
        
        // Extract content from response
        const generatedContent = response.data.candidates[0].content.parts[0].text;
        
        res.json({ content: generatedContent });
    } catch (error) {
        console.error('Error calling Gemini API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to generate blog post' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});