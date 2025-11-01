import express from 'express'
import albumService from '../services/albumService.js'
import { searchAlbums } from '../services/spotifyService.js'

const router = express.Router()

// Search Spotify for albums
router.get('/search', async (req, res, next) => {
    try {
        const { query, limit } = req.query
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' })
        }
        const albums = await searchAlbums(query, parseInt(limit) || 20)
        res.json(albums)
    } catch (err) {
        next(err)
    }
})

// Get all the albums in user's library
router.get('/library', async (req, res, next) => {
    try {
        const { sortBy, order } = req.query
        const albums = await albumService.getAllAlbums(sortBy, order)
        res.json(albums)
    } catch (err) {
        next(err)
    }
})

// Get library statistics
router.get('/library/stats', async (req, res, next) => {
    try {
        const stats = await albumService.getLibraryStats()
        res.json(stats)
    } catch (err) {
        next(err)
    }
})

// Search albums in library
router.get('/library/search', async (req, res, next) => {
    try {
        const { query } = req.query
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' })
        }
        const albums = await albumService.searchLibrary(query)
        res.json(albums)
    } catch (err) {
        next(err)
    }
})

// Get albums by rating range
router.get('/library/rating', async (req, res, next) => {
    try {
        const { min, max } = req.query
        if (!min) {
            return res.status(400).json({ error: 'Minimum rating is required' })
        }
        const albums = await albumService.getAlbumsByRating(
            parseFloat(min),
            max ? parseFloat(max) : 10
        )
        res.json(albums)
    } catch (err) {
        next(err)
    }
})

// Get specific album from library
router.get('/library/:spotifyId', async (req, res, next) => {
    try {
        const album = await albumService.getAlbumBySpotifyId(req.params.spotifyId)
        res.json(album)
    } catch (err) {
        next(err)
    }
})

// Add album to library
router.post('/library', async (req, res, next) => {
    try {
        const { spotifyId, rating, review } = req.body

        if (!spotifyId) {
            return res.status(400).json({ error: 'Spotify ID is required' })
        }
        if (rating === undefined || rating === null) {
            return res.status(400).json({ error: 'Rating is required' })
        }
        if (rating < 0 || rating > 10) {
            return res.status(400).json({ error: 'Rating must be between 0 and 10' })
        }

        const album = await albumService.addAlbum(spotifyId, rating, review)
        res.status(201).json(album)
    } catch (err) {
        next(err)
    }
})

// Update album in library
router.patch('/library/:spotifyId', async (req, res, next) => {
    try {
        const { rating, review } = req.body

        const updates = {}
        if (rating !== undefined) {
            if (rating < 0 || rating > 10) {
                return res.status(400).json({ error: 'Rating must be between 0 and 10' })
            }
            updates.rating = rating
        }
        if (review !== undefined) {
            updates.review = review
        }

        const album = await albumService.updateAlbum(req.params.spotifyId, updates)
        res.json(album)
    } catch (err) {
        next(err)
    }
})

// Delete album from library
router.delete('/library/:spotifyId', async (req, res, next) => {
    try {
        const result = await albumService.deleteAlbum(req.params.spotifyId)
        res.json(result)
    } catch (err) {
        next(err)
    }
})

export default router
