import { GoogleSpreadsheet } from "google-spreadsheet";
import { DateTime } from "luxon";

export enum PointSize {
  small="small",
  medium="medium",
  large="large"
}

export interface MapPoint {
    lat: number,
    lng: number,
    id: string,
    location: string,
    date: DateTime,
    notes: string,
    links: string[],
    size?: PointSize
  }
  
const LINK_REGEX = /(https?:\/\/[^\s!,]+)/g;

export async function getDataSet(): Promise<MapPoint[]>  {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
    await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
        private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();
    const masterRecords = doc.sheetsByTitle["Protests"];
    const masterRows = await masterRecords.getRows();
    return masterRows
      .filter((i)=> i["LatLng (approx)"] && i["Protest_ID"])
      .map((i) => {
        const cords = i["LatLng (approx)"].split(",").map((l: string)=>(parseFloat(l.trim())));
        return {
          lat: cords[0],
          lng: cords[1],
          id: i["Protest_ID"],
          location: i["Location"],
          date: i["Date"] ? DateTime.fromFormat(i["Date"],"d/M/y") : DateTime.now(),
          notes: i["Notes on protest - @yudhanjaya"] || undefined,
          links: extractLinks(i["Footage (links, add multiple if possible)"] || ""),
          size: mapPointSize(i["Size assessment (small-medium-large-XL, large being Mirihana)"] || "")
        }
      })
      .filter((i) => (i.lat != null && i.lng != null))
      .sort((a, b) => (a.date.toUnixInteger() - b.date.toUnixInteger()));
}

function extractLinks(linkStr: string): string[] {
    return linkStr.match(LINK_REGEX) || [];
}

function mapPointSize(name: string): PointSize | undefined {
  switch(name.toLowerCase().trim()) { 
    case "small": { 
       return PointSize.small;
    } 
    case "medium": { 
      return PointSize.medium;
    } 
    case "large": { 
      return PointSize.large;
    }
    default: { 
       return undefined;
    } 
 } 
}
