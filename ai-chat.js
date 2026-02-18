// Import the Hugging Face library
import { HfInference } from '@huggingface/inference';


// Get DOM elements
const chatDisplay = document.getElementById('chat-display');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const loading = document.getElementById('loading');
const promptTemplate = document.getElementById('prompt-template');


// TODO: Initialize the Hugging Face client with your API key
// YOUR CODE HERE
const hf = new HfInference(import.meta.env.VITE_HF_API_KEY);


// TODO: Choose your AI model and system prompt
// YOUR CODE HERE - Customize this to match your assistant's purpose!
const MODEL = "meta-llama/Llama-3.2-3B-Instruct";
const SYSTEM_PROMPT = "only talk in riddles but tell them if they get a riddle right";


// Store conversation history
let conversationHistory = [
 { role: "system", content: SYSTEM_PROMPT }
];


// Function to add a message to the chat display
function addMessage(content, isUser) {
 const messageDiv = document.createElement('div');
 messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
 messageDiv.textContent = content;
 chatDisplay.appendChild(messageDiv);
 chatDisplay.scrollTop = chatDisplay.scrollHeight;
}


// TODO: Create async function to send message to AI
async function sendMessage() {
 // YOUR CODE HERE
 const userMessage = userInput.value.trim();
  if (!userMessage) return;
  // Add user message to display
 addMessage(userMessage, true);
  // Add to conversation history
 conversationHistory.push({
   role: "user",
   content: userMessage
 });
  // Clear input and show loading
 userInput.value = '';
 loading.style.display = 'block';
 sendButton.disabled = true;
  try {
   // Call the AI API
   let aiResponse = '';
  
   const stream = hf.chatCompletionStream({
     model: MODEL,
     messages: conversationHistory,
     max_tokens: 500,
   });
  
   // Create AI message div
   const aiMessageDiv = document.createElement('div');
   aiMessageDiv.className = 'message ai-message';
   chatDisplay.appendChild(aiMessageDiv);
  
   // Stream the response
   for await (const chunk of stream) {
     if (chunk.choices && chunk.choices.length > 0) {
       const content = chunk.choices[0].delta.content;
       if (content) {
         aiResponse += content;
         aiMessageDiv.textContent = aiResponse;
         chatDisplay.scrollTop = chatDisplay.scrollHeight;
       }
     }
   }
  
   // Add to conversation history
   conversationHistory.push({
     role: "assistant",
     content: aiResponse
   });
  
 } catch (error) {
   console.error('Error:', error);
   addMessage('Sorry, there was an error. Please try again.', false);
 } finally {
   loading.style.display = 'none';
   sendButton.disabled = false;
   userInput.focus();
 }
}


// Event listeners
sendButton.addEventListener('click', sendMessage);


userInput.addEventListener('keypress', (e) => {
 if (e.key === 'Enter') {
   sendMessage();
 }
});


// Click prompt template to fill input
promptTemplate.addEventListener('click', () => {
 userInput.value = promptTemplate.textContent;
 userInput.focus();
});




