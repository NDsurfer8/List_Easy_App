/**
 * Generate a product-style image (display model on white background) via OpenAI DALL·E 3.
 * Downloads the image to cache and returns the local URI.
 */

import { Paths, downloadAsync } from 'expo-file-system';

const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations';

export async function generateProductImage(
  itemId: string,
  label: string,
  description: string
): Promise<string | null> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;

  const prompt = `Professional product photography of "${label}". ${description}. Single item on pure white background, studio lighting, display model style, high quality e-commerce photo, centered, no shadows.`;

  try {
    const response = await fetch(OPENAI_IMAGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url',
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      console.warn('OpenAI Images API error:', err);
      return null;
    }
    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) return null;

    const safeId = itemId.replace(/[^a-z0-9_-]/gi, '_');
    const fileUri = `${Paths.cache.uri}/product_${safeId}.jpg`;
    await downloadAsync(imageUrl, fileUri);
    return fileUri;
  } catch (e) {
    console.warn('Product image generation failed:', e);
    return null;
  }
}
