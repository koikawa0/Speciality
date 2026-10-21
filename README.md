# Speciality

A music player built with React and Vite, using Deezer's free API for music discovery
and AudD for audio recognition.

**Live demo:** https://speciality-one.vercel.app

<img src="./docs/home.png" alt="Speciality home page" width="800">

## Features

- Search for songs, albums and artists in the Deezer library
- Listen to 30-second previews of songs
- Identify songs playing around you with the Listen button (AudD)
- Build your own library of artist and album shelves

## Technologies

- Node.js and npm
- React, React Router, Vite
- JavaScript, HTML and CSS
- dnd-kit (drag-and-drop reordering)
- Deezer API
- AudD API
- Vercel (hosting and serverless functions)

## Requirements

- [Node.js](https://nodejs.org) 22.12 or newer
- [Git](https://git-scm.com)
- An [AudD](https://audd.io) API token. It is only needed for the Listen feature,
  and the rest of the app works without it.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/koikawa0/Speciality.git
```

### 2. Go into the project folder

```bash
cd Speciality
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create your .env file

```bash
cp .env.example .env
```

On Windows Command Prompt, use `copy .env.example .env` instead.

### 5. Add your AudD token

Open `.env` and replace the placeholder with your token:

```
AUDD_API_TOKEN=your_audd_token_here
```

### 6. Start the development server

```bash
npm run dev
```

### 7. Open the app

Open the local URL shown in your terminal.

## Deploying your own copy

The app is hosted on Vercel. Two files make it work there:

- `vercel.json` forwards `/deezer-api/*` to Deezer, which avoids browser CORS
  errors, and sends every other route to the React app.
- `api/audd.js` is a serverless function that sends recorded audio to AudD
  without exposing your token.

To deploy:

1. Import the repository on [vercel.com](https://vercel.com).
2. In **Settings → Environment Variables**, add `AUDD_API_TOKEN` with your token.
3. Redeploy so the variable takes effect.

## Notes and limitations

- Playback is **30-second previews** only.
- Locally, the Vite dev server proxies Deezer and AudD. On Vercel, `vercel.json`
  and `api/audd.js` do the same job.
- The Listen feature needs microphone access, which browsers only allow on
  `localhost` or HTTPS.

## Disclaimer

Not affiliated with Deezer or AudD. Music data and previews belong to their respective owners.

## Author

[@koikawa0](https://github.com/koikawa0)