const GEMINI_MODEL = "gemini-1.5-flash";

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
      document.getElementById('mainContent').classList.remove('hidden');
    } else {
      document.getElementById('settingsContent').classList.remove('hidden');
    }
  });
});

document.getElementById('saveKeyBtn').addEventListener('click', () => {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (key) {
    chrome.storage.local.set({ geminiApiKey: key }, () => {
      document.getElementById('settingsContent').classList.add('hidden');
      document.getElementById('mainContent').classList.remove('hidden');
    });
  }
});

document.getElementById('changeKeyLink').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('mainContent').classList.add('hidden');
  document.getElementById('settingsContent').classList.remove('hidden');
});

// Copy Button Logic
document.getElementById('copyBtn').addEventListener('click', () => {
  const salary = document.getElementById('salaryVal').innerText;
  const exp = document.getElementById('expVal').innerText;
  const clearance = document.getElementById('clearanceVal').innerText;
  const sponsorship = document.getElementById('sponsorshipVal').innerText;
  const workingModel = document.getElementById('workingModelVal').innerText;
  const techStack = document.getElementById('techStackVal').innerText;

  const summaryText = `JD Scanner Summary:\n- Salary: ${salary}\n- Experience: ${exp}\n- Clearance: ${clearance}\n- Sponsorship: ${sponsorship}\n- Model: ${workingModel}\n- Tech Stack: ${techStack}`;

  navigator.clipboard.writeText(summaryText).then(() => {
    const btn = document.getElementById('copyBtn');
    const originalText = btn.innerText;
    btn.innerText = "✅ Copied!";
    setTimeout(() => { btn.innerText = originalText; }, 2000);
  });
});

document.getElementById('scanBtn').addEventListener('click', async () => {
  const btn = document.getElementById('scanBtn');
  const loader = document.getElementById('loader');
  const resultsDiv = document.getElementById('results');
  const errorDiv = document.getElementById('error');

  btn.disabled = true;
  loader.classList.remove('hidden');
  resultsDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');

  try {
    const keyResult = await chrome.storage.local.get(['geminiApiKey']);
    const GEMINI_API_KEY = keyResult.geminiApiKey;

    if (!GEMINI_API_KEY) {
      throw new Error("API Key is missing. Please save your key first.");
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const extractTextResult = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText
    });
    
    const pageText = extractTextResult[0].result;

    if (!pageText) {
      throw new Error("Could not extract text from the page.");
    }

    const prompt = `
    Analyze the following job description text. 
    Extract the following information and return ONLY a valid JSON object. Do NOT include markdown formatting like \`\`\`json.
    Required JSON structure:
    {
      "salary": "String (Expected salary or 'Not mentioned')",
      "experience": "String (Years of experience required, total and specific tools/fields)",
      "clearance": "String (Explicitly state if UK Security Clearance (SC/DV) or 5-year UK residency is required. Be definitive.)",
      "sponsorship": "String (Explicitly state if Visa or Job Sponsorship is offered, not offered, or not mentioned)",
      "workingModel": "String (Remote, Hybrid, On-site, or Not mentioned)",
      "techStack": "String (Comma-separated list of core technologies, tools, or certifications required)",
      "evidenceQuotes": {
        "salary": "String (Exact sentence mentioning salary, or null)",
        "experience": "String (Exact sentence mentioning experience, or null)",
        "clearance": "String (Exact sentence mentioning clearance, or null)",
        "sponsorship": "String (Exact sentence mentioning sponsorship, or null)",
        "workingModel": "String (Exact sentence mentioning working model, or null)"
      }
    }
    
    Job Description:
    ${pageText.substring(0, 30000)}
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const jsonText = data.candidates[0].content.parts[0].text;
    const resultJson = JSON.parse(jsonText);

    document.getElementById('salaryVal').innerText = resultJson.salary || 'N/A';
    document.getElementById('expVal').innerText = resultJson.experience || 'N/A';
    document.getElementById('clearanceVal').innerText = resultJson.clearance || 'N/A';
    document.getElementById('sponsorshipVal').innerText = resultJson.sponsorship || 'N/A';
    document.getElementById('workingModelVal').innerText = resultJson.workingModel || 'N/A';
    document.getElementById('techStackVal').innerText = resultJson.techStack || 'N/A';
    
    resultsDiv.classList.remove('hidden');

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    chrome.tabs.sendMessage(tab.id, {
      action: "highlight",
      quotes: resultJson.evidenceQuotes
    });

  } catch (err) {
    console.error(err);
    errorDiv.innerText = err.message;
    errorDiv.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    loader.classList.add('hidden');
  }
});
