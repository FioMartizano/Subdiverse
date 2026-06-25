import GuestNavbar from './components/GuestNavbar';
import Footer from './components/Footer';
import GuestHomePage from './pages/GuestHomePage';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <GuestNavbar />

      <main className="flex-grow">
        <GuestHomePage />
      </main>

      <Footer />
    </div>
  );
}

export default App;