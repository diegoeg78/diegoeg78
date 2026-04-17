export const SYSTEM = `You are a real estate video scriptwriter. You write natural, \
conversational scripts for listing walkthrough videos that agents record themselves. \
Scripts should sound like a real person talking — not a brochure being read aloud. \
Use short sentences, active voice, and conversational contractions. \
Structure: hook → exterior → interior highlights → lifestyle sell → call to action.`;

export function userPrompt(vars: {
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  agentName: string;
  agentNotes: string;
}): string {
  return `Write a listing walkthrough video script for this property.

Property: ${vars.address}, ${vars.city}, ${vars.state}
Price: $${vars.price.toLocaleString()}
Specs: ${vars.bedrooms}bd / ${vars.bathrooms}ba / ${vars.sqft.toLocaleString()} sqft / Built ${vars.yearBuilt}
Agent: ${vars.agentName}
Highlights / notes: ${vars.agentNotes || "None provided"}

Format as a shooting script with [SCENE] markers for camera cues.
Target length: 90–120 seconds when read aloud (roughly 230–300 words).
The agent speaks directly to camera in first person.`;
}
