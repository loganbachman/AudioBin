import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../config/api';
import '../styling/Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const { getUser, logout } = useAuth();
    const [albums, setAlbums] = useState([]);
    const [filteredAlbums, setFilteredAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('dateAdded');
    const [sortOrder, setSortOrder] = useState('desc');
    const [listenedFilter, setListenedFilter] = useState('all');
    const [favoritesFilter, setFavoritesFilter] = useState('all');
    const [favorites, setFavorites] = useState([]);
    const [dailyChallenge, setDailyChallenge] = useState(null);
    const [challengeLoading, setChallengeLoading] = useState(false);

    // when searching albums or filtering by favorites, filter results accordingly
    useEffect(() => {
        let filtered = albums;

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(album =>
                album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                album.artist.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply favorites filter
        if (favoritesFilter === 'favorites') {
            filtered = filtered.filter(album => favorites.includes(album.spotifyId));
        } else if (favoritesFilter === 'notFavorites') {
            filtered = filtered.filter(album => !favorites.includes(album.spotifyId));
        }

        setFilteredAlbums(filtered);
    }, [searchQuery, albums, favoritesFilter, favorites]);

    // fetch favorites
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const user = getUser();
                if (!user || !user.userId) return;

                const response = await fetch(`${API_BASE_URL}/favorites?userId=${user.userId}`);
                const data = await response.json();

                if (data.success && data.favorites) {
                    setFavorites(data.favorites);
                }
            } catch (err) {
                console.error('Failed to fetch favorites', err);
            }
        };

        fetchFavorites();
    }, []);

    // display album library
    useEffect(() => {
        const fetchAlbums = async () => {
            setLoading(true);
            try {
                // Get user
                const user = getUser();
                if (!user || !user.userId) {
                    navigate('/login');
                    return;
                }

                // display based on if listened to, not listened, or all albums
                const params = new URLSearchParams({
                    userId: user.userId,
                    sortBy,
                    order: sortOrder,
                    ...(listenedFilter !== 'all' && { listened: listenedFilter === 'listened' })
                });
                const response = await fetch(`${API_BASE_URL}/albums/library?${params}`);
                const data = await response.json();
                setAlbums(data);
                setFilteredAlbums(data);
            } catch (err) {
                console.error('Failed to fetch albums', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, [sortBy, sortOrder, listenedFilter, navigate]);

    // navigate to view specific album
    const handleAlbumClick = (spotifyId) => {
        navigate(`/album/${spotifyId}`);
    };

    // navigate to add album page
    const handleAddAlbum = () => {
        navigate('/add-album');
    };

    // handle logout
    const handleLogout = () => {
        logout();
    };

    // get daily challenge album
    const getDailyChallenge = async () => {
        setChallengeLoading(true);
        try {
            const user = getUser();
            if (!user || !user.userId) return;

            // Get unlistened albums
            const params = new URLSearchParams({
                userId: user.userId,
                sortBy: 'dateAdded',
                order: 'desc',
                listened: false
            });
            const response = await fetch(`${API_BASE_URL}/albums/library?${params}`);
            const unlistenedAlbums = await response.json();

            if (unlistenedAlbums.length === 0) {
                setDailyChallenge(null);
                setChallengeLoading(false);
                return;
            }

            // Get random number from microservice
            const randomResponse = await fetch(`${API_BASE_URL}/random`);
            const randomData = await randomResponse.json();

            if (randomData.success) {
                // Scale random number (1-10000) to album array index
                const randomIndex = randomData.number % unlistenedAlbums.length;
                setDailyChallenge(unlistenedAlbums[randomIndex]);
            }
        } catch (err) {
            console.error('Failed to fetch daily challenge:', err);
        } finally {
            setChallengeLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="header-left">
                        <h1 className="app-title">AudioBin</h1>
                        <h3 className="app-description">Track & Rate your albums with AudioBin. Click Add Album to get started!</h3>
                    </div>
                    <div className="header-buttons">
                        <button className="add-album-btn" onClick={handleAddAlbum}>
                            + Add Album
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>

                {/* Daily Challenge Section */}
                <div className="daily-challenge-section">
                    <div className="daily-challenge-header">
                        <h2>Daily Challenge</h2>
                        <button
                            className="challenge-btn"
                            onClick={getDailyChallenge}
                            disabled={challengeLoading}
                        >
                            {challengeLoading ? 'Loading...' : 'Get Random Album'}
                        </button>
                    </div>

                    {dailyChallenge && (
                        <div className="challenge-card" onClick={() => handleAlbumClick(dailyChallenge.spotifyId)}>
                            <div className="challenge-image">
                                {dailyChallenge.imageUrl ? (
                                    <img src={dailyChallenge.imageUrl} alt={dailyChallenge.name} />
                                ) : (
                                    <div className="challenge-placeholder">No Image</div>
                                )}
                            </div>
                            <div className="challenge-info">
                                <h3>{dailyChallenge.name}</h3>
                                <p className="challenge-artist">{dailyChallenge.artist}</p>
                                <p className="challenge-label">Try listening to this album today!</p>
                            </div>
                        </div>
                    )}

                    {!dailyChallenge && !challengeLoading && (
                        <p className="no-challenge">Click the button to get your daily listening challenge!</p>
                    )}
                </div>

                <div className="controls">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search albums..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <div className="filters">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            <option value="dateAdded">Date Added</option>
                            <option value="rating">Rating</option>
                            <option value="name">Album Name</option>
                            <option value="artist">Artist</option>
                        </select>

                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="sort-select"
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>

                        <select
                            value={listenedFilter}
                            onChange={(e) => setListenedFilter(e.target.value)}
                            className="sort-select"
                        >
                            <option value="all">All Albums</option>
                            <option value="listened">Listened</option>
                            <option value="notListened">Not Listened</option>
                        </select>

                        <select
                            value={favoritesFilter}
                            onChange={(e) => setFavoritesFilter(e.target.value)}
                            className="sort-select"
                        >
                            <option value="all">All Albums</option>
                            <option value="favorites">Favorites Only</option>
                            <option value="notFavorites">Not Favorited</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p className="loading-text">Loading albums...</p>
                ) : filteredAlbums.length === 0 ? (
                    <p className="no-albums-text">No albums found. Add your first album!</p>
                ) : (

                    <div className="albums-grid">
                        {filteredAlbums.map(album => (
                            <div
                                key={album.spotifyId}
                                className="album-card"
                                onClick={() => handleAlbumClick(album.spotifyId)}
                            >
                                <div className="album-image-container">
                                    {album.imageUrl ? (
                                        <img
                                            src={album.imageUrl}
                                            alt={album.name}
                                            className="album-image"
                                        />
                                    ) : (
                                        <div className="album-image-placeholder">No Image</div>
                                    )}
                                    {album.listened && (
                                        <div className="listened-badge">✓</div>
                                    )}
                                    {favorites.includes(album.spotifyId) && (
                                        <div className="favorite-badge">★</div>
                                    )}
                                </div>
                                <div className="album-info">
                                    <h3 className="album-name">{album.name}</h3>
                                    <p className="album-artist">{album.artist}</p>
                                    {album.rating > 0 && (
                                        <div className="rating-display">
                                            <span className="rating-label">Rating</span>
                                            <span className="rating-value">
                                            {album.rating}/10
                                        </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;