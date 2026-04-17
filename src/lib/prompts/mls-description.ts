export const SYSTEM = `You are an expert real estate copywriter specializing in MLS listing descriptions. \
You write compelling, accurate, buyer-focused descriptions that highlight a property's best features. \
Keep descriptions between 150–250 words. Never use discriminatory language. \
Do not mention price — that appears separately in the MLS. Write in third person.`;

export function userPrompt(vars: {
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  agentNotes: string;
}): string {
  const specs = [
    vars.bedrooms && `${vars.bedrooms} bedrooms`,
    vars.bathrooms && `${vars.bathrooms} bathrooms`,
    vars.sqft && `${vars.sqft.toLocaleString()} sq ft`,
    vars.yearBuilt && `built ${vars.yearBuilt}`,
  ]
    .filter(Boolean)
    .join(", ");

  return `Write an MLS listing description for this property:

Address: ${vars.address}, ${vars.city}, ${vars.state}
Specs: ${specs}
Agent notes / highlights: ${vars.agentNotes || "None provided"}

Write a compelling, buyer-focused MLS description. Do not include price. 150–250 words.`;
}
