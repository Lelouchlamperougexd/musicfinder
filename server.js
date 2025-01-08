require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const SpotifyWebApi = require('spotify-web-api-node');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Spotify API setup
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

spotifyApi.clientCredentialsGrant().then(
    (data) => spotifyApi.setAccessToken(data.body['access_token']),
    (err) => console.error('Error retrieving access token', err)
);

// Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Search endpoint
app.post('/search', (req, res) => {
    const query = req.body.query;

    spotifyApi.searchTracks(query)
        .then((data) => {
            const results = data.body.tracks.items.map((track) => ({
                name: track.name,
                artists: track.artists.map((artist) => artist.name).join(', '),
                album: track.album.name,
                link: track.external_urls.spotify,
                image: track.album.images[0]?.url || '',
                releaseDate: track.album.release_date,
            }));

            res.json({ results });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch tracks' });
        });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
