import 'dotenv/config'
import { getDataSet } from './services/sheetService'
import { writeFileSync } from "fs";

async function main() {
    const data = await getDataSet();
    console.log(`Fetched ${data.length} rows!`);
    const jsonString = JSON.stringify(data, null, 4);
    writeFileSync(`app/assets/data.json`, jsonString);
}

main();