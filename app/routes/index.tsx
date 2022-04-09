import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { MapPoint } from '~/services/sheetService';
import marker from '~/assets/marker.png';

export const loader: LoaderFunction = async () => {
  return json(require("app/assets/data.json"));
};

export default function Index() {
  const vettedData: MapPoint[] = useLoaderData();
  const [current, setCurrent] = useState<MapPoint | undefined>(undefined);

  return (
    <div className='static' style={{ height: "100vh", width: "100vw", padding: "0px", margin: "0px" }}>
      <div className='absolute top-0 left-0 z-50 p-4'>

        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">🇱🇰 Protest Tracker</h2>
            <p>Visualization of protests taking place in Sri Lanka with data provided by <a href="https://www.watchdog.team" className='text-blue-100'>Watchdog</a>.</p>
            <div className="card-actions justify-center mt-1">
              <a className="btn btn-primary btn-sm" href="https://docs.google.com/spreadsheets/d/1yShvemHd_eNNAtC3pmxPs9B5RbGmfBUP1O6WGQ5Ycrg/edit#gid=0">Data Source</a>
            </div>
          </div>
        </div>

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
        mapStyle="mapbox://styles/mapbox/dark-v10"
      >
        {vettedData.map((i) => (
          <Marker key={i.id} latitude={i.lat} longitude={i.lng} >
            <a href="#" onClick={(e) => { setCurrent(i) }}>
              <img src={marker} width={"32px"} height={"32px"} />
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
            maxWidth={"360px"}
          >
            <div className="card-compact text-black">
              <div className="card-body">
                <h2 className="card-title">
                  {current.location}
                  <div className="badge badge-secondary">{current.date}</div>  
                </h2>
                <p>{current.notes || "Notes Not Available"}</p>
                <ul>
                {current.links.map((link) => (
                  <li><a href={link} className="text-blue-900 truncate" target="_blank">{link.slice(0, 40)}...</a></li>
                ))}
              </ul>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}