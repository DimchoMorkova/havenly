import { Buffer } from 'buffer';

const IMGUR_CLIENT_ID = '2e0731dd8fd038a8e0a8a6e411ad1dcfd0fd6369';
const IMGUR_UPLOAD_URL = 'https://api.imgur.com/3/image';

export async function uploadToImgur(file: File): Promise<string> {
  try {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix
          const base64Data = reader.result.split(',')[1];
          resolve(base64Data);
        }
      };
      reader.onerror = error => reject(error);
    });

    // Upload to Imgur
    const response = await fetch(IMGUR_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${IMGUR_CLIENT_ID}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64,
        type: 'base64',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to Imgur');
    }

    const data = await response.json();
    return data.data.link;
  } catch (error) {
    console.error('Error uploading to Imgur:', error);
    throw error;
  }
}