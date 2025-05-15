// chatController.js - Updated for Egyptian sustainable medical tourism
import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,

});
const index = pinecone.index(process.env.PINECONE_INDEX);

// In-memory storage for chat history (replace with database in production)
const chatHistory = {};

// Extract medical conditions from user message
async function extractMedicalConditions(message) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14", 
      messages: [
        {
          role: "system",
          content: "You are a medical condition analyzer. Extract any medical conditions or symptoms mentioned in the user's message. Return ONLY a comma-separated list of conditions, or 'none' if no conditions are mentioned."
        },
        { role: "user", content: message }
      ],
      temperature: 0.3,
    });
    
    const conditions = response.choices[0].message.content.toLowerCase();
    return conditions === 'none' ? [] : conditions.split(',').map(c => c.trim());
  } catch (error) {
    console.error("Error extracting medical conditions:", error);
    return [];
  }
}

// Extract user preferences for sustainability
async function extractPreferences(message, history) {
  try {
    // Combine current message with history for context
    const historyText = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: `Extract user preferences regarding travel and sustainability from the conversation. 
          Analyze for: 
          1. Carbon consciousness (high/medium/low)
          2. Preferred transportation types
          3. Budget sensitivity (high/medium/low)
          4. Preferred treatment types 
          5. Accommodation preferences
          Return a JSON object with these fields. Use null if a preference isn't mentioned.`
        },
        { role: "user", content: `Conversation history:\n${historyText}\n\nCurrent message: ${message}` }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error extracting preferences:", error);
    return {};
  }
}

// Main function to process chat messages with RAG for Egyptian medical tourism
export const processChat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Initialize chat history for this session if it doesn't exist
    if (!chatHistory[sessionId]) {
      chatHistory[sessionId] = [];
    }
    
    // Extract medical conditions from the user's message
    const medicalConditions = await extractMedicalConditions(message);
    
    // Extract user preferences from message and history
    const userPreferences = await extractPreferences(message, chatHistory[sessionId]);
    
    // Generate embeddings for the user query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;
    
    // Prepare search options
    let searchOptions = {
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true
    };
    
    // Query Pinecone for relevant information
    let relevantInfo = [];
    
    // If medical conditions were detected, use them to enhance the search
    if (medicalConditions.length > 0) {
      console.log(`Detected medical conditions: ${medicalConditions.join(', ')}`);
      
      // Generate embeddings for the medical condition query
      const conditionSearch = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: `Treatment in Egypt for ${medicalConditions.join(', ')} using natural remedies`,
      });
      const conditionEmbedding = conditionSearch.data[0].embedding;
      
      // Search for treatments matching the medical conditions
      const treatmentResponse = await index.query({
        vector: conditionEmbedding,
        topK: 3,
        includeMetadata: true
      });
      
      relevantInfo = [...treatmentResponse.matches];
      
      // For each treatment location found, get corresponding transportation options
      const treatmentLocations = new Set(
        treatmentResponse.matches
          .filter(match => match.metadata.location)
          .map(match => match.metadata.location.split(',')[0].trim())
      );
      
      if (treatmentLocations.size > 0) {
        // Prioritize low-carbon transportation if user seems eco-conscious
        let transportFilter = {};
        if (userPreferences.carbonConsciousness === 'high') {
          // Search for transportation options with low carbon emissions
          const transportEmbed = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: `Low carbon sustainable transport to ${Array.from(treatmentLocations).join(' or ')} in Egypt`,
          });
          
          const transportResponse = await index.query({
            vector: transportEmbed.data[0].embedding,
            topK: treatmentLocations.size * 2, // Get multiple options per location
            includeMetadata: true
          });
          
          // Add transport options to relevant info
          relevantInfo = [...relevantInfo, ...transportResponse.matches];
        } else {
          // Just get standard transport options
          for (const location of treatmentLocations) {
            const transportEmbed = await openai.embeddings.create({
              model: "text-embedding-3-small",
              input: `Transport to ${location} in Egypt`,
            });
            
            const transportResponse = await index.query({
              vector: transportEmbed.data[0].embedding,
              topK: 2,
              includeMetadata: true
            });
            
            relevantInfo = [...relevantInfo, ...transportResponse.matches];
          }
        }
        
        // Add sample itineraries if available
        const itineraryEmbed = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: `Itinerary for treating ${medicalConditions.join(', ')} in Egypt sustainable natural therapy`,
        });
        
        const itineraryResponse = await index.query({
          vector: itineraryEmbed.data[0].embedding,
          topK: 2,
          includeMetadata: true
        });
        
        relevantInfo = [...relevantInfo, ...itineraryResponse.matches];
      }
    } else {
      // If no specific medical conditions, just search based on the query
      const queryResponse = await index.query(searchOptions);
      relevantInfo = queryResponse.matches;
    }
    
    // Deduplicate results
    const uniqueIds = new Set();
    relevantInfo = relevantInfo.filter(item => {
      if (uniqueIds.has(item.id)) return false;
      uniqueIds.add(item.id);
      return true;
    });
    
    // Format context from relevant information
    const context = relevantInfo
      .map(match => `TITLE: ${match.metadata.title}\nLOCATION: ${match.metadata.location}\n${match.metadata.text}${match.metadata.carbonEmission ? `\nCARBON EMISSION: ${match.metadata.carbonEmission}` : ''}${match.metadata.sustainability ? `\nSUSTAINABILITY: ${match.metadata.sustainability}` : ''}`)
      .join('\n\n---\n\n');
    
    // Prepare messages including conversation history for context
    const messages = [
      { 
        role: "system", 
        content: `You are a specialized medical tourism assistant for Egypt's natural healing destinations. 
Focus exclusively on Egypt's natural healing environments and sustainable eco-tourism.

You help users find appropriate natural treatment locations in Egypt based on their medical conditions and create personalized, environmentally-friendly travel itineraries.

Important guidelines:
1. Only recommend natural treatments available in Egypt's unique environments (oases, desert climate, sulfur springs, salt lakes, black sand beaches, Nile River)
2. Emphasize sustainability and low carbon footprint in all recommendations
3. Highlight the carbon emissions for different transportation options
4. Create personalized itineraries that balance treatment effectiveness with environmental responsibility
5. If you don't have information on a specific condition, suggest the most appropriate Egyptian natural healing location
6. Explain how Egypt's natural environments provide unique healing properties not found elsewhere
7. Always mention both the healing and environmental benefits of your recommendations

Use the following tourism information to create recommendations:

${context}`
      }
    ];
    
    // Add conversation history (limit to last 5 exchanges for token management)
    const recentHistory = chatHistory[sessionId].slice(-5);
    messages.push(...recentHistory);
    
    // Add the current user message
    messages.push({ role: "user", content: message });
    
    // Get response from GPT-4.1 Nano with guidance to create itinerary when appropriate
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano", 
      messages: messages,
      temperature: 0.7,
    });
    
    const assistantResponse = completion.choices[0].message.content;
    
    // Save the exchange to history
    chatHistory[sessionId].push({ role: "user", content: message });
    chatHistory[sessionId].push({ role: "assistant", content: assistantResponse });
    
    // Send response back to client
    res.json({
      answer: assistantResponse,
      sources: relevantInfo.map(match => ({
        title: match.metadata.title || 'Egyptian Tourism Information',
        location: match.metadata.location || 'Egypt',
        sustainability: match.metadata.sustainability || 'Information not available',
        carbonEmission: match.metadata.carbonEmission || 'Information not available'
      }))
    });
    
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};

// Get chat history for a specific session
export const getChatHistory = (req, res) => {
  const { sessionId } = req.params;
  
  if (!chatHistory[sessionId]) {
    return res.json({ history: [] });
  }
  
  res.json({ history: chatHistory[sessionId] });
};

// Clear chat history for a specific session
export const clearChatHistory = (req, res) => {
  const { sessionId } = req.params;
  
  if (chatHistory[sessionId]) {
    chatHistory[sessionId] = [];
  }
  
  res.json({ message: 'Chat history cleared successfully' });
};