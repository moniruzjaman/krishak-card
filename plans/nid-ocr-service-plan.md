# NID OCR Auto Data Collection Service Plan for Krishak Card

## Executive Summary
This plan outlines the implementation of an NID (National ID) OCR auto data collection service for the Krishak Card application. The service will enable farmers to capture/upload their Bangladeshi NID cards, automatically extract key information (name, DOB, NID number, address), validate the data, and auto-fill the farmer profile form.

## Recommended Technologies

### OCR Service Selection
Based on the requirements (free/unlimited usage, Bangla support, server-side processing in Vercel), I recommend:

**Primary Choice: Azure Form Recognizer**
- Free tier available with generous limits
- Strong Bangla language support through Azure Cognitive Services
- Pre-built ID card models that can be customized for Bangladeshi NID format
- Server-side processing aligns with Vercel deployment
- Good accuracy for structured documents like ID cards

**Alternative Options:**
1. **Google Cloud Vision API** - Good Bangla OCR capabilities, free tier available
2. **Tesseract OCR with Bangla training** - Open source, can be used server-side via Vercel functions

### Architecture Overview
```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐
│   Frontend      │    │   API Gateway    │    │  OCR Processing    │
│ (React App)     │◄──►│ (Vercel Routes)  │◄──►│  Service           │
│ - NID Capture   │    │ - /api/nid-ocr   │    │ - Azure Form       │
│ - Image Upload  │    │ - Auth/Validation│    │   Recognizer       │
│ - Auto-fill UI  │    │ - Rate Limiting  │    │ - Field Extraction │
└─────────────────┘    └──────────────────┘    └────────────────────┘
                                   │
                                   ▼
                           ┌─────────────────┐
                           │   Data Storage  │
                           │ (localStorage)  │
                           └─────────────────┘
```

## Implementation Steps

### 1. Backend API Routes
Create new API route: `/api/nid-ocr`
- Accept POST requests with NID card images
- Authenticate requests (optional API key or session-based)
- Process images using Azure Form Recognizer
- Extract fields: name, date of birth, NID number, address
- Validate extracted data (NID format, date validity)
- Return structured JSON response
- Handle errors gracefully

### 2. Frontend Components
Create new component: `NidOcrCapture.jsx`
- Camera capture interface (using navigator.mediaDevices)
- File upload fallback
- Image preview with cropping/rotation controls
- Submit button to send to OCR API
- Loading states and error handling
- Integration with FarmerProfile form

### 3. Data Flow
1. User captures/upload NID card image via frontend
2. Image sent to `/api/nid-ocr` endpoint
3. Backend processes image with Azure Form Recognizer
4. Extracted fields returned to frontend
5. Frontend validates data (NID checksum, date format)
6. Valid data auto-populates FarmerProfile form fields
7. User reviews and confirms before submission

### 4. Privacy & Security Considerations
- Images processed in-memory, not stored permanently
- Azure Form Recognizer processes data securely (compliant with GDPR, etc.)
- No sensitive data logged or stored beyond session
- HTTPS enforced for all API communications
- Optional: Implement automatic image deletion after processing
- User consent required before processing NID data

### 5. Offline Capabilities
- Primary mode: Online OCR processing
- Fallback: Manual data entry if OCR service unavailable
- Local caching of successful OCR results for same session
- Warning UI when offline/OCR service unavailable

### 6. UI Components
- NID capture modal/camera interface
- Image preview with validation guides
- Processing spinner/progress indicator
- Extracted data review/confirmation dialog
- Integration points in FarmerProfile section 1 (Personal Info)

## Detailed Implementation Plan

### Phase 1: Backend Development
1. Create `/api/nid-ocr.js` in api/ directory
2. Set up Azure Form Recognizer client (or alternative OCR service)
3. Implement image processing pipeline
4. Add field extraction and validation logic
5. Create error handling and response formatting
6. Add rate limiting and basic security

### Phase 2: Frontend Development
1. Create `src/components/NidOcrCapture.jsx`
2. Implement camera access and image capture
3. Add file upload fallback
4. Create image preview with basic editing
5. Implement API call to `/api/nid-ocr`
6. Add loading/error states
7. Create data validation functions
8. Implement auto-fill integration with FarmerProfile

### Phase 3: Integration & Testing
1. Connect NidOcrCapture to FarmerProfile form
2. Add "Scan NID Card" button in Section 1
3. Test with sample NID images
4. Validate field mapping accuracy
5. Test edge cases (blurry images, invalid data)
6. Performance testing and optimization

### Phase 4: Deployment & Monitoring
1. Deploy to Vercel
2. Monitor API usage and costs
3. Collect user feedback
4. Iterate on accuracy improvements
5. Add logging and analytics (anonymized)

## Field Mapping Specification
| NID Field | FarmerProfile Field | Validation Rules |
|-----------|-------------------|------------------|
| Name (Bangla) | name | Required, min 2 chars |
| Date of Birth | dob | Valid date, age >= 18 |
| NID Number | nid | 13 or 17 digits, checksum validation |
| Address | division, district, upazila, union, village | Parse and split address components |

## Error Handling & User Experience
- Clear error messages for OCR failures
- Guidance for retaking/uploading better images
- Manual entry fallback always available
- Progress indication during processing
- Success confirmation before auto-filling

## Future Enhancements
1. Support for English NID cards
2. Batch processing for multiple cards
3. Integration with government verification APIs
4. Advanced image preprocessing (glare removal, perspective correction)
5. Machine learning confidence scoring for extracted fields