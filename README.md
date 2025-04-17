# Community Mindshare Converter

A simple web tool to format and download community mindshare data from the Kaito API as CSV.

![Community Mindshare Converter Screenshot](https://via.placeholder.com/800x450.png?text=Community+Mindshare+Converter)

## About

This tool helps non-technical users easily convert community mindshare API data into formatted, readable tables and downloadable CSV files. Designed to work with data from endpoints like:

```
https://api.kaito.ai/api/v1/community_mindshare?ticker=MITOSIS&window=7d
```

## Features

- **Multiple Input Methods**: Enter an API URL or paste JSON data directly
- **User-Friendly Interface**: Simple, intuitive design for non-technical users
- **Visual Data Display**: View data in a formatted table with visual representation of mindshare percentages
- **CSV Export**: Download a clean CSV file with all the data for further analysis
- **Demo Mode**: Try the tool with sample data to see how it works

## How to Use

### Option 1: API URL

1. Enter the API URL in the input field
2. Click "Fetch Data"
3. If successful, view the formatted data and download as CSV
4. If unsuccessful due to CORS restrictions, use Option 2

### Option 2: JSON Data

1. Open the API URL in a new browser tab
2. Copy the entire JSON response
3. Switch to the "JSON Data" tab
4. Paste the JSON into the textarea
5. Click "Process Data"
6. View the formatted data and download as CSV

### Option 3: Demo

1. Click the "Demo" tab
2. Click "Load Demo Data" to see how the tool works with sample data

## Data Format

The tool expects JSON data in the following format:

```json
{
  "community_mindshare": {
    "top_100_yappers": [
      {
        "user_id": "1234567890",
        "rank": "1",
        "username": "Username",
        "mindshare": 0.123456789,
        "tweet_counts": 123,
        "total_impressions": 10000,
        "total_retweets": 100,
        "total_quote_tweets": 50,
        "total_likes": 500,
        "total_bookmarks": 30,
        "total_community_engagements": 80
      },
      // More users...
    ]
  }
}
```

## Live Demo

Visit the live demo at:
[https://community-mindshare-converter.vercel.app/](https://community-mindshare-converter.vercel.app/)

## Development

This is a simple static web application using HTML, CSS, and JavaScript.

To run locally:
1. Clone the repository
2. Open `index.html` in a web browser

## License

MIT
