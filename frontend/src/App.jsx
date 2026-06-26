
import { Routes, Route } from 'react-router-dom';  

import Footer from './components/Footer';
import GuestNavbar from './components/GuestNavbar';
/*GUEST PAGE*/
import GuestHomePage from './pages/Guest/GuestHomePage';
import AboutUs from './pages/Guest/AboutUs';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <GuestNavbar />


      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<GuestHomePage />} />
          <Route path="/about" element={<AboutUs />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;