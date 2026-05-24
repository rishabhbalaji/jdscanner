// This file is injected into the page when a scan is complete to highlight the evidence text.

if (!window.jdScannerInitialized) {
  window.jdScannerInitialized = true;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "highlight") {
      highlightQuotes(request.quotes);
      sendResponse({ status: "success" });
    }
  });

  function highlightQuotes(quotes) {
    if (!quotes) return;

    // Define colors for highlighting using the primary/secondary palette + an accent
    const colors = {
      salary: "#00B188", // Green
      experience: "#003366", // Blue
      clearance: "#FF9800" // Orange for clearance to stand out
    };

    Object.keys(quotes).forEach(key => {
      const quote = quotes[key];
      if (quote && quote.trim().length > 5) {
        highlightText(document.body, quote.trim(), colors[key]);
      }
    });
  }

  function highlightText(element, textToFind, color) {
    // Create a TreeWalker to find all text nodes
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;

    while (node = walker.nextNode()) {
      // Ignore script and style tags
      if (node.parentElement && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement.tagName)) {
        continue;
      }
      textNodes.push(node);
    }

    for (let textNode of textNodes) {
      if (textNode.nodeValue.includes(textToFind)) {
        const span = document.createElement('span');
        span.style.backgroundColor = color;
        span.style.color = 'white';
        span.style.padding = '2px 4px';
        span.style.borderRadius = '4px';
        span.style.fontWeight = 'bold';
        span.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        
        const splitText = textNode.nodeValue.split(textToFind);
        
        const beforeNode = document.createTextNode(splitText[0]);
        span.textContent = textToFind;
        const afterNode = document.createTextNode(splitText.slice(1).join(textToFind));
        
        const parent = textNode.parentNode;
        parent.insertBefore(beforeNode, textNode);
        parent.insertBefore(span, textNode);
        parent.insertBefore(afterNode, textNode);
        parent.removeChild(textNode);
        
        // Scroll smoothly to the highlighted element
        span.scrollIntoView({ behavior: "smooth", block: "center" });
        break; // Only highlight first exact occurrence to avoid over-highlighting
      }
    }
  }
}
