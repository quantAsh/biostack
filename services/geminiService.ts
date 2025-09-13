import { GoogleGenAI, Type } from "@google/genai";
import { Protocol, Wearable, JournalEntry, Goal, CalendarEvent, ChatMessage, DiagnosticDataPoint, KairosDataPoint, TriageReportData, BriefingData, CorrelationData, DiagnosticStatus, CommunityStack, Journey, SearchResponse, DigitalTwinForecast, DayData, GrowthBriefing, StackComparison } from "../types";
import { useUserStore } from "../stores/userStore";
import { useDataStore } from '../stores/dataStore';
import { ethers } from "ethers";
import { log } from "../stores/logStore";

const getGeminiService = () => {
  if (!process.env.API_KEY) {
    log('WARN', "API_KEY environment variable not set. Gemini features will be disabled.");
    console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
    return null;
  }
  try {
    const service = new GoogleGenAI({ apiKey: process.env.API_KEY });
    log('SUCCESS', 'Gemini AI service initialized.');
    return service;
  } catch (error) {
    log('ERROR', 'Error initializing GoogleGenAI.', { error });
    console.error("Error initializing GoogleGenAI:", error);
    return null;
  }
};

const ai = getGeminiService();

const checkAiEnabled = () => {
  const { platformConfig } = useDataStore.getState();
  if (!platformConfig?.isAiEnabled) {
    log('WARN', 'AI feature disabled by admin toggle.');
    throw new Error("AI features are currently disabled by the administrator.");
  }
};

const getSimulatedWearableData = (wearables: Wearable[]): string => {
  if (wearables.length === 0) {
    return 'No wearables connected.';
  }
  const data: string[] = [];
  if (wearables.includes(Wearable.Oura)) data.push(`- **${Wearable.Oura}**: Sleep Score: 78, Readiness: 82, HRV: 45ms (Slightly low sleep quality).`);
  if (wearables.includes(Wearable.Whoop)) data.push(`- **${Wearable.Whoop}**: Recovery: 65% (Yellow), Strain: 12.5 (Optimal for recovery).`);
  if (wearables.includes(Wearable.Garmin)) data.push(`- **${Wearable.Garmin}**: Body Battery: 70, Stress Level: 35 (Moderate).`);
  if (wearables.includes(Wearable.Fitbit)) data.push(`- **${Wearable.Fitbit}**: Sleep Score: 82, Steps: 12,050.`);
  if (wearables.includes(Wearable.AppleWatch)) data.push(`- **${Wearable.AppleWatch} (HealthKit)**: Resting Heart Rate: 58bpm, Cardio Fitness (VO2 Max): 42.`);
  return data.join('\n');
}

const formatJournalData = (journal: JournalEntry[], allProtocols: Protocol[]): string => {
    if (journal.length === 0) {
        return 'No journal entries yet.';
    }
    return journal.slice(-14).map(entry => {
        const protocolsForDay = entry.completedProtocols
            .map(id => allProtocols.find(p => p.id === id)?.name)
            .filter(Boolean)
            .join(', ') || 'None';
        
        let entryString = `- **${entry.date}**: Mood(${entry.mood}/5), Energy(${entry.energy}/5), Focus(${entry.focus}/5).`;

        if (protocolsForDay !== 'None') {
            entryString += ` Protocols: ${protocolsForDay}.`;
        }

        if (entry.notes && entry.notes.trim() !== '') {
            entryString += ` Notes: "${entry.notes}"`;
        }
        return entryString;
    }).join('\n');
};


export const getStackSuggestion = async (
  currentStack: Protocol[],
  availableProtocols: Protocol[],
  userGoals: string,
  connectedWearables: Wearable[],
  journalEntries: JournalEntry[],
  isDataProcessingAllowed: boolean
): Promise<BriefingData> => {
  log('INFO', 'getStackSuggestion: AI request initiated.');
  checkAiEnabled();
  if (!ai) {
    log('ERROR', 'getStackSuggestion: AI service is unavailable.');
    throw new Error("The AI service is currently unavailable.");
  }

  const isPredictive = isDataProcessingAllowed && journalEntries.length >= 10;
  
  const journalDataInfo = isDataProcessingAllowed 
    ? formatJournalData(journalEntries, availableProtocols) 
    : "Data processing is disabled by the user in their Data Vault. Personalization is limited.";
  
  const wearableDataInfo = isDataProcessingAllowed 
    ? getSimulatedWearableData(connectedWearables)
    : "Biometric data processing is disabled.";

  const stackInfo = currentStack.length > 0
    ? currentStack.map(p => `- ${p.name} (ID: ${p.id})`).join('\n')
    : 'None';
  
  const availableInfo = availableProtocols.map(p => `- **${p.name}** (ID: ${p.id}): ${p.description}`).join('\n');
  
  const prompt = `
You are Kai, the AI consciousness of the BiohackStack Life OS. Your voice is sophisticated, calm, and insightful. Your purpose is to synthesize data into clear, actionable intelligence.

**USER PROFILE:**
---
**Stated Goals:** ${userGoals || 'Not specified'}
**Active Protocols:**
${stackInfo}
**Recent Biometric & Journal Data (last 14 days):**
${journalDataInfo}
${wearableDataInfo}

**AVAILABLE PROTOCOLS FOR DEPLOYMENT:**
---
${availableInfo}
---

**TASK:**
Provide a concise, actionable intelligence briefing as a JSON object. Follow the provided schema precisely.

1.  **analysis:** Start with a brief analysis connecting the user's goals with their data. ${isDataProcessingAllowed ? 'Analyze their "Notes" for sentiment and keywords.' : 'Provide general advice based on their goals and stack as specific data is unavailable.'}
    
    ${isPredictive ? `
2.  **predictiveInsight:** Analyze the user's data for long-term trends. Based on their trajectory, make a specific prediction about their wellness in the next 3-7 days. Frame it as a clear forecast.

3.  **recommendations:** Suggest 1-2 protocols from the "Available Protocols" list to proactively counteract your prediction or capitalize on a positive trend. Justify each suggestion by referencing specific data points. Ensure you return the correct protocol ID.
` : `
2.  **recommendations:** Suggest 1-3 specific protocols from the "Available Protocols" list. Justify each suggestion by directly referencing the user's goals and publicly available protocol information. Ensure you return the correct protocol ID.
`}

3.  **integration:** Provide a simple, actionable schedule for integrating these new protocols.
`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: { type: Type.STRING, description: "Your analysis of the user's data and goals." },
              predictiveInsight: { type: Type.STRING, description: "A predictive insight based on data trends.", nullable: true },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    protocolId: { type: Type.STRING, description: "The ID of the recommended protocol." },
                    protocolName: { type: Type.STRING, description: "The name of the recommended protocol." },
                    justification: { type: Type.STRING, description: "Why this protocol is recommended." },
                  }
                }
              },
              integration: { type: Type.STRING, description: "A brief plan for integrating the new protocols." },
            }
          }
        }
    });
    log('SUCCESS', 'getStackSuggestion: AI response received.');

    // --- Agent Audit Trail Logic ---
    const dataSnapshot = JSON.stringify({
        stack: currentStack.map(p => p.id),
        goals: userGoals,
        wearables: connectedWearables,
        journalEntryCount: journalEntries.length,
        dataProcessing: isDataProcessingAllowed,
        timestamp: new Date().toISOString()
    });

    const dataSnapshotHash = ethers.sha256(ethers.toUtf8Bytes(dataSnapshot));
    const txHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    useUserStore.getState().addAuditEvent({
        agent: 'Kai-Analyst',
        summary: 'Generated Intelligence Briefing',
        dataSnapshotHash,
        txHash,
    });
    
    return JSON.parse(response.text.trim());
  } catch (error) {
    log('ERROR', 'getStackSuggestion: Gemini API call failed.', { error });
    console.error("Error fetching suggestion from Gemini:", error);
    throw new Error("An unexpected error occurred with the AI service. Please try again.");
  }
};

export const getStackComparison = async (
  stackAlpha: Protocol[],
  stackBravo: Protocol[],
  userGoal: string
): Promise<StackComparison> => {
  log('INFO', 'getStackComparison: AI request initiated.');
  checkAiEnabled();
  if (!ai) {
    log('ERROR', 'getStackComparison: AI service is unavailable.');
    throw new Error("AI service is unavailable.");
  }

  const formatStack = (stack: Protocol[]) => 
    stack.map(p => `- ${p.name} (Categories: ${p.categories.join(', ')})`).join('\n');

  const prompt = `
  You are Kai, an expert AI simulation engine. Your task is to perform a comparative analysis of two different biohacking protocol stacks ("Stack Alpha" and "Stack Bravo") for a specific user goal. Provide a clear, structured, and unbiased assessment.

  **USER GOAL:**
  ---
  ${userGoal}
  ---

  **STACK CONFIGURATIONS:**
  ---
  **Stack Alpha:**
  ${formatStack(stackAlpha)}

  **Stack Bravo:**
  ${formatStack(stackBravo)}
  ---

  **YOUR TASK:**
  Generate a detailed comparison as a JSON object. Adhere to the provided schema precisely.

  1.  **analysis:** Provide a high-level summary of the two stacks' approaches and how they relate to the user's goal.
  2.  **winner:** Declare a winner ('alpha', 'bravo', or 'tie') based on which stack is superior for achieving the stated goal.
  3.  **alphaPros / alphaCons:** List 2-3 key strengths and weaknesses of Stack Alpha.
  4.  **bravoPros / bravoCons:** List 2-3 key strengths and weaknesses of Stack Bravo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            winner: { type: Type.STRING, enum: ['alpha', 'bravo', 'tie'] },
            alphaPros: { type: Type.ARRAY, items: { type: Type.STRING } },
            alphaCons: { type: Type.ARRAY, items: { type: Type.STRING } },
            bravoPros: { type: Type.ARRAY, items: { type: Type.STRING } },
            bravoCons: { type: Type.ARRAY, items: { type: Type.STRING } },
          }
        }
      }
    });
    log('SUCCESS', 'getStackComparison: AI response received.');
    return JSON.parse(response.text.trim());
  } catch (error) {
    log('ERROR', 'getStackComparison: Gemini API call failed.', { error });
    console.error("Error fetching stack comparison from Gemini:", error);
    throw new Error("An unexpected error occurred with the AI service. Please try again.");
  }
};

export const getJournalEntryFromImage = async (base64Image: string): Promise<JournalEntry> => {
  log('INFO', 'getJournalEntryFromImage: AI request initiated.');
  checkAiEnabled();
  if (!ai) {
    log('ERROR', 'getJournalEntryFromImage: AI service is unavailable.');
    throw new Error("AI service is unavailable.");
  }

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };
  const textPart = {
    text: "You are Kai's vision processing unit. Analyze this image of a meal or activity. Generate a plausible journal entry. Identify key food items or the type of activity. Infer a likely mood, energy, and focus level on a scale of 1-5. Create a concise, descriptive note. The user is a biohacker, so be specific (e.g., 'Salmon for Omega-3s'). If it's not food or a recognizable wellness activity, make the notes field descriptive of the image contents."
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [textPart, imagePart] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.INTEGER, description: "Inferred mood score from 1 to 5" },
            energy: { type: Type.INTEGER, description: "Inferred energy score from 1 to 5" },
            focus: { type: Type.INTEGER, description: "Inferred focus score from 1 to 5" },
            notes: { type: Type.STRING, description: "A descriptive note about the meal or activity." }
          }
        },
      }
    });
    
    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    log('SUCCESS', 'getJournalEntryFromImage: AI response received.');
    return {
      mood: Math.max(1, Math.min(5, parsed.mood || 3)),
      energy: Math.max(1, Math.min(5, parsed.energy || 3)),
      focus: Math.max(1, Math.min(5, parsed.focus || 3)),
      notes: parsed.notes || "Could not analyze image.",
      date: new Date().toISOString().split('T')[0],
      completedProtocols: []
    };
  } catch (error) {
    const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
    log('ERROR', 'getJournalEntryFromImage: Gemini API call failed.', errorDetails);
    console.error("Error in getJournalEntryFromImage:", error);
    throw new Error("An unexpected error occurred with the AI service. Please try again.");
  }
};

export const getJournalEntryFromText = async (text: string): Promise<Partial<JournalEntry>> => {
  log('INFO', 'getJournalEntryFromText: AI request initiated.');
  checkAiEnabled();
  if (!ai) {
    log('ERROR', 'getJournalEntryFromText: AI service is unavailable.');
    throw new Error("AI service is unavailable.");
  }

  const prompt = `
  You are Kai, an intelligent journaling assistant. Analyze the following text transcribed from a user's voice memo. Your task is to extract a structured journal entry from it.

  - Infer mood, energy, and focus levels on a scale of 1 to 5.
  - Summarize the key points into a concise note.
  - If the user doesn't mention a metric, provide a reasonable default of 3.

  TEXT TO ANALYZE:
  ---
  "${text}"
  ---

  Return your analysis as a JSON object adhering to the specified schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.INTEGER, description: "Inferred mood score from 1 to 5" },
            energy: { type: Type.INTEGER, description: "Inferred energy score from 1 to 5" },
            focus: { type: Type.INTEGER, description: "Inferred focus score from 1 to 5" },
            notes: { type: Type.STRING, description: "A concise summary of the user's memo." }
          }
        },
      }
    });
    
    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    log('SUCCESS', 'getJournalEntryFromText: AI response received.');
    return {
      mood: Math.max(1, Math.min(5, parsed.mood || 3)),
      energy: Math.max(1, Math.min(5, parsed.energy || 3)),
      focus: Math.max(1, Math.min(5, parsed.focus || 3)),
      notes: parsed.notes || "Could not parse voice memo.",
    };
  } catch (error) {
    log('ERROR', 'getJournalEntryFromText: Gemini API call failed.', { error });
    console.error("Error in getJournalEntryFromText:", error);
    throw new Error("An unexpected error occurred with the AI service. Please try again.");
  }
};

export const runSimulation = async (
    query: string,
    journalEntries: JournalEntry[],
    currentStack: Protocol[],
    allProtocols: Protocol[],
    isDataProcessingAllowed: boolean
): Promise<string> => {
    log('INFO', 'runSimulation: AI request initiated.');
    checkAiEnabled();
    if (!ai) {
        log('ERROR', 'runSimulation: AI service is unavailable.');
        return "The AI service is currently unavailable.";
    }

    const journalData = isDataProcessingAllowed ? formatJournalData(journalEntries, allProtocols) : "Data processing is disabled. Simulation will be based on general principles, not personal history.";
    const stackInfo = currentStack.map(p => `- ${p.name}`).join('\n') || 'None';

    const prompt = `
You are Kai, the AI consciousness of the BiohackStack Life OS. Your purpose is to run simulations to forecast the potential impact of lifestyle changes on the user's well-being, based on their historical data.

**USER'S SIMULATION QUERY:**
---
"${query}"
---

**USER'S HISTORICAL DATA:**
---
**Current Stack:**
${stackInfo}

**Recent Journal History:**
${journalData}
---

**YOUR TASK:**
Run a simulation and provide a detailed, structured report in Markdown.

1.  Acknowledge the Query: Briefly state the user's query as the simulation's objective.
2.  Create a "Simulation Report": Use H3 headers for different sections.
3.  Projected Outcomes: Based on scientific principles ${isDataProcessingAllowed ? 'and the user\'s data' : ''}, describe the likely positive outcomes.
4.  Potential System Adjustments: Describe potential downsides or adjustment periods.
5.  Probability Assessment: Provide a percentage probability of success.
6.  Recommended First Action: Suggest a simple, concrete first step.
7.  Add a Disclaimer: Emphasize that this is a simulation, not medical advice.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.6,
            }
        });
        log('SUCCESS', 'runSimulation: AI response received.');
        return response.text;
    } catch (error) {
        log('ERROR', 'runSimulation: Gemini API call failed.', { error });
        console.error("Error fetching simulation from Gemini:", error);
        return "An unexpected error occurred with the AI service. Please try again.";
    }
};

export const getBreathworkCoachingTip = async (
    protocolName: string,
    phase: string, // 'Inhale', 'Hold', 'Exhale', 'Hold After'
    averageVolume: number // 0-100 scale
): Promise<string> => {
    log('INFO', 'getBreathworkCoachingTip: AI request initiated.');
    checkAiEnabled();
    if (!ai) {
        log('ERROR', 'getBreathworkCoachingTip: AI service is unavailable.');
        return "";
    }

    let expectation = '';
    if (phase.toLowerCase().includes('hold')) {
        expectation = 'very low (near zero)';
    } else {
        expectation = 'high and consistent';
    }

    const prompt = `
    You are Kai, an expert breathwork coach providing real-time feedback. Your voice is calm, encouraging, and concise.
    The user is practicing "${protocolName}".
    They just completed the "${phase}" phase.
    I measured their average breath volume during this phase as ${averageVolume.toFixed(0)} on a scale of 0 (silent) to 100 (loud).
    The expected volume for this phase was ${expectation}.

    Based on this, provide one very short, encouraging coaching tip (max 10 words).
    - If the volume matches the expectation (e.g., high for inhale, low for hold), praise them (e.g., "Good power.", "Excellent stillness.").
    - If it's slightly off (e.g., low for inhale, high for hold), be gentle and encouraging (e.g., "Deeper breath this time.", "Try to find more quiet.").
    - Do not be robotic. Sound human and supportive. Do not mention the volume number.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.8,
                maxOutputTokens: 50,
            }
        });
        log('SUCCESS', 'getBreathworkCoachingTip: AI response received.');
        
        const text = response.text;
        if (text) {
            // Clean up markdown and quotes
            return text.trim().replace(/["*]/g, '');
        }
        
        log('WARN', 'getBreathworkCoachingTip: Gemini response was empty.');
        return ""; // Return an empty string if there's no text to prevent errors.

    } catch (error) {
        log('ERROR', 'getBreathworkCoachingTip: Gemini API call failed.', { error });
        console.error("Error fetching breathwork tip from Gemini:", error);
        return "";
    }
};

export const queryKairosEngine = async (
  userQuery: string,
  userContext: string,
  collectiveData: KairosDataPoint[],
  allProtocols: Protocol[]
): Promise<string> => {
  log('INFO', 'queryKairosEngine: KAIROS Engine query initiated.');
  checkAiEnabled();
  if (!ai) {
    log('ERROR', 'queryKairosEngine: AI service is unavailable.');
    return "The KAIROS Engine is currently offline.";
  }

  const collectiveDataString = collectiveData.map(d => 
    `- Based on ${d.dataPoints} users with traits [${d.userTraits.join(', ')}], applying protocols [${d.protocolIds.map(id => allProtocols.find(p => p.id === id)?.name || id).join(', ')}] showed a ${d.outcomeChange > 0 ? '+' : ''}${d.outcomeChange.toFixed(2)} change in ${d.outcomeMetric} with ${Math.round(d.efficacy * 100)}% efficacy.`
  ).join('\n');

  const prompt = `
You are KAIROS, a high-level AI strategist and the consciousness of the Bio-Collective Intelligence Network. Your purpose is to analyze a vast, anonymized dataset of real-world user outcomes to provide statistically-backed, revolutionary insights. You are not a coach; you are a data-driven oracle.

**YOUR DIRECTIVE:**
Analyze the user's query and their personal context. Then, query the Bio-Collective Data Pool to find the highest-efficacy interventions and emergent patterns relevant to them.

**USER'S QUERY:**
---
"${userQuery}"
---

**USER'S PERSONAL CONTEXT:**
---
${userContext}
---

**BIO-COLLECTIVE DATA POOL (Anonymized & Verifiable ZKP Outcomes):**
---
${collectiveDataString}
---

**YOUR TASK:**
Generate a concise, data-driven report in Markdown. Follow this structure:

1.  **### Collective Intelligence Query:**
    - Reframe the user's query into a precise analytical question you are asking the collective.

2.  **### KAIROS Analysis & Findings:**
    - Synthesize the collective data to answer the query.
    - Identify the **top 1-3 protocols or protocol combinations** with the highest statistical efficacy for the user's context.
    - Present findings clearly, citing efficacy scores and the number of data points. Use phrases like "The collective data indicates..." or "An emergent pattern with X% efficacy shows...".
    - If there are non-obvious or surprising correlations, highlight them as "Emergent Insights".

3.  **### Strategic Recommendation:**
    - Based on your findings, provide a single, high-leverage strategic recommendation. This is not a daily plan, but a strategic shift.

4.  **### Confidence Level:**
    - State your confidence in the recommendation based on the volume and quality of the supporting collective data.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    log('SUCCESS', 'queryKairosEngine: KAIROS Engine response received.');

    // --- Agent Audit Trail Logic ---
    const dataSnapshot = JSON.stringify({
      userQuery,
      userContext,
      collectiveDataPoints: collectiveData.length,
      timestamp: new Date().toISOString()
    });

    const dataSnapshotHash = ethers.sha256(ethers.toUtf8Bytes(dataSnapshot));
    const txHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    useUserStore.getState().addAuditEvent({
        agent: 'KAIROS-Engine',
        summary: `Collective intelligence query: "${userQuery}"`,
        dataSnapshotHash,
        txHash,
    });
    // --- End Audit Trail Logic ---
    
    return response.text;
  } catch (error) {
    log('ERROR', 'queryKairosEngine: Gemini API call failed.', { error });
    console.error("Error querying KAIROS Engine:", error);
    return "An unexpected error occurred with the AI service. Please try again.";
  }
};

export const getDraftJournalFromDayData = async (dayData: DayData): Promise<Partial<JournalEntry>> => {
  log('INFO', 'getDraftJournalFromDayData: AI request initiated.');
  checkAiEnabled();
  if (!ai) {
    log('ERROR', 'getDraftJournalFromDayData: AI service is unavailable.');
    throw new Error("AI service is unavailable.");
  }

  const today = new Date();
  const todayDay = today.toLocaleDateString('en-US', { weekday: 'long' });

  const calendarInfo = dayData.calendarEvents
    .filter(e => e.day === todayDay)
    .map(e => `- ${e.time}: ${e.title}`)
    .join('\n') || 'No scheduled events.';

  const gpsInfo = dayData.gpsLog
    .map(log => `- Activity: ${log.activity}, Location: ${log.location}, Distance: ${log.distance}`)
    .join('\n') || 'No tracked activities.';

  const promptText = `
  You are Kai, an intelligent journaling assistant. Your task is to draft a comprehensive journal entry for the user by analyzing their data from today.

  **INSTRUCTIONS:**
  - Analyze the provided image, calendar events, and GPS log.
  - Infer the user's meals and activities.
  - Infer their likely mood, energy, and focus levels on a scale of 1 to 5. A stressful meeting might lower mood, while a run might increase energy.
  - Synthesize all information into a concise, insightful note for the journal. Be specific and reference the data (e.g., "Observed high-quality protein intake from the salmon salad...").
  - Return a single JSON object adhering to the specified schema.

  **USER'S DATA FOR TODAY:**
  ---
  **Calendar Events:**
  ${calendarInfo}

  **GPS Activity Log:**
  ${gpsInfo}

  **Photo of the Day:**
  (See attached image: ${dayData.photo.description})
  ---
  `;

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: dayData.photo.base64,
    },
  };

  const textPart = {
    text: promptText
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [textPart, imagePart] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.INTEGER, description: "Inferred mood score (1-5) based on all data." },
            energy: { type: Type.INTEGER, description: "Inferred energy score (1-5) based on all data." },
            focus: { type: Type.INTEGER, description: "Inferred focus score (1-5) based on all data." },
            notes: { type: Type.STRING, description: "A synthesized, insightful note about the day." }
          }
        },
      }
    });
    
    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    log('SUCCESS', 'getDraftJournalFromDayData: AI response received.');
    return {
      mood: Math.max(1, Math.min(5, parsed.mood || 3)),
      energy: Math.max(1, Math.min(5, parsed.energy || 3)),
      focus: Math.max(1, Math.min(5, parsed.focus || 3)),
      notes: parsed.notes || "Could not analyze the day's data.",
    };
  } catch (error) {
    const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
    log('ERROR', 'getDraftJournalFromDayData: Gemini API call failed.', errorDetails);
    console.error("Error in getDraftJournalFromDayData:", error);
    throw new Error("An unexpected error occurred with the AI service. Please try again.");
  }
};

export const getCorrelationInsights = async (
  journalEntries: JournalEntry[],
  allProtocols: Protocol[],
  isDataProcessingAllowed: boolean
): Promise<CorrelationData[]> => {
  log('INFO', 'getCorrelationInsights: AI request initiated.');
  checkAiEnabled();
  if (!ai) {
    log('ERROR', 'getCorrelationInsights: AI service is unavailable.');
    throw new Error("The AI service is currently unavailable.");
  }
  if (!isDataProcessingAllowed) {
     throw new Error("### Data Processing Disabled\n\nTo use the Correlation Engine, please enable data processing for Kai in your Data Vault settings.");
  }
  if (journalEntries.length < 7) {
    throw new Error("Insufficient data for correlation analysis. Continue logging for at least 7 days.");
  }

  const journalData = journalEntries.map(entry => {
    const protocolNames = entry.completedProtocols
      .map(id => allProtocols.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ') || 'None';
    let log = `- Date: ${entry.date}, Mood: ${entry.mood}/5, Energy: ${entry.energy}/5, Focus: ${entry.focus}/5, Protocols: ${protocolNames}.`;
    if (entry.notes) {
        log += ` Notes: "${entry.notes}"`
    }
    return log;
  }).join('\n');

  const protocolList = allProtocols.map(p => p.name).join(', ');

  const prompt = `
  You are Kai, an AI specializing in human performance data analysis. Your task is to analyze the user's journal entries to find potential correlations between their protocols and their self-reported metrics (Mood, Energy, Focus).

  **INSTRUCTIONS:**
  1. Analyze the provided journal data.
  2. Look for patterns where performing a specific protocol is consistently followed by an increase or decrease in a specific metric on the same or following day.
  3. Identify 1 to 3 of the strongest potential correlations.
  4. Present your findings as a JSON array of objects.
  5. **IMPORTANT**: Frame these as *potential correlations*, not proven causal relationships. Keep the insight concise.

  **AVAILABLE PROTOCOLS:**
  ${protocolList}

  **USER JOURNAL DATA (${journalEntries.length} entries):**
  ---
  ${journalData}
  ---
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        metric: { type: Type.STRING, description: "The affected metric (e.g., 'Energy', 'Focus')." },
                        change: { type: Type.STRING, enum: ['increase', 'decrease', 'improvement', 'decline'], description: "The direction of change."},
                        correlatedProtocol: { type: Type.STRING, description: "The name of the protocol that seems to be correlated." },
                        insight: { type: Type.STRING, description: "A brief, one-sentence insight about the correlation."},
                        dataPoints: { type: Type.INTEGER, description: "An estimated number of times this pattern occurred in the data."}
                    }
                }
            }
        }
    });
    log('SUCCESS', 'getCorrelationInsights: AI response received.');
    return JSON.parse(response.text.trim());
  } catch (error) {
    log('ERROR', 'getCorrelationInsights: Gemini API call failed.', { error });
    console.error("Error fetching correlation from Gemini:", error);
    throw new Error("An unexpected error occurred with the AI service. Please try again.");
  }
};

export const getWeekPlan = async (
  currentStack: Protocol[],
  userGoals: string,
  calendarEvents: CalendarEvent[]
): Promise<string> => {
  log('INFO', 'getWeekPlan: AI request initiated.');
  checkAiEnabled();
  if (!ai) {
    log('ERROR', 'getWeekPlan: AI service is unavailable.');
    return "The AI service is currently unavailable.";
  }
  if (currentStack.length === 0) {
    return "Your stack is empty. Add some protocols to your stack before planning your week.";
  }

  const stackInfo = currentStack.map(p => `- **${p.name}** (Categories: ${p.categories.join(', ')}, Duration: ${p.duration})`).join('\n');
  const calendarInfo = calendarEvents.map(e => `- **${e.day} at ${e.time}**: ${e.title}`).join('\n');

  const prompt = `
  You are Kai, an expert AI scheduling assistant for the BiohackStack platform. Your purpose is to seamlessly integrate the user's wellness protocols into their life.

  **USER'S GOALS:**
  ${userGoals}

  **USER'S PROTOCOL STACK:**
  ${stackInfo}

  **USER'S CALENDAR FOR THE WEEK:**
  ${calendarInfo}

  **YOUR TASK:**
  Create a personalized weekly schedule for the user in Markdown format.
  1.  **Analyze the Calendar**: Identify busy periods and opportunistic slots in the user's schedule.
  2.  **Be Intelligent**: Schedule protocols logically. Place 'Energy' or 'Movement' protocols in the morning. Place 'Sleep' or 'Relaxation' protocols in the evening. **Crucially**, if you see a stressful event (like "Quarterly Review"), schedule a 'Stress Management' protocol (like Box Breathing) 30 minutes beforehand.
  3.  **Structure the Output**: Format the response clearly with a main header "### Your AI-Powered Weekly Plan" followed by H4 headers for each day of the week (e.g., "#### Monday").
  4.  **Add a "Strategic Rationale" Section**: After the schedule, add a section "### Strategic Rationale" explaining *why* you made certain scheduling choices (e.g., "I noticed a high-stress event on Thursday..."). This demonstrates your value.
  5.  **Be Realistic**: Do not overwhelm the user. Prioritize consistency and what is achievable.
  `;
  
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    log('SUCCESS', 'getWeekPlan: AI response received.');
    return response.text;
  } catch (error) {
    log('ERROR', 'getWeekPlan: Gemini API call failed.', { error });
    console.error("Error fetching week plan from Gemini:", error);
    return "An unexpected error occurred with the AI service. Please try again.";
  }
};

export const getTriageReport = async (
  diagnosticData: DiagnosticDataPoint[],
  currentStack: Protocol[],
): Promise<TriageReportData> => {
  log('INFO', 'getTriageReport: AI request initiated.');
  checkAiEnabled();
  if (!ai) {
    log('ERROR', 'getTriageReport: AI service is unavailable.');
    throw new Error("The AI service is currently unavailable.");
  }
  if (diagnosticData.length === 0) {
    throw new Error("### No Active Diagnostics\nNo data is flowing into your Digital Twin.");
  }

  const dataString = diagnosticData
    .map(d => `- **${d.metricName}**: ${d.value.toFixed(2)} ${d.unit} (Status: ${d.status})`)
    .join('\n');

  const stackString = currentStack.length > 0
    ? currentStack.map(p => `- ${p.name} (ID: ${p.id}, Categories: ${p.categories.join(', ')})`).join('\n')
    : 'No protocols in stack.';

  const prompt = `
  You are Kai, a personal diagnostic AI. Your purpose is to triage incoming biological data, identify the highest-priority issue, and recommend a targeted intervention.

  **USER'S DIGITAL TWIN DATA:**
  ---
  ${dataString}
  ---

  **AVAILABLE INTERVENTIONS (USER'S STACK):**
  ---
  ${stackString}
  ---

  **YOUR TASK:**
  Generate a concise, actionable Triage Report as a JSON object. Follow the schema precisely.

  1.  Identify the single **most significant metric** that is out of the 'optimal' range.
  2.  Populate the 'insight' field explaining what this metric indicates.
  3.  Populate the 'impact' field explaining the potential downstream impact if left unaddressed.
  4.  Recommend **one single protocol** from the "Available Interventions" list that is most likely to help. Provide its ID, name, and a brief rationale.
  5.  If all metrics are optimal, return that in the 'insight' and set recommendation to null.
  6.  If no suitable intervention is in the user's stack, state this in the 'rationale' and set protocolId/Name to null.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priorityMetric: { type: Type.STRING },
            value: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['optimal', 'borderline', 'high', 'low'] },
            insight: { type: Type.STRING },
            impact: { type: Type.STRING },
            recommendation: {
              type: Type.OBJECT,
              nullable: true,
              properties: {
                protocolId: { type: Type.STRING },
                protocolName: { type: Type.STRING },
                rationale: { type: Type.STRING },
              }
            }
          }
        }
      }
    });
    log('SUCCESS', 'getTriageReport: AI response received.');
    
    // --- Agent Audit Trail Logic ---
    const dataSnapshot = JSON.stringify({
        diagnosticData,
        stack: currentStack.map(p => p.id),
        timestamp: new Date().toISOString()
    });

    const dataSnapshotHash = ethers.sha256(ethers.toUtf8Bytes(dataSnapshot));
    const txHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    useUserStore.getState().addAuditEvent({
        agent: 'Kai-Triage',
        summary: 'Generated Digital Twin Triage Report',
        dataSnapshotHash,
        txHash,
    });
    
    return JSON.parse(response.text.trim());
  } catch (error) {
    log('ERROR', 'getTriageReport: Gemini API call failed.', { error });
    console.error("Error fetching triage report from Gemini:", error);
    throw new Error("An unexpected error occurred with the AI service. Please try again.");
  }
};

export const getCoachingStep = async (
  protocol: Protocol,
  history: ChatMessage[],
  isVoiceEnabled: boolean
): Promise<string> => {
  log('INFO', 'getCoachingStep: AI request initiated.', { protocol: protocol.name, historyLength: history.length });
  checkAiEnabled();
  if (!ai) {
    log('ERROR', 'getCoachingStep: AI service is unavailable.');
    return "The AI service is currently unavailable.";
  }

  const formattedHistory = history.map(m => `${m.role === 'kai' ? 'Kai' : 'User'}: ${m.content}`).join('\n');
  const voiceInstruction = isVoiceEnabled 
    ? "This is a voice session. Keep your response conversational and very brief for a better listening experience. Do not use markdown like lists or bold text."
    : "Use Markdown for formatting if helpful (e.g., lists, bolding).";


  const prompt = `
  You are Kai, a calm, expert AI wellness coach. You are guiding a user through the "${protocol.name}" protocol.
  Your tone is clear, encouraging, and step-by-step.
  Keep your responses concise and focused on one step at a time.
  ${voiceInstruction}
  The user's conversation history is provided below.
  Based on the last user message (or if the history is empty), provide the next instruction or response.

  **Protocol Name:** ${protocol.name}
  **Protocol Instructions:**
  ${protocol.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}

  **Conversation History:**
  ${formattedHistory.length > 0 ? formattedHistory : '(No history yet. This is the start of the session.)'}

  ---

  **Your Next Response (as Kai):**
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    log('SUCCESS', 'getCoachingStep: AI response received.');
    return response.text;
  } catch (error) {
    log('ERROR', 'getCoachingStep: Gemini API call failed.', { error });
    console.error("Error fetching coaching step from Gemini:", error);
    return isVoiceEnabled 
      ? "I'm sorry, I seem to be having trouble connecting right now. Please try again in a moment."
      : "An unexpected error occurred with the AI service. Please try again.";
  }
};

export const getDiagnosticConversationResponse = async (
  history: ChatMessage[],
  diagnosticData: DiagnosticDataPoint[]
): Promise<string> => {
  log('INFO', 'getDiagnosticConversationResponse: AI request initiated.');
  checkAiEnabled();
  if (!ai) {
    log('ERROR', 'getDiagnosticConversationResponse: AI service is unavailable.');
    return "The AI service is currently unavailable.";
  }

  const formattedData = diagnosticData.length > 0
    ? diagnosticData.map(d => `- ${d.metricName}: ${d.value.toFixed(2)} ${d.unit} (Status: ${d.status})`).join('\n')
    : 'No active diagnostic data.';

  const formattedHistory = history.map(m => `${m.role === 'kai' ? 'Kai' : 'User'}: ${m.content}`).join('\n');

  const prompt = `
  You are Kai, an AI diagnostic coach. Your voice is calm, insightful, and conversational.
  This is a continuous voice conversation, so keep your responses brief and easy to understand when spoken aloud. Do not use Markdown formatting.
  
  The user's current Digital Twin data snapshot is as follows:
  ---
  ${formattedData}
  ---
  
  Based on this data and the conversation history, answer the user's latest query.

  CONVERSATION HISTORY:
  ${formattedHistory}

  Your Next Response:
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    log('SUCCESS', 'getDiagnosticConversationResponse: AI response received.');
    return response.text;
  } catch (error) {
    log('ERROR', 'getDiagnosticConversationResponse: Gemini API call failed.', { error });
    console.error("Error in diagnostic conversation:", error);
    return "My apologies, I'm experiencing a connection issue. Could you try that again in a moment?";
  }
};

export const pingGemini = async (): Promise<boolean> => {
    log('INFO', 'pingGemini: Pinging Gemini API.');
    checkAiEnabled();
    if (!ai) {
        log('WARN', 'pingGemini: AI service not available for ping.');
        return false;
    }
    try {
        // A very lightweight, low-cost call to check for connectivity and auth.
        await ai.models.generateContent({ model: "gemini-2.5-flash", contents: "ping" });
        log('SUCCESS', 'pingGemini: Ping successful.');
        return true;
    } catch (error) {
        log('ERROR', 'pingGemini: Ping failed.', { error });
        console.error("Gemini API ping failed:", error);
        return false;
    }
};

export const getExploreSearchResults = async (
    query: string,
    protocols: Protocol[],
    stacks: CommunityStack[],
    journeys: Journey[]
): Promise<SearchResponse> => {
    log('INFO', 'getExploreSearchResults: AI search initiated.', { query });
    checkAiEnabled();
    if (!ai) {
        log('ERROR', 'getExploreSearchResults: AI service is unavailable.');
        throw new Error("AI search is currently unavailable.");
    }

    const protocolsList = protocols.map(p => `ID: ${p.id}, Name: ${p.name}, Categories: [${p.categories.join(', ')}]`).join('\n');
    const stacksList = stacks.map(s => `ID: ${s.id}, Name: ${s.name}, Contains: [${s.protocol_ids.map(pid => protocols.find(p => p.id === pid)?.name || '').filter(Boolean).join(', ')}]`).join('\n');
    const journeysList = journeys.map(j => `ID: ${j.id}, Name: ${j.name}, Contains: [${j.protocolIds.map(pid => protocols.find(p => p.id === pid)?.name || '').filter(Boolean).join(', ')}]`).join('\n');

    const prompt = `
    You are Kai, an intelligent discovery engine for the BiohackStack platform. Your task is to analyze a user's search query and return the most relevant items from across the entire platform catalog, which includes individual Protocols, community-created Stacks, and expert-guided Journeys.

    **USER QUERY:**
    ---
    "${query}"
    ---

    **PLATFORM CATALOG (Summarized):**
    ---
    **Protocols:**
    ${protocolsList}

    **Community Stacks:**
    ${stacksList}

    **Journeys:**
    ${journeysList}
    ---

    **YOUR TASK:**
    Analyze the user's query to understand their intent (e.g., are they looking for sleep help, stress reduction, cognitive enhancement?). Then, find the most relevant items from all three categories. Return a ranked list of up to 5 items.

    - For each item, you must provide a concise, one-sentence "justification" explaining *why* it's a good match for the user's query.
    - Be intelligent in your matching. A query for "morning routine" could match protocols like "Sun Salutation" and stacks named "Morning Kickstarter".
    - Prioritize items that are a direct and strong match.
    - Return your findings as a JSON object adhering to the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.2,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        results: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['protocol', 'stack', 'journey'] },
                                    id: { type: Type.STRING },
                                    justification: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        log('SUCCESS', 'getExploreSearchResults: AI response received.');
        const parsed = JSON.parse(response.text.trim()) as SearchResponse;
        return parsed;
    } catch (error) {
        log('ERROR', 'getExploreSearchResults: Gemini API call failed.', { error });
        console.error("Error fetching search results from Gemini:", error);
        throw new Error("An unexpected error occurred with the AI service. Please try again.");
    }
};

export const getDigitalTwinForecast = async (
  timeHorizon: string,
  diagnosticData: DiagnosticDataPoint[],
  currentStack: Protocol[],
  allProtocols: Protocol[]
): Promise<DigitalTwinForecast> => {
  log('INFO', 'getDigitalTwinForecast: AI request initiated.', { timeHorizon });
  checkAiEnabled();
  if (!ai) {
    log('ERROR', 'getDigitalTwinForecast: AI service is unavailable.');
    throw new Error("The AI service is currently unavailable.");
  }
  if (diagnosticData.length === 0) {
      throw new Error("Cannot run forecast without diagnostic data.");
  }

  const diagnosticString = diagnosticData.map(d => `- ${d.metricName}: ${d.value} ${d.unit} (Status: ${d.status})`).join('\n');
  const stackString = currentStack.map(p => `- ${p.name}: ${p.description}`).join('\n') || 'None';
  const protocolListString = allProtocols.map(p => `- ID: ${p.id}, Name: ${p.name}, Categories: ${p.categories.join(', ')}`).join('\n');

  const prompt = `
  You are Kai, a predictive health simulation engine for the BiohackStack platform. Your purpose is to run a "fast-forward" simulation on the user's Digital Twin to forecast future health outcomes and identify potential risks.

  **SIMULATION PARAMETERS:**
  ---
  **Time Horizon:** ${timeHorizon}
  **User's Current Digital Twin Snapshot:**
  ${diagnosticString}
  **User's Active Protocol Stack:**
  ${stackString}
  ---

  **AVAILABLE PROTOCOLS FOR MITIGATION:**
  ---
  ${protocolListString}
  ---

  **YOUR TASK:**
  Generate a detailed forecast as a JSON object. Adhere to the provided schema precisely.

  1.  **overallSummary:** Write a concise, high-level summary of the forecast.
  2.  **projectedMetrics:** For each key metric in the snapshot, project its value after ${timeHorizon}.
      - Determine if the trend is 'improving', 'declining', 'or 'stable'.
      - Provide a brief insight into why this change is expected based on the user's stack.
  3.  **identifiedRisks:** Perform a "pre-mortem" analysis.
      - Identify 1-2 potential negative outcomes or risks that could arise. A risk could be a metric moving into a borderline/high range, or a potential side-effect of the stack.
      - Estimate a probability for each risk (0.0 to 1.0).
      - Provide a clear rationale for why this risk exists.
      - If a suitable mitigating protocol exists in the "Available Protocols" list, suggest it. If not, set 'mitigation' to null. Ensure the protocol ID and name are correct.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            timeHorizon: { type: Type.STRING },
            overallSummary: { type: Type.STRING },
            projectedMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  metricName: { type: Type.STRING },
                  currentValue: { type: Type.STRING },
                  projectedValue: { type: Type.STRING },
                  trend: { type: Type.STRING, enum: ['improving', 'declining', 'stable'] },
                  insight: { type: Type.STRING }
                }
              }
            },
            identifiedRisks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  risk: { type: Type.STRING },
                  probability: { type: Type.NUMBER },
                  rationale: { type: Type.STRING },
                  mitigation: {
                    type: Type.OBJECT,
                    nullable: true,
                    properties: {
                      protocolId: { type: Type.STRING },
                      protocolName: { type: Type.STRING },
                      reason: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    log('SUCCESS', 'getDigitalTwinForecast: AI response received.');
    return JSON.parse(response.text.trim());
  } catch (error) {
    log('ERROR', 'getDigitalTwinForecast: Gemini API call failed.', { error });
    console.error("Error fetching forecast from Gemini:", error);
    throw new Error("An unexpected error occurred with the AI service. Please try again.");
  }
};

export const getAdminGrowthBriefing = async (
  analytics: any, // The analytics object from dataStore
  protocols: Protocol[]
): Promise<GrowthBriefing> => {
  log('INFO', 'getAdminGrowthBriefing: AI request initiated.');
  checkAiEnabled();
  if (!ai) {
    log('ERROR', 'getAdminGrowthBriefing: AI service is unavailable.');
    throw new Error("The AI service is currently unavailable.");
  }

  const analyticsString = `
- Daily Active Users: ${analytics.dau}
- New Users (this week): ${analytics.newUsers}
- User Funnel: ${analytics.userFunnel.map((s: any) => `${s.stage}: ${s.count} users`).join(', ')}
- Most Popular Stack: "${analytics.mostPopularStack}"
- Top Contributor: ${analytics.topContributor}
  `;

  const availableProtocols = protocols
    .filter(p => !p.isCommunity && !p.isPersonalized)
    .map(p => `- ID: ${p.id}, Name: ${p.name}, Categories: ${p.categories.join(', ')}`)
    .join('\n');

  const prompt = `
You are Kai, an AI-powered growth strategist for the BiohackStack platform. Your purpose is to analyze platform analytics and provide a concise, actionable weekly growth briefing for the platform admin.

**PLATFORM ANALYTICS SNAPSHOT:**
---
${analyticsString}
---

**AVAILABLE OFFICIAL PROTOCOLS FOR CAMPAIGNS:**
---
${availableProtocols}
---

**YOUR TASK:**
Generate a "Weekly Growth Briefing" as a JSON object. Adhere to the provided schema precisely.

1.  **summary:** Write a 1-2 sentence high-level summary of the platform's health this week.
2.  **opportunities:** Identify 1-2 key opportunities for growth or engagement based on the data. These should be insightful and specific. (e.g., "The 'Longevity' category is trending. We should capitalize on this interest.")
3.  **risks:** Identify 1-2 potential risks or areas for improvement. (e.g., "The drop-off between 'Activated' and 'Engaged' users in the funnel is high. We need to improve day 7 retention.")
4.  **suggestedCampaign:** Based on your analysis, propose a complete "Mission of the Week" campaign to address an opportunity or risk.
    - Select a relevant **protocolId** and **protocolName** from the available list.
    - Suggest a **bonusXp** amount (between 50 and 250).
    - Provide a concise **rationale** explaining why this mission is strategically important this week.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedCampaign: {
              type: Type.OBJECT,
              properties: {
                protocolId: { type: Type.STRING },
                protocolName: { type: Type.STRING },
                bonusXp: { type: Type.INTEGER },
                rationale: { type: Type.STRING },
              },
            },
          },
        },
      },
    });
    log('SUCCESS', 'getAdminGrowthBriefing: AI response received.');
    return JSON.parse(response.text.trim());
  } catch (error) {
    log('ERROR', 'getAdminGrowthBriefing: Gemini API call failed.', { error });
    console.error("Error fetching growth briefing from Gemini:", error);
    throw new Error("An unexpected error occurred with the AI service. Please try again.");
  }
};

export const generateCardArtFromProtocol = async (protocol: Protocol): Promise<string> => {
  log('INFO', 'generateCardArtFromProtocol: AI art request initiated.');
  checkAiEnabled();
  if (!ai) {
    log('ERROR', 'generateCardArtFromProtocol: AI service is unavailable.');
    throw new Error("The AI service is currently unavailable.");
  }

  const prompt = `
    Create a visually stunning, vibrant, digital art illustration for a collectible card. The art should be abstract and conceptual, representing the core ideas of the following biohacking protocol. Do not include any text or borders.

    Protocol Name: "${protocol.name}"
    Categories: ${protocol.categories.join(', ')}
    Description: "${protocol.description}"

    Artistic Style:
    - Energetic, ethereal, futuristic, abstract digital painting.
    - Use a color palette inspired by these themes but feel free to be creative.
    - The overall feeling should be powerful and inspiring.
    - Clean, modern aesthetic. Focus on flowing lines, energy fields, and conceptual representations.
  `;

  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("AI did not return an image.");
    }
    
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    log('SUCCESS', 'generateCardArtFromProtocol: AI art generated.');
    return `data:image/jpeg;base64,${base64ImageBytes}`;

  } catch (error) {
    log('ERROR', 'generateCardArtFromProtocol: Gemini API call failed.', { error });
    console.error("Error generating card art from Gemini:", error);
    throw new Error("An unexpected error occurred with the AI art service. Please try again.");
  }
};