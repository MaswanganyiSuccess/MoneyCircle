// backend/src/services/ocr.service.ts
export async function extractFromID(imageBuffer: Buffer) {
  // Use Tesseract.js or cloud API to extract full name, ID number, and photo (if available)
  // Return { fullName, idNumber, photoBase64 }
  // Stub:
  return {
    fullName: 'John Doe',
    idNumber: '9501155123084',
    photoBase64: 'data:image/jpeg;base64,...',
  };
}