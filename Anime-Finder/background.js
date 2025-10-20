// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'searchAnime') {
        const fetchUrl = `https://api.trace.moe/search?url=${encodeURIComponent(request.dataUrl)}`;
        
        fetch(fetchUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => sendResponse({ result: data.result }))
            .catch(error => sendResponse({ error: error.message }));
            
        return true; // Asynchronous response ke liye zaroori hai
    }
});