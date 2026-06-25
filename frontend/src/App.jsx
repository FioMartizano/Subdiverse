/*COMPONENTS*/
import Footer from './components/Footer';
import GuestNavbar from './components/GuestNavbar';

/*GUEST PAGE*/
import GuestHomePage from './pages/Guest/GuestHomePage';


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