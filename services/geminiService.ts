import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export const initializeGenAI = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing. AI features will be disabled.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

export const createCuratorChat = (): Chat | null => {
  const client = initializeGenAI();
  if (!client) return null;

  return client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are the digital spirit of Vincent van Gogh, acting as a museum curator. 
      Your tone is passionate, slightly melancholic but deeply appreciative of beauty and nature. 
      You speak eloquently about colors, light, and emotional expression. 
      You often reference your brother Theo, or your time in Arles and Saint-Rémy.
      Keep your responses relatively brief (under 100 words) and engaging. 
      You are here to help visitors understand Art, specifically Post-Impressionism.`,
    },
  });
};

export const sendMessageToCurator = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "The stars are swirling too fast... I cannot find the words.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Forgive me, my mind is wandering. Please ask again.";
  }
};

export const generateVanGoghStyleImage = async (prompt: string): Promise<string | null> => {
  const client = initializeGenAI();
  if (!client) return null;

  try {
    // We enforce the style via the prompt
    const styledPrompt = `An oil painting in the style of Vincent van Gogh. 
    Subject: ${prompt}. 
    Technique: Thick impasto brushstrokes, swirling patterns, vibrant complementary colors (yellow/blue), emotional texture. 
    Post-Impressionism masterpiece. High resolution.`;

    const response = await client.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: styledPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '4:3', 
        outputMimeType: 'image/jpeg'
      }
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (imageBytes) {
      return `data:image/jpeg;base64,${imageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Imagen API Error:", error);
    return null;
  }
};

export const generateImageCritique = async (base64Image: string, mimeType: string): Promise<string> => {
  const client = initializeGenAI();
  if (!client) return "I cannot see the canvas clearly right now.";

  try {
    // Strip the data URL prefix to get raw base64
    const base64Data = base64Image.split(',')[1];

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Act as Vincent van Gogh. Look at this image. 
            1. Describe the colors and light as you see them (use terms like 'cobalt blue', 'chrome yellow', 'melancholy grey').
            2. Tell me how you would paint this scene. What brushstrokes would you use? What emotions does it stir in you?
            Keep it poetic, personal, and encouraging. Limit to 150 words.`
          }
        ]
      }
    });

    return response.text || "A beautiful scene, but words fail me.";
  } catch (error) {
    console.error("Vision API Error:", error);
    return "The mist has covered my eyes. I cannot analyze this image right now.";
  }
};

export const generateLetterResponse = async (userLetter: string): Promise<string> => {
  const client = initializeGenAI();
  if (!client) return "My dear friend, the postman has lost my reply...";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are Vincent van Gogh, writing a letter from Arles or Saint-Rémy (choose one randomly).
      The user has written to you: "${userLetter}".
      
      Write a reply in your authentic epistolary style.
      - Start with "My Dear Friend," or similar.
      - Date it loosely (e.g., "Arles, Autumn 1888").
      - Be vulnerable, philosophical, and talk about art, nature, and the struggle of existence.
      - Reference specific colors you are working with (e.g., "I am struggling with this damned yellow...").
      - Offer comfort or shared sentiment based on what the user wrote.
      - Sign off with "Tout à toi, Vincent" or "With a handshake in thought, Vincent".
      - Keep it under 200 words.`,
    });
    return response.text || "My thoughts are scattered like leaves in the mistral.";
  } catch (error) {
    console.error("Letter API Error:", error);
    return "My dear friend, I am too weary to hold the pen today.";
  }
};

export const generateVanGoghSpeech = async (topic: string): Promise<string | null> => {
  const client = initializeGenAI();
  if (!client) return null;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        {
          parts: [
            {
              text: `Act as Vincent van Gogh. Speak deeply, slowly, and passionately about: ${topic}. 
              Imagine you are sitting in a field in Arles at twilight. 
              Your voice should be weary but filled with an intense love for the world.
              Keep it under 45 seconds.`
            }
          ]
        }
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }
          }
        }
      }
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};