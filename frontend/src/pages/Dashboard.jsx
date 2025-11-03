import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styling/Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const [albums, setAlbums] = useState([]);
    const [filteredAlbums, setFilteredAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('dateAdded');
    const [sortOrder, setSortOrder] = useState('desc');
    const [listenedFilter, setListenedFilter] = useState('all');

    // when searching albums, filter results accordingly
    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = albums.filter(album =>
                album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                album.artist.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredAlbums(filtered);
        } else {
            setFilteredAlbums(albums);
        }
    }, [searchQuery, albums]);

    // display album library
    useEffect(() => {
        const fetchAlbums = async () => {
            setLoading(true);
            try {
                // display based on if listened to, not listened, or all albums
                const params = new URLSearchParams({
                    sortBy,
                    order: sortOrder,
                    ...(listenedFilter !== 'all' && { listened: listenedFilter === 'listened' })
                });
                const response = await fetch(`http://localhost:3000/albums/library?${params}`);
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
    }, [sortBy, sortOrder, listenedFilter]);

    // navigate to view specific album
    const handleAlbumClick = (spotifyId) => {
        navigate(`/album/${spotifyId}`);
    };

    // navigate to add album page
    const handleAddAlbum = () => {
        navigate('/add-album');
    };

    return (
        <div className="dashboard">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1 className="app-title">AudioBin</h1>
                    <h3 className="app-description">Track & Rate your albums with AudioBin. Click Add Album to get started!</h3>
                    <button className="add-album-btn" onClick={handleAddAlbum}>
                        + Add Album
                    </button>
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