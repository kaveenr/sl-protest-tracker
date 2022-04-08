import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { MapPoint } from '~/services/sheetService';

export const loader: LoaderFunction = async () => {
  return json(require("app/data.json"));
};

export default function Index() {
  const vettedData: MapPoint[] = useLoaderData();
  const [current, setCurrent] = useState<MapPoint | undefined>(undefined);

  return (
    <div className='static' style={{height: "100vh", width: "100vw", padding: "0px", margin: "0px"}}>
      <div className='absolute top-0 left-0 z-50 p-4 bg-white'>
        <h1 className='text-xl'>Protest Tracker</h1>
        <a className="text-blue-900 font-bold" href="https://docs.google.com/spreadsheets/d/1yShvemHd_eNNAtC3pmxPs9B5RbGmfBUP1O6WGQ5Ycrg/edit#gid=0">Data Source By watchdog.team</a>
      </div>
      <Map
        mapboxAccessToken={"pk.eyJ1IjoidWtyaHEiLCJhIjoiY2wxcW8wbG9hMG9mNjNvbXUzYnQweXMwYiJ9.QyJ6j0pLyLs4MlkmoiC5ww"}
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
            <a href="#" onClick={(e) => {setCurrent(i)}} className="text-2xl p-1 bg-black rounded-full opacity-75">
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
            <ul>
              {current.links.map((link) => (
                <li><a href={link} className="text-blue-900" >{link.slice(0,25)}...</a></li>
              ))}
            </ul>
          </Popup>
        )}
      </Map>
    </div>
  );
}