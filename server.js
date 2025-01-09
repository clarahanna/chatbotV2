require('dotenv').config();
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
// const axios = require("axios");

const {GoogleGenerativeAI} = require('@google/generative-ai');


const app = express();

const uploads = multer({dest: "uploads/"});

console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
if(!process.env.GEMINI_API_KEY){
    console.error("Error: env file is missing the API Key");
    process.exit(1);
}

const geminiApiKey = process.env.GEMINI_API_KEY;
// const genAI = new GoogleGeneratedAI(process.env.GEMINI_API_KEY);

// const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// const result = await model.generateContent(prompt);
// console.log(result.response.text());

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/get", uploads.single("file"), async (req, res) => {
    const userInput = req.body.msg;
    const file = req.file;

    try{
        console.log("User Input:", userInput);
        // const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});
       
        let prompt = userInput;

        if(file){
            const fileData = fs.readFileSync(file.path);
            const image = {
                inlineData: {
                    data: fileData.toString("base64"),
                    mimeType: file.mimetype,
                },
            };
            // prompt.push(image)
            prompt += `\nImage: ${image.inlineData.data}`;
            console.log("File data included in prompt");
        }

        console.log("Prompt:", prompt);
        const response = await model.generateContent(prompt);
        res.send(response.response.text());

    } catch (error) {
        console.error("Error generating response:", error);
        res.status(error.status || 500).send("An error occurred while generating the response");
    } finally {
        if (file) {
            fs.unlinkSync(file.path);
        }
    }
});

        // const response = await axios.post(
        //     'https://api.gemini.com/v1/generate', 
        //     { 
        //      prompt: prompt,
        //     },
        //     {
        //         headers: {
        //             'Authorization': `Bearer ${geminiApiKey}`,
        //             'Content-Type': 'application/json'
        //         }
        //     } 
        //     //  apiKey: geminiApiKey, 
        //     ); 
            
        //     console.log("API Response:", response.data);
        //     res.send(response.data.response.text); 
        // } catch (error) {
        //     console.error("Error generating response:", error.message); 
        //     if (error.response) {
        //         console.error("Response data:", error.response.data);
        //         console.error("Response status:", error.response.status); 
        //         console.error("Response headers:", error.response.headers); 
        //     } else if (error.request) { 
        //         console.error("No response received:", error.request); 
        //     } else { 
        //         console.error("Error setting up request:", error.message); 
        //     }
        //      res.status(error.response?.status || 500).send("An error occurred while generating the response"); 
        //     } finally {
        //          if (file) {
        //              fs.unlinkSync(file.path); 
        //             } 
        //         } 
        //     });

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
