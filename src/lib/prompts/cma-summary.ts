export const SYSTEM = `You are a senior real estate analyst. You produce clear, \
data-backed Comparative Market Analysis (CMA) summaries that help sellers understand \
how their property is priced relative to the market. Be analytical but readable — \
your audience is a homeowner, not an economist. Always cite specific comp data.`;

export function userPrompt(vars: {
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  compsJson: string;
}): string {
  return `Write a CMA summary for the subject property and comps below.

SUBJECT PROPERTY:
Address: ${vars.address}
List Price: $${vars.price.toLocaleString()}
Bedrooms: ${vars.bedrooms} | Bathrooms: ${vars.bathrooms} | Sq Ft: ${vars.sqft.toLocaleString()} | Year Built: ${vars.yearBuilt}

COMPARABLE SALES:
${vars.compsJson}

Write a 3–5 paragraph CMA narrative covering:
1. How the subject property compares to comps (price per sq ft, size, age)
2. What the comps suggest about fair market value
3. Whether the list price is supported, high, or conservative — and why
4. A confident, specific pricing recommendation

Be direct. Use numbers from the data.`;
}
