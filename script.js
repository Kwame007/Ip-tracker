import "leaflet";
import "leaflet/dist/leaflet.css";

// app class
const App = class {
  // private class fields
  #map;
  #requestData;
  #zoomLevel = 13;

  constructor() {
    // draw map
    this._getCurrentLocation();

    // request
    this._showIpInformation();

    document
      .querySelector("button")
      .addEventListener("click", this._showIpInformation.bind(this));
  }

  // request method
  async _request(
    url = "https://geos.ipify.org/api/v2/country,city?apiKey=at_poCCdRbBxUw4qxilYRLhRXy3eWzzu&domain=google.com"
  ) {
    try {
      const response = await fetch(url);
      const data = response.json();

      //
      this.#requestData = data;

      return data;
    } catch (error) {
      console.log(error.message);
    }
  }

  // get user current location
  _getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
      this._currentPosition.bind(this),
      (err) => console.error(new Error(err))
    );
  }

  // draw map base on current position
  async _currentPosition(position) {
    // get current position data
    const {
      coords: { latitude, longitude },
    } = position;

    // // destructure data
    // const {
    //   location: { city, lat, lng },
    //   as: { name },
    //   ip,
    // } = await this.#requestData;

    // console.log(city, lat, lng, name);

    // map constructor
    this.#map = L.map("map").setView([latitude, longitude], this.#zoomLevel);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // rebder marker
    this._renderMarkerHelper(this.#requestData);
  }

  // show ip information and location on map
  async _showIpInformation() {
    try {
      // select input element
      const inputValue = document.querySelector("#ip");

      // request response data
      const data = await this._request(
        `https://geo.ipify.org/api/v2/country,city?apiKey=at_F7Q28Y66u3qHW0cluaRFyGytbOVyI&domain=${inputValue.value}`
      );
      console.log(data);

      // destructure data from { data object}
      const {
        location: { region, timezone, lat, lng },
        ip,
        isp,
      } = data;

      document.querySelector(".map-info").innerHTML = `
    
            <div class="info">
              <span class="info-title">Ip Address</span><br />
              <span class="info-text">${ip}</span>
            </div>
            <div class="info">
              <span class="info-title">Location</span><br />
              <span class="info-text">${region}</span>
            </div>
            <div class="info">
              <span class="info-title">Time Zone</span><br />
              <span class="info-text">${timezone}</span>
            </div>
            <div class="info">
              <span class="info-title">ISP</span><br />
              <span class="info-text">${isp} 😎</span>
            </div>
    `;

      // render maker
      this._renderMarkerHelper(this.#requestData);
    } catch (error) {
      console.log(error);
    }
  }

  // render marker
  _renderMarker(coords, data) {
    //  icon object
    const icon = L.icon({
      iconUrl: "marker-icon.3f7d3721.png",
      iconSize: [20, 30], // size of the icon
      iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
      shadowAnchor: [4, 62], // the same for the shadow
      popupAnchor: [-11, -82], // point from which the popup should open relative to the iconAnchor
    });

    L.marker(coords, { icon: icon })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 500,
          minWith: 80,
          autoClose: false,
          closeOnClick: false,
          className: `pop-up`,
        })
      )
      .setPopupContent(
        `<div class='pop-up'><div> name : ${data.name}</div><small>ip : ${data.ip} 🔍</small><small>location : ${data.city} 🌁</small></div>`
      )
      .openPopup();
  }

  // render marker helper {helper function for the renderMaker function (provides the rquest data)}
  async _renderMarkerHelper(data) {
    // destructure data
    const {
      location: { city, lat, lng },
      as: { name },
      ip,
    } = await data;

    console.log(city, lat, lng, name);

    // rebder marker
    this._renderMarker([lat, lng], { name, city, ip });
  }
};
const app = new App();
