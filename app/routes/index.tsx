import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';

interface DataPoint {
  [key: string]: string;
}

interface MapPoint {
  lat: number,
  lng: number,
  id: string,
  location: string,
  date: string,
  notes: string,
  link: string
}

const data: DataPoint[] = require("../data.json");
const vettedData = data
  .filter((i)=> i["LatLng (approx)"])
  .map((i: DataPoint) => {
    const cords = i["LatLng (approx)"].split(",").map((l: string)=>(parseFloat(l.trim())));
    return {
      lat: cords[0],
      lng: cords[1],
      id: i["Protest_ID"],
      location: i["Location"],
      date: i["Date"],
      notes: i["Notes on protest - @yudhanjaya"] || undefined,
      link: i["Footage (links, add multiple if possible)"]
    }
  }).filter((i) => (i.lat != null && i.lng != null));

export default function Index() {
  const [current, setCurrent] = useState<MapPoint | undefined>(undefined);

  return (
    <div className='static' style={{height: "100vh", width: "100vw", padding: "0px", margin: "0px"}}>
      <div className='absolute top-0 left-0 z-50 p-4 bg-white'>
        <h1 className='text-xl'>Protest Tracker</h1>
        <a className="text-blue-900 font-bold" href="https://docs.google.com/spreadsheets/d/1yShvemHd_eNNAtC3pmxPs9B5RbGmfBUP1O6WGQ5Ycrg/edit#gid=0">Data Source By watchdog.team</a>
      </div>
      <Map
        mapboxAccessToken={process.env.MAPBOX_TOKEN}
        initialViewState={{
          longitude: 79.861244,
          latitude: 6.927079,
          zoom: 8,
          bearing: 0,
          pitch: 0
        }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
      >
        {vettedData.map((i) => (
          <Marker key={i.id} latitude={i.lat} longitude={i.lng} >
            <a href="#" onClick={(e) => {setCurrent(i)}} className="text-4xl p-1 bg-black rounded-full opacity-75">
              🪧
            </a>
          </Marker>
        ))}

        {current && (
          <Popup
            anchor="top"
            longitude={current.lng}
            latitude={current.lat}
            closeOnClick={false}
            onClose={() => setCurrent(undefined)}
          >
            <h2 className={"text-xl mb-1"}>{current.location}</h2>
            <p className='font-semibold'>{current.date}</p>
            <hr/>
            <p className='text-md'>{current.notes}</p>
            <hr/>
            <p>{current.link}</p>
          </Popup>
        )}
      </Map>
    </div>
  );
}
