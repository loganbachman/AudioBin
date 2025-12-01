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
        const { sortBy, order, listened, userId } = req.query
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' })
        }
        const albums = await albumService.getAllAlbums(parseInt(userId), sortBy, order, listened)
        res.json(albums)
    } catch (err) {
        next(err)
    }
})

// Get library statistics
router.get('/library/stats', async (req, res, next) => {
    try {
        const { userId } = req.query
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' })
        }
        const stats = await albumService.getLibraryStats(parseInt(userId))
        res.json(stats)
    } catch (err) {
        next(err)
    }
})

// Search albums in library
router.get('/library/search', async (req, res, next) => {
    try {
        const { query, userId } = req.query
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' })
        }
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' })
        }
        const albums = await albumService.searchLibrary(parseInt(userId), query)
        res.json(albums)
    } catch (err) {
        next(err)
    }
})

// Get albums by rating range
router.get('/library/rating', async (req, res, next) => {
    try {
        const { userId, min, max } = req.query
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' })
        }
        if (!min) {
            return res.status(400).json({ error: 'Minimum rating is required' })
        }
        const albums = await albumService.getAlbumsByRating(
            parseInt(userId),
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
        const { userId } = req.query
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' })
        }
        const album = await albumService.getAlbumBySpotifyId(parseInt(userId), req.params.spotifyId)
        res.json(album)
    } catch (err) {
        next(err)
    }
})

// Add album to library
router.post('/library', async (req, res, next) => {
    try {
        const { userId, spotifyId, rating, review, listened } = req.body

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' })
        }
        if (!spotifyId) {
            return res.status(400).json({ error: 'Spotify ID is required' })
        }
        if (rating === undefined || rating === null) {
            return res.status(400).json({ error: 'Rating is required' })
        }
        if (rating < 0 || rating > 10) {
            return res.status(400).json({ error: 'Rating must be between 0 and 10' })
        }

        const album = await albumService.addAlbum(parseInt(userId), spotifyId, rating, review, listened)
        res.status(201).json(album)
    } catch (err) {
        next(err)
    }
})

// Update album in library
router.patch('/library/:spotifyId', async (req, res, next) => {
    try {
        const { userId, rating, review, listened } = req.body

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' })
        }

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
        if (listened !== undefined) {
            updates.listened = listened
        }

        const album = await albumService.updateAlbum(parseInt(userId), req.params.spotifyId, updates)
        res.json(album)
    } catch (err) {
        next(err)
    }
})

// Delete album from library
router.delete('/library/:spotifyId', async (req, res, next) => {
    try {
        const { userId } = req.query
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' })
        }
        const result = await albumService.deleteAlbum(parseInt(userId), req.params.spotifyId)
        res.json(result)
    } catch (err) {
        next(err)
    }
})

export default router
