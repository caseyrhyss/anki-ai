# Troubleshooting Guide - Anki AI Card Generator

## Large PDF File Issues

### Problem: "Failed to extract text from PDF" with large files (>10MB)

The application has been optimized to handle large PDF files up to 100MB, but some issues may still occur:

#### Solutions:

1. **Wait Longer**: Large files (>50MB) can take 3-5 minutes to process
   - Look for the processing indicator with file size information
   - Check browser console for progress logs

2. **Use Alternative Parser**: The app automatically tries two different PDF parsers
   - If the primary parser fails, it will attempt the PDF.js parser
   - Check browser console to see which parser succeeded

3. **Check File Integrity**: 
   - Ensure the PDF is not corrupted
   - Try opening the PDF in a PDF viewer first
   - Some password-protected PDFs may fail

4. **Memory Issues**: For very large files, you may encounter memory limits
   - Close other browser tabs to free up memory
   - Try using Chrome or Firefox for better memory handling
   - Consider splitting very large PDFs into smaller sections

#### Current Limits:
- **Maximum file size**: 200MB (increased for large academic PDFs)
- **Maximum text extraction**: 500KB of text content
- **Processing timeout**: 5 minutes
- **Maximum pages processed**: 200 pages (for documents with many pages)
- **Claude API text processing**: 150KB (for AI-generated cards)

### Problem: Processing is very slow

#### Causes:
- Large file size (>50MB)
- Complex PDF with many images/graphics
- Scanned PDFs (image-based) are harder to process
- Low system memory

#### Solutions:
1. **Be Patient**: Large files legitimately take time
2. **Check System Resources**: Close unnecessary applications
3. **Try Smaller Sections**: Split large documents if possible
4. **Use Text-based PDFs**: OCR'd or scanned PDFs are much slower

### Problem: Extracted text is incomplete

#### Possible Issues:
- Document was automatically truncated (check for truncation message)
- Some pages failed to process (check console logs)
- PDF contains mostly images (requires OCR)

#### Solutions:
1. **Check Truncation Notice**: Look for "[Document truncated due to size...]" message
2. **Claude API Enhancement**: If you have Claude API access, set ANTHROPIC_API_KEY environment variable for better card generation

## Claude API Setup (Optional)

### Enhanced Card Generation
The application can use Claude AI for significantly better flashcard generation:

1. **Get API Key**: Sign up at https://console.anthropic.com/
2. **Set Environment Variable**: Add `ANTHROPIC_API_KEY=your_key_here` to your `.env.local` file
3. **Benefits**: 
   - **Understanding over memorization**: Creates concept-focused cards that test comprehension
   - **No artificial limits**: Generates as many cards as needed for complete coverage
   - **Deep explanations**: Provides detailed answers with reasoning and mechanisms
   - **Application-focused**: Tests ability to apply concepts, not just recall facts
   - **Comprehensive coverage**: Analyzes entire document for all key concepts
   - **Support for larger text inputs**: Up to 150KB of academic content

### Fallback Behavior
- Without Claude API: Uses rule-based card generation
- With Claude API failure: Automatically falls back to rule-based generation
- No additional setup required - works with or without API key
2. **Review Console Logs**: Check browser developer tools for detailed processing info
3. **Try Alternative Format**: Convert PDF to text format if possible

## Development Issues

### Problem: Node.js version warnings

The application requires Node.js 18+ but may work with 16.x:

```bash
# Check your Node version
node --version

# If using nvm, switch to Node 18+
nvm install 18
nvm use 18
```

### Problem: Build failures

1. **Clear dependencies**:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Check for TypeScript errors**:
```bash
npm run lint
```

## Performance Optimization

### For Large Files:
1. **Increase system memory** allocation if possible
2. **Use latest browsers** (Chrome/Firefox recommended)
3. **Close unnecessary browser tabs**
4. **Process during off-peak system usage**

### For Better Card Generation:
1. **Ensure good text extraction** first
2. **Review extracted text preview** before generating cards
3. **Edit generated cards** for better quality
4. **Add manual cards** for important concepts missed by automation

## Browser Compatibility

**Recommended browsers:**
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

**Known issues:**
- Older browsers may have memory limitations with large files
- Safari may have stricter memory limits
- Internet Explorer is not supported

## Getting Help

If you continue to experience issues:

1. **Check browser console** for detailed error messages
2. **Try a smaller test PDF** first to verify the system works
3. **Review the extracted text** to ensure it contains the content you expect
4. **Consider pre-processing** very large PDFs by splitting them

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "File size too large" | PDF exceeds 100MB limit | Split PDF or compress |
| "PDF processing timed out" | Processing took >5 minutes | Try smaller file or wait longer |
| "Not enough memory" | System ran out of memory | Close other apps, try smaller file |
| "Invalid or corrupted PDF" | PDF file is damaged | Try different PDF or repair original |
| "Both PDF parsers failed" | Neither parser could process file | Check file integrity, try different PDF |
