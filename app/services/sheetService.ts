import { GoogleSpreadsheet } from "google-spreadsheet";

export interface MapPoint {
    lat: number,
    lng: number,
    id: string,
    location: string,
    date: string,
    notes: string,
    links: string[]
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
      .filter((i)=> i["LatLng (approx)"])
      .map((i) => {
        const cords = i["LatLng (approx)"].split(",").map((l: string)=>(parseFloat(l.trim())));
        return {
          lat: cords[0],
          lng: cords[1],
          id: i["Protest_ID"],
          location: i["Location"],
          date: i["Date"],
          notes: i["Notes on protest - @yudhanjaya"] || undefined,
          links: extractLinks(i["Footage (links, add multiple if possible)"] || "")
        }
      }).filter((i) => (i.lat != null && i.lng != null));
}

function extractLinks(linkStr: string): string[] {
    return linkStr.match(LINK_REGEX) || [];
}