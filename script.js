document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const apiForm = document.getElementById('apiForm');
    const jsonForm = document.getElementById('jsonForm');
    const apiUrlInput = document.getElementById('apiUrl');
    const jsonDataInput = document.getElementById('jsonData');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const resultsTable = document.getElementById('resultsTable');
    const errorMessage = document.getElementById('errorMessage');
    const downloadButton = document.getElementById('downloadCsv');
    
    // Store the data globally so we can use it for the CSV download
    let contributorsData = [];
    
    // Handle API URL form submission
    apiForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const url = apiUrlInput.value.trim();
        if (!url) {
            showError("Please enter a valid URL");
            return;
        }
        fetchData(url);
    });
    
    // Handle JSON form submission
    jsonForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const jsonText = jsonDataInput.value.trim();
        if (!jsonText) {
            showError("Please enter JSON data");
            return;
        }
        
        try {
            const jsonData = JSON.parse(jsonText);
            processJsonData(jsonData);
        } catch (error) {
            showError(`Invalid JSON format: ${error.message}`);
        }
    });
    
    // Handle download CSV button
    downloadButton.addEventListener('click', function() {
        if (contributorsData.length > 0) {
            downloadCsv();
        }
    });
    
    // Process direct JSON input
    function processJsonData(data) {
        try {
            showLoading();
            
            if (data && data.community_mindshare && data.community_mindshare.top_100_yappers) {
                contributorsData = processData(data.community_mindshare.top_100_yappers);
                displayResults(contributorsData);
                showResults();
            } else {
                throw new Error('Invalid data format. Make sure the JSON contains a "community_mindshare" object with a "top_100_yappers" array.');
            }
        } catch (error) {
            showError(`Error processing data: ${error.message}`);
        } finally {
            hideLoading();
        }
    }
    
    // Fetch data from API
    async function fetchData(url) {
        showLoading();
        
        try {
            // Try direct fetch first (will work if CORS is properly configured)
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    processJsonData(data);
                    return;
                }
            } catch (directFetchError) {
                console.warn('Direct fetch failed, trying alternative methods', directFetchError);
            }
            
            // If direct fetch fails, show a message explaining API CORS issues
            showError(`
                <strong>Unable to fetch data directly from the API.</strong> Due to browser security restrictions (CORS), 
                you may need to copy and paste the API response directly. 
                
                <br><br>
                <strong>To do this:</strong>
                <ol>
                    <li>Open the API URL in a new browser tab</li>
                    <li>Copy the entire JSON response</li>
                    <li>Switch to the "JSON Data" tab</li>
                    <li>Paste the copied data and click "Process Data"</li>
                </ol>
                
                <br>
                <strong>Or for a quicker demo:</strong>
                <ul>
                    <li>Switch to the "Demo" tab and click "Load Demo Data"</li>
                </ul>
            `);
        } catch (error) {
            showError(`Error: ${error.message}. Please check the URL and try again.`);
        } finally {
            hideLoading();
        }
    }
    
    // UI Helper Functions
    function showLoading() {
        loadingDiv.classList.remove('d-none');
        resultsDiv.classList.add('d-none');
        errorMessage.classList.add('d-none');
    }
    
    function hideLoading() {
        loadingDiv.classList.add('d-none');
    }
    
    function showResults() {
        resultsDiv.classList.remove('d-none');
        errorMessage.classList.add('d-none');
    }
    
    function showError(message) {
        errorMessage.innerHTML = message;
        errorMessage.classList.remove('d-none');
        resultsDiv.classList.add('d-none');
    }
    
    // Process the data into a cleaner format
    function processData(yappers) {
        return yappers.map(yapper => {
            // Calculate engagements
            const engagementsRaw = (
                (yapper.total_retweets || 0) + 
                (yapper.total_quote_tweets || 0) + 
                (yapper.total_likes || 0) + 
                (yapper.total_bookmarks || 0) + 
                (yapper.total_smart_engagements || 0) +
                (yapper.total_community_engagements || 0)
            );
            
            return {
                rank: yapper.rank,
                username: yapper.username,
                mindshare: (parseFloat(yapper.mindshare) * 100).toFixed(4) + '%',
                mindshareRaw: parseFloat(yapper.mindshare),
                tweetCount: yapper.tweet_counts,
                impressions: yapper.total_impressions.toLocaleString(),
                impressionsRaw: yapper.total_impressions,
                engagements: engagementsRaw.toLocaleString(),
                engagementsRaw: engagementsRaw
            };
        });
    }
    
    // Display results in the table
    function displayResults(data) {
        // Clear existing table
        resultsTable.innerHTML = '';
        
        // Find the highest mindshare value for percentage bar
        const maxMindshare = Math.max(...data.map(item => item.mindshareRaw));
        
        // Add rows to table
        data.forEach(contributor => {
            const percentageWidth = (contributor.mindshareRaw / maxMindshare) * 100;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${contributor.rank}</td>
                <td>@${contributor.username}</td>
                <td>
                    <div>${contributor.mindshare}</div>
                    <div class="percentage-bar">
                        <div class="percentage-fill" style="width: ${percentageWidth}%"></div>
                    </div>
                </td>
                <td>${contributor.tweetCount}</td>
                <td>${contributor.impressions}</td>
                <td>${contributor.engagements}</td>
            `;
            resultsTable.appendChild(row);
        });
    }
    
    // Generate and download CSV file
    function downloadCsv() {
        // Create CSV content
        const csvHeaders = ['Rank', 'Username', 'Mindshare', 'Tweet Count', 'Impressions', 'Engagements'];
        const csvRows = contributorsData.map(contributor => [
            contributor.rank,
            '@' + contributor.username,
            contributor.mindshare,
            contributor.tweetCount,
            contributor.impressionsRaw, // Use raw numbers for CSV
            contributor.engagementsRaw  // Use raw numbers for CSV
        ]);
        
        // Add headers to the beginning
        csvRows.unshift(csvHeaders);
        
        // Convert to CSV string
        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Set download attributes
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        link.setAttribute('href', url);
        link.setAttribute('download', `community-mindshare-${timestamp}.csv`);
        link.style.visibility = 'hidden';
        
        // Add to document, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Add a demo function to load sample data
    window.loadDemoData = function() {
        const sampleData = {
            community_mindshare: {
                total_unique_yappers: 1361,
                total_unique_tweets: 5205,
                top_100_yappers: [
                    {
                        user_id: "1739107604931166208",
                        rank: "1",
                        username: "Crypto_Zh0u",
                        mindshare: 0.07295892783565214,
                        tweet_counts: 79,
                        total_impressions: 52400,
                        total_retweets: 139,
                        total_quote_tweets: 36,
                        total_likes: 1337,
                        total_bookmarks: 40,
                        total_community_engagements: 194
                    },
                    {
                        user_id: "951213360045023232",
                        rank: "2",
                        username: "CryptoUser",
                        mindshare: 0.05295892783565214,
                        tweet_counts: 45,
                        total_impressions: 35400,
                        total_retweets: 89,
                        total_quote_tweets: 26,
                        total_likes: 937,
                        total_bookmarks: 30,
                        total_community_engagements: 144
                    },
                    {
                        user_id: "951213360045023233",
                        rank: "3",
                        username: "TokenTrader",
                        mindshare: 0.02295892783565214,
                        tweet_counts: 30,
                        total_impressions: 15400,
                        total_retweets: 49,
                        total_quote_tweets: 16,
                        total_likes: 537,
                        total_bookmarks: 20,
                        total_community_engagements: 84
                    },
                    {
                        user_id: "951213360045023234",
                        rank: "4",
                        username: "Web3Developer",
                        mindshare: 0.01895892783565214,
                        tweet_counts: 25,
                        total_impressions: 10400,
                        total_retweets: 39,
                        total_quote_tweets: 12,
                        total_likes: 437,
                        total_bookmarks: 15,
                        total_community_engagements: 64
                    },
                    {
                        user_id: "951213360045023235",
                        rank: "5",
                        username: "BlockchainGuru",
                        mindshare: 0.01295892783565214,
                        tweet_counts: 20,
                        total_impressions: 8400,
                        total_retweets: 29,
                        total_quote_tweets: 10,
                        total_likes: 337,
                        total_bookmarks: 12,
                        total_community_engagements: 54
                    }
                ]
            }
        };
        
        processJsonData(sampleData);
    };
    
    // Add paste example button functionality
    window.pasteExampleJson = function() {
        jsonDataInput.value = `{
  "community_mindshare": {
    "total_unique_yappers": 1361,
    "total_unique_tweets": 5205,
    "top_100_yappers": [
      {
        "user_id": "1739107604931166208",
        "rank": "1",
        "username": "Crypto_Zh0u",
        "mindshare": 0.07295892783565214,
        "tweet_counts": 79,
        "total_impressions": 52400,
        "total_retweets": 139,
        "total_quote_tweets": 36,
        "total_likes": 1337,
        "total_bookmarks": 40,
        "total_community_engagements": 194
      },
      {
        "user_id": "951213360045023232",
        "rank": "2",
        "username": "CryptoUser",
        "mindshare": 0.05295892783565214,
        "tweet_counts": 45,
        "total_impressions": 35400,
        "total_retweets": 89,
        "total_quote_tweets": 26,
        "total_likes": 937,
        "total_bookmarks": 30,
        "total_community_engagements": 144
      }
    ]
  }
}`;
    };
});
