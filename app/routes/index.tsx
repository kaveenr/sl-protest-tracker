import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData, useLocation, useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { MapPoint, PointSize } from '~/services/sheetService';
import marker from '~/assets/marker.png';
import { DateTime } from 'luxon';
import Embed from 'react-embed';

interface LoaderResponse {
  current?: MapPoint;
  dataset: MapPoint[];
  numDays: number;
  startDate: string;
}

export const loader: LoaderFunction = async ({request}) => {
  const url = new URL(request.url);
  const current = url.searchParams.get("current");
  const from = url.searchParams.has("from") ? DateTime.fromISO(url.searchParams.get("from")||"") : undefined;
  const raw_dataset = require("app/assets/data.json");
  const dataset: MapPoint[] = raw_dataset.map((d: {date:string}) => ({...d, date: DateTime.fromISO(d.date)}))
  const num_days = dataset[dataset.length-1].date.diff(dataset[0].date).as('days');
  return json({
    current: dataset.find((i) => (i.id == current)),
    dataset: dataset.filter((i) => {
      if (from) {
        return i.date.startOf("day") <= from.startOf("day")
      }
    }),
    numDays: Math.floor(num_days),
    startDate: dataset[0].date
  });
};

const EmbedViewer = (props: {links: string[]}) =>  {
  if (typeof window === "undefined") {
    return (<></>);
  }
  return (
    <div className='absolute top-0 right-0 p-4 z-50 w-96 overflow-y-auto max-h-full hidden md:block'>
        {props.links.map((link) => (
          <div className="p-2" key={link}>
            <Embed url={link} fallback={<h1>Loading data...</h1>}/>
          </div>
        ))}
    </div>
  );
}

export default function Index() {
  const data: LoaderResponse = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [current, setCurrent] = useState<MapPoint | undefined>(data.current);
  const [days, setDays] = useState(data.numDays);
  useEffect(() => {
    let params = searchParams;
    params.set("from", DateTime.fromISO(data.startDate).plus({days: days}).toISODate())
    if (current) {
      params.set("current", current.id);
    } else {
      params.delete("current");
    }
    setSearchParams(params);
  }, [current, days])

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
        <div className="card w-80 md:w-96 bg-base-100 shadow-xl mt-4 hidden md:block">
          <div className="card-body">
            <input type="range" min="0" max={data.numDays} value={days} onChange={(e) => {setDays(parseInt(e.target.value)); setCurrent(undefined)}} className="range"/>
            <p className='text-center'>
              <b>{DateTime.fromISO(data.startDate).toLocaleString()}</b> - <b>{DateTime.fromISO(data.startDate).plus({days: days}).toLocaleString()}</b>
            </p>
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
                  <div className="badge badge-secondary">{DateTime.fromISO(current.date.toString()).toLocaleString()}</div>  
                </h2>
                <p>{current.notes || "Notes Not Available"}</p>
              </div>
            </div>
          </Popup>
        )}
      </Map>
      {current ? <EmbedViewer links={current.links}/> : []}
    </div>
  );
}