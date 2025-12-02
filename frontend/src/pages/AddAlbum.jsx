import {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import '../styling/AlbumForm.css'

function AddAlbum() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedAlbum, setSelectedAlbum] = useState(null)
    const [review, setReview] = useState('')
    const [rating, setRating] = useState(0)
    const [listened, setListened] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // use debouncing for search results
        const handleSearch = setTimeout(async () => {
            if (!searchQuery.trim()) return
            if (searchQuery) {
                setLoading(true)
                try {
                    const response = await fetch(`http://localhost:3000/albums/search?query=${encodeURIComponent(searchQuery)}`)

                    const data = await response.json()
                    console.log('Search results received:', data)
                    setSearchResults(data)
                } catch (err) {
                    console.error('Failed to fetch spotify search', err)
                    setSearchResults([])
                } finally {
                    setLoading(false)
                }
            } else {
                setSearchResults([])
            }
        }, 500)
        return () => clearTimeout(handleSearch)
    }, [searchQuery])

    // handle submit to add album to database
    const handleAddAlbum = async (event) => {
        event.preventDefault()

        if (!selectedAlbum) {
            console.error('No album selected')
            return
        }

        // Get user from localStorage
        const user = JSON.parse(localStorage.getItem('user'))
        if (!user || !user.userId) {
            console.error('User not logged in')
            navigate('/login')
            return
        }

        setLoading(true)
        try {
            const response = await fetch('http://localhost:3000/albums/library', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.userId,
                    spotifyId: selectedAlbum.spotifyId,
                    rating: listened ? rating: 0,
                    review: listened ? review : '',
                    listened: listened
                })
            })

            const data = await response.json()

            // reset the form
            setSelectedAlbum(null)
            setSearchQuery('')
            setSearchResults([])
            setReview('')
            setRating(0)
            setListened(false)

            // navigate back to the dashboard
            navigate('/')
            return data
        } catch(err) {
            console.error('Failed to add album', err)
        } finally {
            setLoading(false)
        }
    }

    const handleListenChange = () => {
        setListened(!listened)
        if (listened) {
            setRating(0)
            setReview('')
        }
    }

    const handleGoToDashboard = () => {
        navigate('/')
    }


    return (
        <div className="add-album">
            <div className="add-album-container">
                <div className="form-header">
                    <h1 className="app-title">AudioBin</h1>
                    <button type="button" className="dashboard-nav-btn" onClick={handleGoToDashboard}>
                        Dashboard
                    </button>
                </div>
                <form onSubmit={handleAddAlbum} className="add-album-form">
                    <input
                        name="Search for Albums"
                        className="search-bar"
                        type="text"
                        size="50"
                        placeholder="Search for albums..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {loading && <p className="loading-text">Searching...</p>}
                    {searchResults.length > 0 && (
                        <ul className="search-results">
                            {searchResults.map(album => (
                                <li
                                    key={album.spotifyId}
                                    onClick={() => setSelectedAlbum(album)}
                                    className={selectedAlbum?.spotifyId === album.spotifyId
                                        ? 'selected-album' : ''}
                                >
                                    {album.name} - {album.artist}
                                </li>
                            ))}
                        </ul>
                    )}
                    {selectedAlbum && (
                        <p className="selected-text">Selected: {selectedAlbum.name}</p>
                    )}
                    <div className="checkbox-container">
                        <input
                            name="listened"
                            type="checkbox"
                            id="listened-checkbox"
                            checked={listened}
                            onChange={handleListenChange}
                        />
                        <label htmlFor="listened-checkbox">I've listened to this album</label>
                    </div>
                    <input
                        name="rating"
                        type="number"
                        step="1"
                        min="0"
                        max="10"
                        placeholder="Enter rating (1 - 10)"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        disabled={!listened}
                        className={!listened ? 'disabled-input' : ''}
                    />
                    <textarea
                        className="review-box"
                        name="review"
                        rows="4"
                        placeholder="Enter your album review"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        disabled={!listened}
                    />
                    <button type="submit" disabled={!selectedAlbum || loading}>
                        Add Album
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AddAlbum