const curr = document.getElementById("current");
const currH = document.querySelector("#high");
const currL = document.querySelector("#low");
const forecastDiv = document.querySelector("#forecast");
const container = document.querySelector("#container");
const loading = document.querySelector("#loading");

let lat = 0;
let lon = 0;
let temperatureData;

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "short" });

const forecastDates = (daily) => {
  forecastDiv.innerHTML = "";
  daily.forEach((date) => {
    const day = DAY_FORMATTER.format(date.timestamp);
    const high = date.maxTemp;
    const low = date.minTemp;

    const elem = `
                  <div>
                      <div class="dates">${day}</div>
                      <div class="forecastHighLow">
                          <div style="display: flex; justify-content: space-between;">
                              <div>&uarr;</div><div id="forecastHigh">${high}&#xb0</div>
                          </div>
                          <hr/>
                          <div style="display: flex; justify-content: space-between;">
                              <div>&darr; </div><div id="forecastLow">${low}&#xb0</div>
                          </div>
                      </div>
                  </div>
                `;

    forecastDiv.insertAdjacentHTML("beforeend", elem);
  });
};

const updateData = (tData) => {
  curr.innerHTML = `${tData.current.currentTemp}&deg;`;
  currH.innerHTML = `${tData.current.maxTemp}&deg;`;
  currL.innerHTML = `${tData.current.minTemp}&deg;`;
  forecastDates(tData.daily);
};

function positionSuccess({ coords }) {
  getWeather(
    coords.longitude,
    coords.latitude,
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
}

function positionError() {
  alert(
    "There was an error getting your location. Please check Geolocation permissions or your internet connection."
  );
}

const getWeather = async (long, lati, timeZone) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lati}&longitude=${long}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timeformat=unixtime&timezone=${timeZone}`;

  await fetch(url)
    .then((res) => res.json())
    .then((data) => {
      temperatureData = { current: getCurrent(data), daily: getDaily(data) };
      updateData(temperatureData);
      container.classList.remove("blurred");
      loading.style.display = "none";
    });
  // .catch((err) => {
  //   console.log("Error: ", err);
  // });
};

const getCurrent = ({ current_weather, daily }) => {
  const { temperature: currentTemp, weathercode: iconCode } = current_weather;

  const { temperature_2m_max: maxTemp, temperature_2m_min: minTemp } = daily;

  return {
    currentTemp: Math.round(currentTemp),
    maxTemp: Math.round(maxTemp[0]),
    minTemp: Math.round(minTemp[0]),
    iconCode: iconCode[0],
  };
};

const getDaily = ({ daily }) => {
  return daily.time.map((time, index) => {
    return {
      timestamp: time * 1000,
      iconCode: daily.weathercode[index],
      maxTemp: Math.round(daily.temperature_2m_max[index]),
      minTemp: Math.round(daily.temperature_2m_min[index]),
    };
  });
};

navigator.geolocation.getCurrentPosition(positionSuccess, positionError);

// window.addEventListener("load", showForecast);
