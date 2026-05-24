# 🕵️‍♂️ JD Scanner

**JD Scanner** is a lightweight Chrome and Opera browser extension designed for Cyber Security professionals in the UK. It uses Google's Gemini AI to instantly read a job description and extract the most important details so you don't have to go digging!

## ✨ Features

- 💰 **Salary Extraction**: Instantly finds the expected salary (or tells you if it's not mentioned).
- 📅 **Experience Requirements**: Summarizes the required years of experience and any specific tools mentioned.
- 🛡️ **Security Clearance Check**: Explicitly checks if the role requires UK Security Clearance (SC/DV) or 5-year UK residency.
- 🖍️ **Evidence Highlighting**: Automatically highlights the sentences on the webpage where it found the information, so you can verify it yourself!
- 🔒 **Secure**: Your Gemini API key is stored safely in your browser's local storage and is never sent anywhere else.

## 🚀 Installation

Because this is a custom tool, it needs to be installed in "Developer Mode".

### 1. Get a Gemini API Key (Free)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **"Get API key"** and create a new key. Copy it and keep it safe!

### 2. Add to Chrome / Opera
1. Download or clone this repository to your computer.
2. Open your browser and go to your extensions page:
   - Chrome: `chrome://extensions/`
   - Opera: `opera://extensions/`
3. Turn on the **"Developer mode"** toggle switch (usually in the top right corner).
4. Click the **"Load unpacked"** button (top left).
5. Select the folder containing these files.

That's it! The extension is now installed. Pin it to your toolbar for easy access. 📌

## 💡 How to Use
1. Open a Cyber Security job description on LinkedIn, Indeed, or any other job board.
2. Click the JD Scanner icon in your browser toolbar.
3. *(First time only)* Paste your Gemini API key into the settings page and click **Save**.
4. Click **"Scan Job Description"**. 
5. The extension will read the page, display a clean summary in the popup, and highlight the evidence directly on the webpage!

## 🛠️ Built With
- Vanilla HTML, CSS (Material Design inspired), and JavaScript.
- Chrome Extensions Manifest V3.
- [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash`).
