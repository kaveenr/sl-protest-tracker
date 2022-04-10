import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { MapPoint, PointSize } from '~/services/sheetService';
import marker from '~/assets/marker.png';
import { DateTime, Interval } from 'luxon';
import Embed from 'react-embed';
import DatePicker from "react-datepicker";

const raw_dataset = require("app/assets/data.json");

interface LoaderResponse {
  current?: MapPoint;
  dataset: MapPoint[];
  startDate: string;
  endDate: string;
}

export const loader: LoaderFunction = async ({request}) => {

  const dataset: MapPoint[] = raw_dataset.map((d: {date:string}) => ({...d, date: DateTime.fromISO(d.date)}))

  const url = new URL(request.url);
  const current = url.searchParams.get("current") || undefined;
  const from = url.searchParams.has("from") ? DateTime.fromISO(url.searchParams.get("from")||"") : dataset[0].date;
  const to = url.searchParams.has("to") ? DateTime.fromISO(url.searchParams.get("to")||"") : dataset[dataset.length-1].date;
  const timeRange = Interval.fromDateTimes(from, to.plus({days:1}));

  return json({
    current: dataset.find((i) => (i.id == current)),
    dataset: dataset.filter((i) => (timeRange.contains(i.date))),
    startDate: from,
    endDate: to
  });
};

const EmbedViewer = (props: {links: string[]}) =>  {
  if (typeof window === "undefined") {
    return (<></>);
  }
  return (
    <div className='absolute top-0 right-0 p-4 z-50 w-96 overflow-y-auto max-h-full hidden md:block'>
        <div className="card card-compact bg-base-100 shadow-xl">
          <div className="card-body">
            <p className='text-xs md:text-lg text-center'>
              🔗 <b>{props.links.length}</b> Social Links
            </p>
          </div>
        </div>
        {props.links.map((link) => (
          <div className="p-2" key={link}>
            <Embed url={link}/>
          </div>
        ))}
    </div>
  );
}

export default function Index() {
  const data: LoaderResponse = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [current, setCurrent] = useState<MapPoint | undefined>(data.current);
  const [dateRange, setDateRange] = useState<(Date|undefined)[]>([
    DateTime.fromISO(data.startDate).toJSDate(),
    DateTime.fromISO(data.endDate).toJSDate()
  ]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    let params = searchParams;
    if (startDate && endDate) {
      params.set("from", DateTime.fromJSDate(startDate).toISODate());
      params.set("to", DateTime.fromJSDate(endDate).toISODate());
    }
    if (current) {
      params.set("current", current.id);
    } else {
      params.delete("current");
    }
    setSearchParams(params);
  }, [current, dateRange])

  return (
    <div className='static' style={{ height: "100vh", width: "100vw", padding: "0px", margin: "0px" }}>
      <div className='absolute top-0 left-0 z-40 p-4' id="root-portal">
        <div className="card w-80 md:w-96 bg-base-100 drop-shadow-2xl">
          <div className="card-body">
            <h2 className="card-title text-md md:text-3xl">🇱🇰 Protest Tracker</h2>
            <p className='text-xs md:text-lg'>Visualization of protests taking place in Sri Lanka with data provided by <a href="https://www.watchdog.team" className='text-blue-100'>Watchdog</a>.</p>
            <div className="card-actions justify-left mt-2">
              <a className="btn btn-primary btn-sm" href="https://docs.google.com/spreadsheets/d/1yShvemHd_eNNAtC3pmxPs9B5RbGmfBUP1O6WGQ5Ycrg/edit#gid=0" target="_blank">
                Data Source
              </a>
              <a className="btn btn-secondary btn-sm" href="https://github.com/kaveenr/sl-protest-tracker" target="_blank">
                <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="inline-block h-5 w-5 fill-current md:h-6 md:w-6"><path d="M256,32C132.3,32,32,134.9,32,261.7c0,101.5,64.2,187.5,153.2,217.9a17.56,17.56,0,0,0,3.8.4c8.3,0,11.5-6.1,11.5-11.4,0-5.5-.2-19.9-.3-39.1a102.4,102.4,0,0,1-22.6,2.7c-43.1,0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1,1.4-14.1h.1c22.5,2,34.3,23.8,34.3,23.8,11.2,19.6,26.2,25.1,39.6,25.1a63,63,0,0,0,25.6-6c2-14.8,7.8-24.9,14.2-30.7-49.7-5.8-102-25.5-102-113.5,0-25.1,8.7-45.6,23-61.6-2.3-5.8-10-29.2,2.2-60.8a18.64,18.64,0,0,1,5-.5c8.1,0,26.4,3.1,56.6,24.1a208.21,208.21,0,0,1,112.2,0c30.2-21,48.5-24.1,56.6-24.1a18.64,18.64,0,0,1,5,.5c12.2,31.6,4.5,55,2.2,60.8,14.3,16.1,23,36.6,23,61.6,0,88.2-52.4,107.6-102.3,113.3,8,7.1,15.2,21.1,15.2,42.5,0,30.7-.3,55.5-.3,63,0,5.4,3.1,11.5,11.4,11.5a19.35,19.35,0,0,0,4-.4C415.9,449.2,480,363.1,480,261.7,480,134.9,379.7,32,256,32Z"></path></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="card card-compact w-80 md:w-96 bg-base-100 shadow-xl mt-4 hidden md:block">
          <div className="card-body">
            <div className="flex justify-between w-full items-center">
              <p className='w-32'>Date Range :</p>
              <DatePicker
                  className='btn btn-outline btn-info btn-sm w-full'
                  selectsRange
                  selected={startDate}
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={DateTime.now().toJSDate()}
                  onChange={(dates)=> {
                    const [start, end] = dates;
                    setDateRange([start || undefined, end || undefined]);
                    setCurrent(undefined)
                  }}
                  portalId="root-portal"
                  dateFormat="d MMM yyyy"
              />
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
            className='p-0'
          >
            <div className="card-compact text-black">
              <div className="card-body text-xs md:text-xl" style={{padding: "0.2em 0.3em"}}>
                <h2 className="card-title">
                  <p className="truncate">{current.location}</p>
                  <div className="badge badge-secondary">{DateTime.fromISO(current.date.toString()).toFormat("DD")}</div>  
                </h2>
                <div className="prose-sm prose-stone">
                  <p>{current.notes?.slice(0,100) || "Notes Not Available"}</p>
                </div>
                <div className="flex gap-2">
                  { current.size ? (<div className="badge badge-lg badge-primary">Size: {current.size}</div>) : [] }
                  { current.links.length !=0 ? (<div className="badge badge-lg">Links: {current.links.length}</div>) : [] }
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>
      {current ? <EmbedViewer links={current.links}/> : []}
    </div>
  );
}