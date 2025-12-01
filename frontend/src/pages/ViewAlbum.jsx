import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styling/Dashboard.css';

function ViewAlbum() {

    const { spotifyId } = useParams();
    const navigate = useNavigate();
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    // for update CRUD
    const [editData, setEditData] = useState({
        rating: 0,
        review: '',
        listened: false
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoritesLoading, setFavoritesLoading] = useState(false);

    // get viewed album from database
    useEffect(() => {
        const fetchAlbum = async () => {
            setLoading(true);
            try {
                // Get user from localStorage
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.userId) {
                    navigate('/login');
                    return;
                }

                const response = await fetch(`http://localhost:3000/albums/library/${spotifyId}?userId=${user.userId}`);
                const data = await response.json();
                setAlbum(data);
                setEditData({
                    rating: data.rating,
                    review: data.review,
                    listened: data.listened
                });
            } catch (err) {
                console.error('Failed to fetch album', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbum();
    }, [spotifyId, navigate]);

    // fetch favorite status
    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.userId) return;

                const response = await fetch(`http://localhost:3000/favorites?userId=${user.userId}`);
                const data = await response.json();

                if (data.success && data.favorites) {
                    setIsFavorited(data.favorites.includes(spotifyId));
                }
            } catch (err) {
                console.error('Failed to fetch favorite status', err);
            }
        };

        fetchFavoriteStatus();
    }, [spotifyId]);

    // handle updating your album
    const handleUpdate = async () => {
        try {
            // Get user from localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.userId) {
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:3000/albums/library/${spotifyId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...editData,
                    userId: user.userId
                })
            });
            const data = await response.json();
            setAlbum(data);
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update album', err);
        }
    };

    // delete album from database
    const handleDelete = async () => {
        try {
            // Get user from localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.userId) {
                navigate('/login');
                return;
            }

            await fetch(`http://localhost:3000/albums/library/${spotifyId}?userId=${user.userId}`, {
                method: 'DELETE'
            });
            navigate('/');
        } catch (err) {
            console.error('Failed to delete album', err);
        }
    };
    // toggle favorite status
    const handleToggleFavorite = async () => {
        setFavoritesLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.userId) {
                navigate('/login');
                return;
            }

            if (isFavorited) {
                // Remove from favorites
                await fetch(`http://localhost:3000/favorites/${spotifyId}?userId=${user.userId}`, {
                    method: 'DELETE'
                });
                setIsFavorited(false);
            } else {
                // Add to favorites
                await fetch('http://localhost:3000/favorites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: user.userId,
                        spotifyId: spotifyId
                    })
                });
                setIsFavorited(true);
            }
        } catch (err) {
            console.error('Failed to toggle favorite', err);
        } finally {
            setFavoritesLoading(false);
        }
    };

    // correctly format duration for song length (in tracklist)
    const formatDuration = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, '0')}`;
    };

    if (loading) {
        return <div className="loading-text">Loading album...</div>;
    }

    if (!album) {
        return <div className="error-text">Album not found</div>;
    }

    return (
        <div className="view-album">
            <div className="view-album-container">
                <div className="view-header">
                    <button className="back-btn" onClick={() => navigate('/')}>
                        ← Back
                    </button>
                    <h1 className="app-title">AudioBin</h1>
                    <button className="dashboard-nav-btn" onClick={() => navigate('/')}>
                        Dashboard
                    </button>
                </div>

                <div className="album-details">
                    <div className="album-main">
                        <div className="album-cover-section">
                            {album.imageUrl ? (
                                <img
                                    src={album.imageUrl}
                                    alt={album.name}
                                    className="album-cover"
                                />
                            ) : (
                                <div className="album-cover-placeholder">No Image</div>
                            )}
                            <div className="album-meta">
                                <h2>{album.name}</h2>
                                <p className="artist-name">{album.artist}</p>
                                <p className="release-date">{album.releaseDate}</p>
                                <p className="track-count">{album.totalTracks} tracks</p>
                            </div>
                        </div>

                        <div className="tracklist-section">
                            <h3>Tracklist</h3>
                            <ul className="tracklist">
                                {album.tracks?.map(track => (
                                    <li key={track.track_number} className="track-item">
                                        <span className="track-number">{track.track_number}.</span>
                                        <span className="track-name">{track.name}</span>
                                        <span className="track-duration">{formatDuration(track.duration_ms)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="album-sidebar">
                        {isEditing ? (
                            <div className="edit-section">
                                <h3>Edit Album</h3>
                                <div className="edit-form">
                                    <label>Rating</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={editData.rating}
                                        onChange={(e) => setEditData({...editData, rating: parseFloat(e.target.value)})}
                                    />

                                    <label>Review</label>
                                    <textarea
                                        rows="8"
                                        value={editData.review}
                                        onChange={(e) => setEditData({...editData, review: e.target.value})}
                                    />

                                    <div className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            id="edit-listened"
                                            checked={editData.listened}
                                            onChange={(e) => setEditData({...editData, listened: e.target.checked})}
                                        />
                                        <label htmlFor="edit-listened">Listened</label>
                                    </div>

                                    <div className="edit-buttons">
                                        <button onClick={handleUpdate} className="save-btn">Save</button>
                                        <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="info-section">
                                {album.rating > 0 && (
                                    <div className="rating-display">
                                        <span className="rating-label">Rating</span>
                                        <span className="rating-value">
                                            {album.rating}/10
                                        </span>
                                    </div>
                                )}

                                <div className="review-display">
                                    <h4>Review</h4>
                                    <p className="review-text">
                                        {album.review || 'No review yet'}
                                    </p>
                                </div>

                                <div className="status-display">
                                    <span className={album.listened ? 'status-listened' : 'status-not-listened'}>
                                        {album.listened ? '✓ Listened' : 'Not Listened'}
                                    </span>
                                </div>

                                <button onClick={() => setIsEditing(true)} className="edit-btn">
                                    Edit
                                </button>

                                <button
                                    onClick={handleToggleFavorite}
                                    disabled={favoritesLoading}
                                    className={isFavorited ? 'favorite-btn favorited' : 'favorite-btn'}
                                >
                                    {favoritesLoading ? 'Loading...' : (isFavorited ? '★ Favorited' : '☆ Add to Favorites')}
                                </button>

                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="delete-btn"
                                >
                                    Remove Album
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {showDeleteConfirm && (
                    <div className="delete-modal">
                        <div className="delete-modal-content">
                            <p>Are you sure you want to delete this album? This will be permanent.</p>
                            <div className="delete-modal-buttons">
                                <button onClick={handleDelete} className="confirm-delete-btn">Yes</button>
                                <button onClick={() => setShowDeleteConfirm(false)} className="cancel-delete-btn">No</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewAlbum;