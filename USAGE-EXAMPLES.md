# Usage Examples

## Example CSV Files

### 1. Basic Q&A Cards
```csv
front,back
"What is the capital of France?","Paris"
"What is 2 + 2?","4"
"Who wrote Romeo and Juliet?","William Shakespeare"
```

### 2. Academic Study Cards
```csv
question,answer,tags
"What is the powerhouse of the cell?","Mitochondria","biology,cells"
"Define photosynthesis","The process by which plants convert light energy into chemical energy","biology,plants"
"What is Newton's first law?","An object at rest stays at rest and an object in motion stays in motion unless acted upon by a force","physics,mechanics"
```

### 3. Language Learning
```csv
front,back,tags
"Hello (Spanish)","Hola","spanish,greetings"
"Thank you (Spanish)","Gracias","spanish,courtesy"
"How are you? (Spanish)","¿Cómo estás?","spanish,questions"
```

### 4. Medical/Scientific Terms
```csv
front,back,tags
"What does bradycardia mean?","Slow heart rate, typically under 60 beats per minute","medical,cardiology"
"Define tachycardia","Fast heart rate, typically over 100 beats per minute","medical,cardiology"
"What is hypertension?","High blood pressure, consistently elevated arterial pressure","medical,cardiovascular"
```

### 5. Code/Programming
```csv
front,back,tags
"What does 'const' do in JavaScript?","Declares a block-scoped constant variable that cannot be reassigned","javascript,variables"
"What is a closure in JavaScript?","A function that has access to variables in its outer (enclosing) scope even after the outer function has returned","javascript,functions"
"What does REST stand for?","Representational State Transfer","programming,api"
```

## Workflow Examples

### Example 1: Creating a Geography Deck

1. **Create CSV file** (`world-capitals.csv`):
```csv
front,back,tags
"Capital of Japan","Tokyo","geography,asia,capitals"
"Capital of Brazil","Brasília","geography,south-america,capitals"
"Capital of Australia","Canberra","geography,oceania,capitals"
```

2. **Import and Review**:
   - Upload the CSV file
   - Review the imported cards
   - Add additional cards if needed
   - Set deck name to "World Capitals"

3. **Export**:
   - Click "Export .apkg"
   - Import the downloaded file into Anki
   - Start studying!

### Example 2: Converting Existing Study Materials

If you have study materials in a different format:

1. **Convert to CSV format**:
   - From Google Sheets: File → Download → CSV
   - From Excel: Save As → CSV
   - From text: Use find/replace to create comma-separated format

2. **Ensure proper column headers**:
   - Rename columns to `front`, `back`, `tags`
   - Remove any extra formatting

3. **Import and refine**:
   - Upload to the application
   - Edit cards for clarity
   - Add relevant tags
   - Export as .apkg

### Example 3: Collaborative Deck Creation

1. **Team creates shared Google Sheet**:
```csv
front,back,tags,creator
"What is React?","JavaScript library for UI","programming,react","Alice"
"What is Redux?","State management library","programming,redux","Bob"
"What is JSX?","JavaScript XML syntax","programming,react","Charlie"
```

2. **Download and import**:
   - Download Google Sheet as CSV
   - Import into the application
   - Review all cards together
   - Export final .apkg for team use

## Advanced CSV Formatting

### Using Different Column Names
The application recognizes these column variations:

**For Questions/Front:**
- `front`, `Front`, `FRONT`
- `question`, `Question`, `QUESTION`
- `q`, `Q`

**For Answers/Back:**
- `back`, `Back`, `BACK`
- `answer`, `Answer`, `ANSWER`
- `a`, `A`

**For Tags:**
- `tags`, `Tags`, `TAGS`

### Handling Special Characters
```csv
front,back,tags
"What is π (pi)?","Mathematical constant ≈ 3.14159","math,constants"
"Translate: 'café'","Coffee (French)","french,food"
"What does 'naïve' mean?","Lacking experience or judgment","english,vocabulary"
```

### Multi-line Content
```csv
front,back,tags
"List the primary colors","1. Red
2. Blue  
3. Yellow","art,colors"
"Explain the water cycle","1. Evaporation
2. Condensation
3. Precipitation
4. Collection","science,water"
```

## Export Options Explained

### 1. .apkg Export (Primary)
- **Best for**: Direct import into Anki
- **Contains**: All card data, tags, and deck structure
- **Usage**: Double-click file to import into Anki

### 2. CSV Export
- **Best for**: Backup, sharing, or editing in spreadsheet software
- **Contains**: Card data in comma-separated format
- **Usage**: Open in Excel, Google Sheets, or any text editor

### 3. JSON Export
- **Best for**: Programmatic use, API integration
- **Contains**: Structured data in JSON format
- **Usage**: Development, data processing, or backup

### 4. Anki Text Export
- **Best for**: Manual Anki import (alternative method)
- **Contains**: Tab-separated text format
- **Usage**: File → Import in Anki desktop

## Tips for Better Cards

### 1. Write Clear Questions
❌ **Poor**: "France"
✅ **Good**: "What is the capital of France?"

### 2. Keep Answers Concise
❌ **Poor**: "The capital city of France, which is also the largest city in the country and home to many famous landmarks including the Eiffel Tower, is Paris."
✅ **Good**: "Paris"

### 3. Use Consistent Formatting
```csv
front,back,tags
"Define: Photosynthesis","Process converting light to chemical energy","biology"
"Define: Mitosis","Cell division process","biology"
"Define: Osmosis","Movement of water across membranes","biology"
```

### 4. Add Meaningful Tags
```csv
front,back,tags
"What is React?","JavaScript UI library","programming,javascript,react,frontend"
"What is Node.js?","JavaScript server runtime","programming,javascript,nodejs,backend"
```

### 5. Create Bidirectional Cards When Appropriate
```csv
front,back,tags
"Paris → Country","France","geography,capitals"
"France → Capital","Paris","geography,capitals"
```
