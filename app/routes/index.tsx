import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData, useLocation, useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { MapPoint, PointSize } from '~/services/sheetService';
import marker from '~/assets/marker.png';

interface LoaderResponse {
  current?: MapPoint;
  dataset: MapPoint[];
}

export const loader: LoaderFunction = async ({request}) => {
  const url = new URL(request.url);
  const current = url.searchParams.get("current");
  const dataset: MapPoint[] = require("app/assets/data.json");

  return json({
    current: dataset.find((i) => (i.id == current)),
    dataset: dataset
  });
};

export default function Index() {
  const data: LoaderResponse = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [current, setCurrent] = useState<MapPoint | undefined>(data.current);
  useEffect(() => {
    let params = searchParams;
    if (current) {
      params.set("current", current.id);
    } else {
      params.delete("current");
    }
    setSearchParams(params);
  }, [current])

  return (
    <div className='static' style={{ height: "100vh", width: "100vw", padding: "0px", margin: "0px" }}>
      <div className='absolute top-0 left-0 z-50 p-4'>
        <div className="card w-80 md:w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-md md:text-3xl">🇱🇰 Protest Tracker</h2>
            <p className='text-xs md:text-lg'>Visualization of protests taking place in Sri Lanka with data provided by <a href="https://www.watchdog.team" className='text-blue-100'>Watchdog</a>.</p>
            <div className="card-actions justify-left mt-2">
              <a className="btn btn-primary btn-sm" href="https://docs.google.com/spreadsheets/d/1yShvemHd_eNNAtC3pmxPs9B5RbGmfBUP1O6WGQ5Ycrg/edit#gid=0">Data Source</a>
            </div>
          </div>
        </div>
      </div>
      <Map
        mapboxAccessToken={"pk.eyJ1IjoidWtyaHEiLCJhIjoiY2wxcW8wbG9hMG9mNjNvbXUzYnQweXMwYiJ9.QyJ6j0pLyLs4MlkmoiC5ww"}
        initialViewState={{
          longitude: current?.lng || 80.666632,
          latitude: current?.lat ||7.979762,
          zoom: current ? 12 : 7.5,
          bearing: 0,
          pitch: 0
        }}
        mapStyle="mapbox://styles/mapbox/dark-v10"
      >
        {data.dataset.filter((i) => (i.size)).map((i) => {
          let em = 0;
          if (i.size == PointSize.large){
            em = 6;
          } else if(i.size == PointSize.medium){
            em = 5;
          } else {
            em = 4
          }
          return (
            <Marker key={i.id} latitude={i.lat} longitude={i.lng} style={{ width: `${em}em`, height: `${em}em`}}>
              <a onClick={(e) => { setCurrent(i) }} className={`w-full h-full bg-opacity-20 bg-red-900 rounded-full flex justify-center items-center`}>
                <img src={marker} width={"32px"} height={"32px"} />
              </a>
            </Marker>
          );
        })}

        {current && (
          <Popup
            anchor="top"
            longitude={current.lng}
            latitude={current.lat}
            closeOnClick={false}
            onClose={() => setCurrent(undefined)}
            maxWidth={"360px"}
          >
            <div className="card-compact text-black p-0">
              <div className="card-body text-xs md:text-xl p-0">
                <h2 className="card-title">
                  {current.location}
                  <div className="badge badge-secondary">{current.date}</div>  
                </h2>
                <p>{current.notes || "Notes Not Available"}</p>
                <p><b>Size:</b> {current.size || "Not Defined"}</p>
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