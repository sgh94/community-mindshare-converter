document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const apiForm = document.getElementById('apiForm');
    const apiUrlInput = document.getElementById('apiUrl');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const resultsTable = document.getElementById('resultsTable');
    const errorMessage = document.getElementById('errorMessage');
    const downloadButton = document.getElementById('downloadCsv');
    
    // Store the data globally so we can use it for the CSV download
    let contributorsData = [];
    
    // Handle form submission
    apiForm.addEventListener('submit', function(e) {
        e.preventDefault();
        fetchData(apiUrlInput.value.trim());
    });
    
    // Handle download CSV button
    downloadButton.addEventListener('click', function() {
        if (contributorsData.length > 0) {
            downloadCsv();
        }
    });
    
    // Fetch data from API
    async function fetchData(url) {
        // Show loading state
        loadingDiv.classList.remove('d-none');
        resultsDiv.classList.add('d-none');
        errorMessage.classList.add('d-none');
        
        try {
            // Add CORS proxy to handle cross-origin requests
            // Note: In a production environment, you would handle CORS properly on your server
            const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const response = await fetch(corsProxyUrl + url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Process data
            if (data && data.community_mindshare && data.community_mindshare.top_100_yappers) {
                contributorsData = processData(data.community_mindshare.top_100_yappers);
                displayResults(contributorsData);
                resultsDiv.classList.remove('d-none');
            } else {
                throw new Error('Invalid data format');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            errorMessage.textContent = `Error: ${error.message}. Please check the URL and try again.`;
            errorMessage.classList.remove('d-none');
        } finally {
            loadingDiv.classList.add('d-none');
        }
    }
    
    // Process the data into a cleaner format
    function processData(yappers) {
        return yappers.map(yapper => {
            return {
                rank: yapper.rank,
                username: yapper.username,
                mindshare: (parseFloat(yapper.mindshare) * 100).toFixed(4) + '%',
                mindshareRaw: parseFloat(yapper.mindshare),
                tweetCount: yapper.tweet_counts,
                impressions: yapper.total_impressions.toLocaleString(),
                impressionsRaw: yapper.total_impressions,
                engagements: (
                    (yapper.total_retweets || 0) + 
                    (yapper.total_quote_tweets || 0) + 
                    (yapper.total_likes || 0) + 
                    (yapper.total_bookmarks || 0) + 
                    (yapper.total_community_engagements || 0)
                ).toLocaleString(),
                engagementsRaw: (
                    (yapper.total_retweets || 0) + 
                    (yapper.total_quote_tweets || 0) + 
                    (yapper.total_likes || 0) + 
                    (yapper.total_bookmarks || 0) + 
                    (yapper.total_community_engagements || 0)
                )
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
    
    // Optional: Add a demo function to show sample data without needing API
    window.loadDemoData = function() {
        // Sample data structure for testing purposes
        const sampleData = {
            community_mindshare: {
                top_100_yappers: [
                    // Sample data would go here
                ]
            }
        };
        
        contributorsData = processData(sampleData.community_mindshare.top_100_yappers);
        displayResults(contributorsData);
        resultsDiv.classList.remove('d-none');
    };
});
