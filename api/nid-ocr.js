// Simulated backend for NID OCR processing
// In production, this would call Azure Form Recognizer, Google Vision, or Tesseract

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // In a real implementation:
    // 1. Parse FormData to get the image buffer (using e.g., formidable)
    // 2. Call OCR Service (e.g., Azure Form Recognizer)
    // 3. Process the results

    // Mock response simulating a 1.5 second OCR delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulated successful extraction base on standard NID layout
    const mockExtractedData = {
      name: "আবু মোঃ মনিরুজ্জামান",
      nameEn: "Abu Md Moniruzjaman",
      fatherName: "আবু মোঃ মহসিন",
      motherName: "মমতাজ বেগম",
      dob: "1986-01-18",
      nid: "1938873666",
      bloodGroup: "O+",
      address: {
        village: "শংকর পুর",
        postOffice: "বিরল - ৫২১০",
        upazila: "বিরল",
        municipality: "বিরল পৌরসভা",
        district: "দিনাজপুর",
        division: "রংপুর",
        rawAddressText: "ঠিকানা: মৌজা/মহল্লা: শংকর পুর, ডাকঘর: বিরল - ৫২১০, বিরল, বিরল পৌরসভা, দিনাজপুর"
      }
    };

    return res.status(200).json({
      success: true,
      message: 'NID processed successfully',
      data: mockExtractedData,
    });

  } catch (error) {
    console.error('OCR Processing Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process NID image',
      error: error.message
    });
  }
}
