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
    // this._showIpInformation();

    document
      .querySelector("button")
      .addEventListener("click", this._showIpInformation.bind(this));
  }

  // request method {with default url}
  async _request(
    url = "https://geos.ipify.org/api/v2/country,city?apiKey=at_poCCdRbBxUw4qxilYRLhRXy3eWzzu&domain"
  ) {
    try {
      const response = await fetch(url);
      const data = response.json();

      //set request data value = data
      this.#requestData = data;

      // returns an object {data return a promise}
      return { data, response };
    } catch (error) {
      return error.message;
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

    // map constructor
    this.#map = L.map("map").setView([latitude, longitude], this.#zoomLevel);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // render marker
    this._renderMarkerHelper(this.#requestData);
  }

  // show ip information and location on map
  async _showIpInformation(e) {
    try {
      e.preventDefault();
      // select input element
      const inputValue = document.querySelector("#ip");

      // request response data {returns a promise}
      const resData = await this._request(
        `https://geo.ipify.org/api/v2/country,city?apiKey=at_F7Q28Y66u3qHW0cluaRFyGytbOVyI&domain=${inputValue.value}`
      );
      // check for valid domain
      resData.response.ok || new Error(this.showError(errror.message, "error"));

      // {IP data}
      const data = await resData.data;

      // destructure data from { data object}
      const {
        location: { region, timezone, lat, lng },
        ip,
        isp,
      } = data;

      // check if input is empty
      if (!inputValue.value) {
        throw new Error("Enter an IP or Domain 🤔");
      }

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
              <span class="info-text">UTC ${timezone}</span>
            </div>
            <div class="info">
              <span class="info-title">ISP</span><br />
              <span class="info-text">${isp} 😎</span>
            </div>
    `;

      // clear input field
      inputValue.value = "";
      // render maker
      this._renderMarkerHelper(this.#requestData);
    } catch (error) {
      this.showError(error.message, "error");
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
        `<div class='pop-up'><div> name : ${data.name}</div><small>ip : ${data.ip} 🔍</small><small>location : ${data.city} 🌁</small> <span class='pulse'></span></div>`
      )
      .openPopup();
  }

  // render marker helper {helper function for the renderMaker function (provides the rquest data)}
  async _renderMarkerHelper(data) {
    try {
      // destructure data
      const {
        location: { city, lat, lng },
        as: { name },
        ip,
      } = await data;

      // render marker
      this._renderMarker([lat, lng], { name, city, ip });
    } catch (error) {
      this.showError(error.message, "error");
    }
  }

  // show error message
  showError(message, className) {
    // create div element
    const messageDiv = document.createElement("div");
    // add class
    messageDiv.classList.add(className);
    // add text content
    messageDiv.textContent = message;

    // sibling
    const sibling = document.querySelector(".input-group");
    // insert
    sibling.insertAdjacentElement("beforebegin", messageDiv);

    // remove error after 3s
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }
};
// {instantiate app class}
const app = new App();
