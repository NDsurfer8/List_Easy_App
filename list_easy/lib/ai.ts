/**
 * AI valuation service.
 * Set EXPO_PUBLIC_OPENAI_API_KEY in .env to use real API; otherwise returns mock values.
 */

import { readFileAsBase64 } from './firebase';

export type ValuationResult = {
  label: string;
  description: string;
  estimatedValue: number;
  category: string;
};

const MOCK_CATEGORIES = ['Furniture', 'Electronics', 'Decor', 'Lighting', 'Textiles', 'Kitchen', 'Storage'];

function randomBetween(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

/** Mock valuation for when no API key is set */
export async function getMockValuation(imageUri: string, _box?: { x: number; y: number; width: number; height: number }): Promise<ValuationResult> {
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));
  const labels = [
    'Vintage side table', 'Desk lamp', 'Bookshelf', 'Armchair', 'Coffee table',
    'Floor lamp', 'Throw pillows (set)', 'Wall art', 'Plant stand', 'Rug',
    'TV stand', 'Couch', 'Dining chair', 'Mirror', 'Cabinet',
  ];
  const label = labels[Math.floor(Math.random() * labels.length)];
  const category = MOCK_CATEGORIES[Math.floor(Math.random() * MOCK_CATEGORIES.length)];
  return {
    label,
    description: `${label} in good condition, suitable for living room or bedroom.`,
    estimatedValue: randomBetween(25, 450),
    category,
  };
}

/**
 * Call OpenAI Vision to describe and value the item in the image (optionally cropped by box).
 * Pass imageUri (local file URI or base64) and optional bounding box.
 */
export async function getAIValuation(
  imageUri: string,
  box?: { x: number; y: number; width: number; height: number }
): Promise<ValuationResult> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return getMockValuation(imageUri, box);
  }

  try {
    let imageUrl = imageUri;
    if (imageUri.startsWith('file://') || imageUri.startsWith('file:')) {
      const base64 = await readFileAsBase64(imageUri);
      if (!base64) {
        console.warn('Could not read image as base64, using mock');
        return getMockValuation(imageUri, box);
      }
      imageUrl = `data:image/jpeg;base64,${base64}`;
    }
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Look at this image of a room. Describe the main furniture or item visible (or the item in the highlighted region if coordinates are provided). 
Respond in JSON only with: {"label": "short name", "description": "1 sentence", "estimatedValue": number in USD, "category": "Furniture|Electronics|Decor|Lighting|Textiles|Kitchen|Storage"}. 
Estimate resale value for used furniture in good condition.`,
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      console.warn('OpenAI API error:', err);
      return getMockValuation(imageUri, box);
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const json = content.replace(/```json?\s*|\s*```/g, '').trim();
    return JSON.parse(json) as ValuationResult;
  } catch (e) {
    console.warn('AI valuation failed, using mock:', e);
    return getMockValuation(imageUri, box);
  }
}

/** Get similar items by category (for "similar items" section) */
export function getSimilarCategory(category: string): string[] {
  const byCategory: Record<string, string[]> = {
    Furniture: ['Armchair', 'Bookshelf', 'Coffee table', 'Side table', 'Cabinet'],
    Electronics: ['Desk lamp', 'TV stand', 'Speaker'],
    Decor: ['Wall art', 'Mirror', 'Vase', 'Plant stand'],
    Lighting: ['Desk lamp', 'Floor lamp', 'Table lamp'],
    Textiles: ['Rug', 'Throw pillows (set)', 'Curtains'],
    Kitchen: ['Dining chair', 'Bar stool', 'Kitchen cart'],
    Storage: ['Bookshelf', 'Cabinet', 'Shelf unit'],
  };
  return byCategory[category] ?? ['Furniture', 'Decor'];
}
