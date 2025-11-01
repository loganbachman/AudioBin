import mongoose from 'mongoose'

const albumSchema = new mongoose.Schema({
    // Spotify data
    spotifyId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    releaseDate: {
        type: String
    },
    imageUrl: {
        type: String
    },
    totalTracks: {
        type: Number
    },
    albumType: {
        type: String
    },
    spotifyUrl: {
        type: String
    },
    genres: [String],
    label: String,
    tracks: [{
        name: String,
        duration_ms: Number,
        track_number: Number
    }],

    // Fields defined by user
    rating: {
        type: Number,
        min: 0,
        max: 10,
        required: true,
        validate: {
            validator: function(v) {
                return v >= 0 && v <= 10
            },
            message: props => `${props.value} is not a valid rating! Rating must be between 0 and 10.`
        }
    },
    review: {
        type: String,
        maxlength: 1000
    },

    // Metadata
    dateAdded: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

// Update last-modified when saving
albumSchema.pre('save', function(next) {
    this.lastModified = Date.now()
    next()
})

// Create indexes for better query performance
albumSchema.index({ name: 'text', artist: 'text' })
albumSchema.index({ rating: -1 })
albumSchema.index({ dateAdded: -1 })

export default mongoose.model('Album', albumSchema)
