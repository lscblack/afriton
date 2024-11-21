import { toast } from 'react-toastify';

// Converts a base64 string to a Uint8Array
const base64ToUint8Array = (base64) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Decrypts any encrypted data using AES-CBC
export const decryptAnyData = async (encryptedData, secretKey, t) => {
  try {
    // Check if secretKey is valid
    if (!secretKey || typeof secretKey !== 'string') {
      throw new Error("Invalid secret key");
    }

    let ivBase64, ctBase64;

    // Check if the data contains a colon, indicating a standard format
    if (encryptedData.includes(':')) {
      // Handle standard encrypted data format
      [ivBase64, ctBase64] = encryptedData.split(':');
    } else {
      // Handle non-standard format: assume the entire string is the ciphertext
      console.warn("Non-standard format detected; treating the entire data as ciphertext");
      ctBase64 = encryptedData; // Treat the entire string as ciphertext
      // Generate a dummy IV (of 16 bytes) if IV is missing or not provided
      ivBase64 = btoa(String.fromCharCode(...new Uint8Array(16))); // Dummy 16-byte IV
    }

    // Validate that we have both IV and ciphertext
    if (!ivBase64 || !ctBase64) {
      throw new Error("Invalid encrypted data format");
    }

    // Convert base64 to Uint8Array
    const iv = base64ToUint8Array(ivBase64);
    const ciphertext = base64ToUint8Array(ctBase64);

    // Prepare the key for decryption
    const keyData = new TextEncoder().encode(secretKey.padEnd(16, '\0').slice(0, 16));
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );

    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: iv },
      cryptoKey,
      ciphertext
    );

    // Convert the decrypted buffer to text and parse JSON
    const decryptedText = new TextDecoder().decode(decryptedBuffer);
    const parsedData = JSON.parse(decryptedText);

    return parsedData;
  } catch (error) {
    console.error('Error decrypting AES data:', error);
    toast.error(t.SomethingWentWrong); // Show error toast
    return null; // Return null in case of error
  }

};
