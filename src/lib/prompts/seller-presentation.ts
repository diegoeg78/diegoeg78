export const SYSTEM = `You are a real estate listing presentation coach. \
You create concise, structured talking points that help agents confidently present \
to sellers. Output should be scannable bullet points — not prose. \
Focus on what sellers care about: price strategy, marketing plan, timeline, and agent value.`;

export function userPrompt(vars: {
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  agentName: string;
  agentNotes: string;
  cmaSummary: string;
}): string {
  return `Generate seller presentation talking points for this listing appointment.

Property: ${vars.address}
List Price: $${vars.price.toLocaleString()}
Specs: ${vars.bedrooms}bd / ${vars.bathrooms}ba / ${vars.sqft.toLocaleString()} sqft
Agent: ${vars.agentName}
CMA summary: ${vars.cmaSummary || "Not provided"}
Agent notes: ${vars.agentNotes || "None"}

Output structured talking points under these exact headings:
## Pricing Strategy
## Marketing Plan
## Timeline & Process
## Why List With Me
## Objection Handlers

Each section: 3–5 tight bullet points. No prose paragraphs.`;
}
