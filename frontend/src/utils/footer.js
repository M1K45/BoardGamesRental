import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "./footer.css";
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

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
        .bindPopup('Our rental shop is located here!')
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
            <h4>
              Contact:
            </h4>
            <h4>
              <i className="fas fa-home" style={{ marginRight: '8px' }}></i>
              Address:
            </h4>
            <p>Janiszewskiego 11/17, Wrocław</p>
            <h4>
            <i className="fas fa-clock" style={{ marginRight: '8px' }}></i>
              Opening hours:
            </h4>
            <p>Monday - Saturday:</p>
            <p>9am to 4pm</p>
            <h4>
            <i className="fas fa-envelope" style={{ marginRight: '8px' }}></i>
              Email:
            </h4>
            <p>rental@example.com</p>
            <h4>
            <i className="fas fa-phone" style={{ marginRight: '8px' }}></i>
              Phone number:
            </h4>
            <p>+48 123 456 789</p>
          </div>
          <div className="col-md-6">
            <div id="map" style={{ height: '380px', width: '100%' }}></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterWithMap;

