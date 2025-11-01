import SpotifyWebApi from 'spotify-web-api-node'
import 'dotenv/config'

// Spotify api
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
})

// Get access token to access Spotify data
const getAccessToken = async () => {
    try {
        const data = await spotifyApi.clientCredentialsGrant()
        spotifyApi.setAccessToken(data.body['access_token'])
        console.log('Spotify access token obtained')
        return data.body['access_token']
    } catch(err) {
        console.error('Error getting Spotify access token', err)
        throw err
    }
}

// Refresh access token every hour
const refreshTokenPeriodically = () => {
    setInterval(async () => {
        await getAccessToken()
    }, 3500000) // Refresh every 58min
}

// Initialize on startup
getAccessToken().then(() => {
    refreshTokenPeriodically()
})

// Search for albums from SpotifyAPI
export const searchAlbums = async (query, limit = 20) => {
    try {
        const data = await spotifyApi.searchAlbums(query, { limit })
        return data.body.albums.items.map(album => ({
            spotifyId: album.id,
            name: album.name,
            artist: album.artists.map(artist => artist.name).join(', '),
            releaseDate: album.release_date,
            imageUrl: album.images[0]?.url || null,
            totalTracks: album.total_tracks,
            albumType: album.album_type,
            spotifyUrl: album.external_urls.spotify
        }))
    } catch(err) {
        console.error('Error searching albums', err)
        throw err
    }
}

// Get full album details from SpotifyAPI
export const getAlbumById = async (spotifyId) => {
    try {
        const data = await spotifyApi.getAlbum(spotifyId)
        const album = data.body
        return {
            spotifyId: album.id,
            name: album.name,
            artist: album.artists.map(artist => artist.name).join(', '),
            releaseDate: album.release_date,
            imageUrl: album.images[0]?.url || null,
            totalTracks: album.total_tracks,
            albumType: album.album_type,
            spotifyUrl: album.external_urls.spotify,
            genres: album.genres,
            label: album.label,
            tracks: album.tracks.items.map(track => ({
                name: track.name,
                duration_ms: track.duration_ms,
                track_number: track.track_number
            }))
        }
    } catch(err) {
        console.error('Error getting album details', err)
        throw err
    }
}

export default spotifyApi