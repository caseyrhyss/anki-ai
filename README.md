# Anki Card Manager

A modern Next.js application for importing CSV flashcard data and exporting directly to Anki-compatible .apkg files. Perfect for creating and managing flashcard decks with a beautiful web interface.

## Features

- 📄 **CSV Import**: Upload CSV files with front/back card data
- 📦 **Anki Import Files**: Generate text files with clear import instructions for Anki
- ✏️ **Edit Cards**: Modify imported cards with an intuitive interface
- ➕ **Add Custom Cards**: Create additional cards manually
- 🎮 **PowerPoint-Style Review**: Full-screen flashcard interface with spaced repetition
- 🎚️ **Difficulty Tracking**: 4-level spaced repetition system (Again, Hard, Good, Easy)
- 📤 **Multiple Export Formats**: Export as CSV, JSON, or Anki text files
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations
- 🔧 **Flexible CSV Format**: Supports various column naming conventions

## Getting Started

### Prerequisites

- Node.js 18.18.0 or higher (recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd anki-ai
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Prepare Your CSV File

Create a CSV file with your flashcard data. The application supports flexible column naming:

#### Required Columns:
- **Front/Question**: `front`, `Front`, `FRONT`, `question`, `Question`, `QUESTION`, `q`, `Q`
- **Back/Answer**: `back`, `Back`, `BACK`, `answer`, `Answer`, `ANSWER`, `a`, `A`

#### Optional Column:
- **Tags**: `tags`, `Tags`, `TAGS` (comma-separated values)

#### Example CSV Format:
```csv
front,back,tags
"What is the capital of France?","Paris","geography,capitals"
"Define photosynthesis","The process by which plants convert light energy to chemical energy","biology,plants"
"What is 2 + 2?","4","math,basic"
```

### 2. Import Your CSV

- Drag and drop your CSV file onto the upload area
- Or click to select a file from your computer
- The application will automatically parse and validate your data
- Preview the first 5 cards to ensure correct import

### 3. Edit and Customize

- **Edit existing cards**: Click the "Edit" button on any card
- **Add new cards**: Use the "Add Card" button to create additional flashcards
- **Delete cards**: Remove unwanted cards with the "Delete" button
- **Rename your deck**: Change the deck name for better organization

### 4. Study with Review Mode

- Click "Start Review" for a full-screen flashcard experience
- **Study Flow**: Show question → Reveal answer → Select difficulty
- **Difficulty levels affect future review schedule**:
  - 🔴 **Again** (< 1 day): For concepts you struggled with
  - 🟠 **Hard** (< 3 days): Challenging but manageable
  - 🟢 **Good** (< 1 week): Standard difficulty
  - 🔵 **Easy** (< 2 weeks): Very easy concepts

### 5. Export Your Deck

#### Primary Export: .apkg File
- Click **"Export .apkg"** to download a file ready for Anki import
- Double-click the downloaded .apkg file to import directly into Anki
- Your deck will appear in Anki with all cards and tags preserved

#### Alternative Exports
- **CSV**: For spreadsheet applications or backup
- **JSON**: For programmatic use or data exchange
- **Anki Text**: Tab-separated format for manual Anki import

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **CSV Parsing**: PapaParse
- **APKG Generation**: anki-apkg-export
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React icons
- **File Upload**: react-dropzone
- **Deployment**: Vercel-ready

## API Endpoints

### POST /api/export-apkg
Generates Anki package (.apkg) files from card data.

**Request**:
```json
{
  "cards": [
    {
      "id": "1",
      "front": "Question text",
      "back": "Answer text",
      "tags": ["tag1", "tag2"]
    }
  ],
  "deckName": "My Deck"
}
```

**Response**: Binary .apkg file download

### POST /api/export-cards
Exports cards in various text formats (CSV, JSON, Anki text).

**Request**:
```json
{
  "cards": [...],
  "format": "csv|json|anki",
  "filename": "deck-name"
}
```

**Response**: File download with appropriate content type

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── export-apkg/       # .apkg file generation
│   │   └── export-cards/      # Alternative export formats
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page
├── components/
│   ├── CSVUpload.tsx          # CSV file import
│   ├── AnkiCardGenerator.tsx  # Card management interface
│   └── FlashcardReview.tsx    # Study interface
```

## CSV Format Examples

### Basic Format
```csv
front,back
"What is React?","A JavaScript library for building user interfaces"
"What is TypeScript?","A typed superset of JavaScript"
```

### With Tags
```csv
front,back,tags
"What is React?","A JavaScript library for building user interfaces","javascript,frontend"
"What is Node.js?","A JavaScript runtime for server-side development","javascript,backend"
```

### Alternative Column Names
```csv
question,answer,tags
"Define photosynthesis","Process by which plants convert light to energy","biology"
"What is mitosis?","Cell division process","biology,cells"
```

## Deployment

### Vercel (Recommended)
1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Other Platforms
The application can be deployed to:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform
- AWS Amplify

## Troubleshooting

### CSV Import Issues
- **Column names not recognized**: Use `front`/`back` or `question`/`answer`
- **Special characters**: Ensure proper CSV encoding (UTF-8)
- **Large files**: Files up to 50MB are supported

### Export Issues
- **APKG not working**: Ensure deck name doesn't contain special characters
- **Cards missing**: Check that all cards have both front and back content

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript must be enabled
- File download permissions required

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- APKG generation powered by [anki-apkg-export](https://github.com/ewnd9/anki-apkg-export)
- CSV parsing by [PapaParse](https://www.papaparse.com/)
- UI components from [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Built with [Next.js](https://nextjs.org/)

---

## Why Use This Tool?

- **No Software Installation**: Works entirely in your web browser
- **Direct Anki Integration**: No complex import procedures
- **Beautiful Interface**: Much nicer than editing CSV files manually
- **Study Mode**: Test your cards before importing to Anki
- **Flexible CSV Support**: Works with various CSV formats
- **Fast and Reliable**: Processes thousands of cards instantly