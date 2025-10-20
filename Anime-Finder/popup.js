// popup.js

document.addEventListener('DOMContentLoaded', function() {
    const mainPage = document.getElementById('mainPage');
    const donationPage = document.getElementById('donationPage');
    const feedbackPage = document.getElementById('feedbackPage');

    const supportBtn = document.getElementById('supportBtn');
    const feedbackBtn = document.getElementById('feedbackBtn');
    const backBtn1 = document.getElementById('backBtn1');
    const backBtn2 = document.getElementById('backBtn2');
    const sendFeedbackBtn = document.getElementById('sendFeedbackBtn');

    // Naye elements selectors, ab showCryptoAddressBtn ki zarurat nahi hai
    const copyBtn = document.querySelector('.copy-btn');
    
    // Aapka naya wallet address
    const newWalletAddress = '0x8af1Db6c36fc025F9B249C2E82ce4dfb1CDE874D';
    const randomAnimeBtn = document.getElementById('randomAnimeBtn');

    // Button events
    supportBtn.addEventListener('click', () => {
        mainPage.classList.remove('active-page');
        feedbackPage.classList.remove('active-page');
        donationPage.classList.add('active-page');
    });

    feedbackBtn.addEventListener('click', () => {
        mainPage.classList.remove('active-page');
        donationPage.classList.remove('active-page');
        feedbackPage.classList.add('active-page');
    });

    backBtn1.addEventListener('click', () => {
        donationPage.classList.remove('active-page');
        mainPage.classList.add('active-page');
        // Crypto details ab hamesha dikhenge, is line ki zarurat nahi hai
    });

    backBtn2.addEventListener('click', () => {
        feedbackPage.classList.remove('active-page');
        mainPage.classList.add('active-page');
    });

   // Formspree feedback function
const feedbackForm = document.getElementById('feedbackForm');

feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Default form submission ko rokna
    const feedbackText = document.getElementById('feedbackText').value;
    
    if (feedbackText.trim() !== '') {
        const status = document.getElementById('my-form-status');
        
        // Use the Fetch API to send the form data
        const response = await fetch(e.target.action, {
            method: 'POST',
            body: new FormData(e.target),
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            alert('Thank you for your feedback!');
            document.getElementById('feedbackText').value = '';
            backBtn2.click(); // Go back to main page after success
        } else {
            alert('An error occurred. Please try again.');
        }
    } else {
        alert('Please enter your feedback.');
    }
});

    // Copy to clipboard functionality
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(newWalletAddress)
            .then(() => {
                alert('Wallet address copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    });

    // Random Anime Button functionality
    randomAnimeBtn.addEventListener('click', async () => {
        resultsDiv.innerHTML = '<p>Fetching a random anime...</p>';
        suggestionsDiv.style.display = 'none'; // Hide suggestions if open
        animeNameInput.value = ''; // Clear search input
        
        try {
            // Jikan API se ek random anime fetch karna
            const response = await fetch('https://api.jikan.moe/v4/random/anime');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            if (data.data) {
                displayResults([data.data]); // random/anime single object deta hai, isliye array mein wrap kiya
            } else {
                resultsDiv.innerHTML = '<p>Could not fetch a random anime. Please try again.</p>';
            }
        } catch (error) {
            console.error('Error fetching random anime:', error);
            resultsDiv.innerHTML = `<p>An error occurred: ${error.message}</p>`;
        }
    });

    const searchButton = document.getElementById('searchButton');
    const animeNameInput = document.getElementById('animeName');
    const resultsDiv = document.getElementById('results');
    const suggestionsDiv = document.getElementById('suggestions'); // Naya element

    // New event listeners for live search suggestions
    animeNameInput.addEventListener('input', debounce(async () => {
        const query = animeNameInput.value.trim();
        if (query.length > 2) { // Minimum 3 characters for suggestions
            await fetchAndDisplaySuggestions(query);
        } else {
            suggestionsDiv.style.display = 'none'; // Hide if less than 3 chars
        }
    }, 300));

    // Handle Enter keypress
    animeNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchAnime();
            suggestionsDiv.style.display = 'none'; // Hide suggestions on Enter
        }
    });

    // Handle clicks outside of the suggestions box to hide it
    document.addEventListener('click', (e) => {
        if (!suggestionsDiv.contains(e.target) && e.target !== animeNameInput) {
            suggestionsDiv.style.display = 'none';
        }
    });

    // Helper function to debounce API calls
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }
    
    async function fetchAndDisplaySuggestions(query) {
        try {
            const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`);
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                displaySuggestions(data.data);
            } else {
                suggestionsDiv.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            suggestionsDiv.style.display = 'none';
        }
    }

    function displaySuggestions(animeList) {
        suggestionsDiv.innerHTML = ''; // Clear previous suggestions
        suggestionsDiv.style.display = 'block';

        animeList.forEach(anime => {
            const title = anime.title_english || anime.title || 'Unknown Title';
            const imageUrl = anime.images.jpg.image_url || 'default_image.jpg';
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.innerHTML = `
                <img src="${imageUrl}" alt="${title}" class="suggestion-thumbnail">
                <p>${title}</p>
            `;

            suggestionItem.addEventListener('click', () => {
                animeNameInput.value = title;
                suggestionsDiv.style.display = 'none'; // Hide suggestions
                searchAnime(); // Automatically search for the selected anime
            });

            suggestionsDiv.appendChild(suggestionItem);
        });

        // Popup ki height ko adjust karne ka logic
        const suggestionCount = animeList.length;
        const baseHeight = 350; // Popup ki default height (CSS se)
        const itemHeight = 70;  // Har suggestion item ki height (approx.)
        const padding = 20;     // Overall padding

        // Calculate the required height
        const newHeight = baseHeight + (suggestionCount * itemHeight);
        document.body.style.height = `${newHeight}px`;
    }

    searchButton.addEventListener('click', () => {
        searchAnime();
        suggestionsDiv.style.display = 'none'; // Hide suggestions on search button click
    });

    async function searchAnime() {
    const query = animeNameInput.value.trim();
    if (!query) {
        resultsDiv.innerHTML = '<p>Please enter an anime name.</p>';
        return;
    }

    resultsDiv.innerHTML = '<p>Searching...</p>';
    
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            // Jikan API se mile results ko filter karte hain
            const filteredAnime = data.data.filter(anime => {
                const titleEnglish = (anime.title_english || '').toLowerCase();
                const titleRomaji = (anime.title_romaji || '').toLowerCase();
                const title = (anime.title || '').toLowerCase();
                const searchQuery = query.toLowerCase();

                // Check karte hain ki search query title me hai ya nahi
                return titleEnglish.includes(searchQuery) ||
                       titleRomaji.includes(searchQuery) ||
                       title.includes(searchQuery);
            });

            if (filteredAnime.length > 0) {
                displayResults(filteredAnime);
            } else {
                resultsDiv.innerHTML = '<p>No matching anime found. Please try a different name.</p>';
            }
        } else {
            resultsDiv.innerHTML = '<p>No anime found. Please try a different name.</p>';
        }
    } catch (error) {
        resultsDiv.innerHTML = `<p>An error occurred: ${error.message}</p>`;
    }
}

    function displayResults(animeList) {
    let allResultsHtml = '';

    animeList.forEach(anime => {
        const title = anime.title_english || anime.title || 'Unknown Title';
        const synopsis = anime.synopsis || 'No synopsis available.';
        const rating = anime.score || 'N/A';
        const episodes = anime.episodes || 'N/A';
        const imageUrl = anime.images.jpg.image_url || '';
        const genres = anime.genres.map(genre => genre.name).join(', ') || 'N/A';
        const aired = anime.aired.string || 'N/A';
        const status = anime.status || 'N/A';
        const studio = anime.studios.map(studio => studio.name).join(', ') || 'N/A';
        const runtime = anime.duration || 'N/A';

        const animeHtml = `
            <div class="result-card">
                <h2>${title}</h2>
                <img src="${imageUrl}" alt="${title}">
                <p><strong>Episodes:</strong> ${episodes}</p>
                <p><strong>Rating:</strong> ${rating}</p>
                <p><strong>Status:</strong> ${status}</p>
                <p><strong>Aired:</strong> ${aired}</p>
                <p><strong>Runtime:</strong> ${runtime}</p>
                <p><strong>Genres:</strong> ${genres}</p>
                <p><strong>Studio:</strong> ${studio}</p>
                <p><strong>Synopsis:</strong> ${synopsis.substring(0, 250)}...</p>
                
                <div class="link-section">
                    ${addLinks(title)}
                </div>
            </div>
        `;
        allResultsHtml += animeHtml;
    });

    resultsDiv.innerHTML = allResultsHtml;
}

    function addLinks(animeTitle) {
    return `
        <div class="link-section">
            <h4>Find Streaming & Merchandise Links</h4>
            <p>To find legal streaming and merchandise links for this anime, please visit our website:</p>
            <a href="https://neyabansari443-max.github.io/anime-links/" target="_blank" class="main-site-btn">Visit Anime-Finder Links</a>
        </div>
    `;


    return `
        <h4>Hindi Dubbed</h4>
        ${hindiLinks}
        <h4>English Subbed/Dubbed</h4>
        ${englishLinks}
    `;
}
});
