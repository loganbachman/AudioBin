import Album from '../models/Album.js'
import { getAlbumById } from './spotifyService.js'

class AlbumService {
    // Add album to library
    async addAlbum(userId, spotifyId, rating, review = '', listened = false) {
        try {
            // Check if album already exists for this user
            const existingAlbum = await Album.findOne({ userId, spotifyId })
            if (existingAlbum) {
                throw new Error('Album already exists in your library')
            }

            // Get album details from Spotify
            const spotifyAlbum = await getAlbumById(spotifyId)

            // Create new album with user data
            const album = new Album({
                userId,
                ...spotifyAlbum,
                rating,
                review,
                listened
            })
            // save album to database
            await album.save()
            return album
        } catch (err) {
            console.error('Error adding album:', err)
            throw err
        }
    }

    // Get all albums in library
    async getAllAlbums(userId, sortBy = 'dateAdded', order = 'desc', listenedFilter = null) {
        try {
            const sortOrder = order === 'desc' ? -1 : 1

            // Build filter object
            const filter = { userId }
            if (listenedFilter !== null && listenedFilter !== undefined) {
                filter.listened = listenedFilter === 'true' || listenedFilter === true
            }

            const albums = await Album.find(filter).sort({ [sortBy]: sortOrder })
            return albums
        } catch (err) {
            console.error('Error getting albums:', err)
            throw err
        }
    }

    // Get album by ID
    async getAlbumBySpotifyId(userId, spotifyId) {
        try {
            const album = await Album.findOne({ userId, spotifyId })
            if (!album) {
                throw new Error('Album not found in library')
            }
            return album
        } catch (err) {
            console.error('Error getting album:', err)
            throw err
        }
    }

    // Update album rating and review
    async updateAlbum(userId, spotifyId, updates) {
        try {
            const album = await Album.findOne({ userId, spotifyId })
            if (!album) {
                throw new Error('Album not found in library')
            }

            if (updates.rating !== undefined) {
                album.rating = updates.rating
            }
            if (updates.review !== undefined) {
                album.review = updates.review
            }
            if (updates.listened !== undefined) {
                album.listened = updates.listened
            }

            await album.save()
            return album
        } catch (err) {
            console.error('Error updating album:', err)
            throw err
        }
    }

    // Delete album from library
    async deleteAlbum(userId, spotifyId) {
        try {
            const album = await Album.findOneAndDelete({ userId, spotifyId })
            if (!album) {
                throw new Error('Album not found in library')
            }
            return { message: 'Album removed from library', album }
        } catch (err) {
            console.error('Error deleting album:', err)
            throw err
        }
    }

    // Search albums in library
    async searchLibrary(userId, query) {
        try {
            const albums = await Album.find({
                userId,
                $text: { $search: query }
            })
            return albums
        } catch (err) {
            console.error('Error searching library:', err)
            throw err
        }
    }

    // Get albums by rating range
    async getAlbumsByRating(userId, minRating, maxRating = 10) {
        try {
            const albums = await Album.find({
                userId,
                rating: { $gte: minRating, $lte: maxRating }
            }).sort({ rating: -1 })
            return albums
        } catch (err) {
            console.error('Error getting albums by rating:', err)
            throw err
        }
    }

    // Get statistics
    async getLibraryStats(userId) {
        try {
            const totalAlbums = await Album.countDocuments({ userId })
            // user's mean rating of albums
            const avgRating = await Album.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' }
                    }
                }
            ])
            // user's top 10 rated albums
            const topRated = await Album.find({ userId })
                .sort({ rating: -1 })
                .limit(10)

            return {
                totalAlbums,
                averageRating: avgRating[0]?.averageRating || 0,
                topRated
            }
        } catch (err) {
            console.error('Error getting library stats:', err)
            throw err
        }
    }
}

export default new AlbumService()
