// lib/pdf/extract.ts

export async function extractTextFromPDF(file: File): Promise<{
  text: string;
  pageCount: number;
}> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    return await extractTextFromPDFBuffer(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF. Please ensure it is a text-based PDF.');
  }
}

export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
}> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParseModule = require('pdf-parse');

    // pdf-parse can export as either default or direct function
    const pdfParse = pdfParseModule.default || pdfParseModule;

    console.log('pdf-parse type:', typeof pdfParse);
    console.log('pdf-parse module keys:', Object.keys(pdfParseModule));

    // Parse the PDF buffer
    const data = await pdfParse(buffer, {
      // Increase max buffer size to handle larger PDFs
      max: 0, // 0 = no limit
    });

    const text = data.text?.trim() || '';

    if (!text) {
      throw new Error('No text content found in PDF. It may be an image-based PDF or scanned document.');
    }

    return {
      text,
      pageCount: data.numpages || 1,
    };
  } catch (error) {
    console.error('Error extracting PDF text:', error);

    if (error instanceof Error && error.message.includes('No text content')) {
      throw error;
    }

    // Log the actual error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Actual PDF parsing error:', errorMessage);

    throw new Error('Failed to extract text from PDF. Please ensure it is a text-based PDF (not scanned images).');
  }
}
