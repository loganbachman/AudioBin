import Album from '../models/Album.js'
import { getAlbumById } from './spotifyService.js'

class AlbumService {
    // Add album to library
    async addAlbum(spotifyId, rating, review = '') {
        try {
            // Check if album already exists
            const existingAlbum = await Album.findOne({ spotifyId })
            if (existingAlbum) {
                throw new Error('Album already exists in your library')
            }

            // Get album details from Spotify
            const spotifyAlbum = await getAlbumById(spotifyId)

            // Create new album with user data
            const album = new Album({
                ...spotifyAlbum,
                rating,
                review
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
    async getAllAlbums(sortBy = 'dateAdded', order = 'desc') {
        try {
            const sortOrder = order === 'desc' ? -1 : 1

            const albums = await Album.find().sort({ [sortBy]: sortOrder })
            return albums
        } catch (err) {
            console.error('Error getting albums:', err)
            throw err
        }
    }

    // Get album by ID
    async getAlbumBySpotifyId(spotifyId) {
        try {
            const album = await Album.findOne({ spotifyId })
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
    async updateAlbum(spotifyId, updates) {
        try {
            const album = await Album.findOne({ spotifyId })
            if (!album) {
                throw new Error('Album not found in library')
            }

            if (updates.rating !== undefined) {
                album.rating = updates.rating
            }
            if (updates.review !== undefined) {
                album.review = updates.review
            }

            await album.save()
            return album
        } catch (err) {
            console.error('Error updating album:', err)
            throw err
        }
    }

    // Delete album from library
    async deleteAlbum(spotifyId) {
        try {
            const album = await Album.findOneAndDelete({ spotifyId })
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
    async searchLibrary(query) {
        try {
            const albums = await Album.find({
                $text: { $search: query }
            })
            return albums
        } catch (err) {
            console.error('Error searching library:', err)
            throw err
        }
    }

    // Get albums by rating range
    async getAlbumsByRating(minRating, maxRating = 10) {
        try {
            const albums = await Album.find({
                rating: { $gte: minRating, $lte: maxRating }
            }).sort({ rating: -1 })
            return albums
        } catch (err) {
            console.error('Error getting albums by rating:', err)
            throw err
        }
    }

    // Get statistics
    async getLibraryStats() {
        try {
            const totalAlbums = await Album.countDocuments()
            // user's mean rating of albums
            const avgRating = await Album.aggregate([
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' }
                    }
                }
            ])
            // user's top 10 rated albums
            const topRated = await Album.find()
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
