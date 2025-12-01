import './styling/App.css'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import AlbumForm from "./components/AlbumForm.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ViewAlbum from "./pages/ViewAlbum.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function App() {
  return (
    <div>
        <Router>
            <Routes>
                <Route path="/login" element={<Login />}/>
                <Route path="/register" element={<Register />}/>
                <Route path="/" element={<Dashboard />}/>
                <Route path="/add-album" element={<AlbumForm />}/>
                <Route path="/album/:spotifyId" element={<ViewAlbum />}/>
            </Routes>
        </Router>
    </div>
  )
}

export default App
