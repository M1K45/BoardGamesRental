import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import './footer.css';
import '../App.css';

let mapInstance = null; // Przechowywanie instancji mapy

const FooterWithMap = () => {
  useEffect(() => {
    // Sprawdzenie, czy mapa już istnieje
    if (!mapInstance) {
      // Inicjalizacja mapy
      mapInstance = L.map('map').setView([51.10879, 17.06043], 13);

      // Dodanie warstwy OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstance);

      // Stworzenie czerwonej pinezki
      const redMarker = L.AwesomeMarkers.icon({
        icon: 'fa-map-marker', // Klasyczna ikona mapy
        markerColor: 'red', // Kolor markera
        prefix: 'fa', // Użycie ikon Font Awesome
      });

      // Dodanie markera do mapy
      L.marker([51.10879, 17.06043], { icon: redMarker })
        .addTo(mapInstance)
        .bindPopup('Tutaj znajduje się nasza wypożyczalnia!')
        .openPopup();
    }

    // Opcjonalnie: usunięcie mapy po demontażu komponentu
    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
    };
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h4 className='varta'>Kontakt</h4>
            <p>Email: rental@example.com</p>
            <p>Telefon: +48 123 456 789</p>
            <p>Adres: Janiszewskiego 11/17, Wrocław</p>
          </div>
          <div className="col-md-6">
            <div id="map" style={{ height: '300px', width: '100%' }}></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterWithMap;
