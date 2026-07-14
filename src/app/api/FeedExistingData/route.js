import * as xlsx from "xlsx";
import path from "path";
import fs from "fs";
import dbConnect from "@/app/lib/dbConnect";
import TotalDonations from "@/models/TotalDonations";

export async function GET() {
  try {
    await dbConnect();

    const filePath = path.join(process.cwd(), "src", "app", "api", "FeedExistingData", "26-27_online_data.xlsx");
    console.log("Exists:", fs.existsSync(filePath));  

     // 🔥 KEY CHANGE: read as buffer
    const fileBuffer = fs.readFileSync(filePath);

    const workbook = xlsx.read(fileBuffer, { type: "buffer"});

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { raw: false });

    const formatted = data.map(item => {
      let finalDate = item.createdAt;
      const [month, day, year] = finalDate.split('/');

  // 2. Pad single digits with zeros (e.g., "4" becomes "04")
  const formattedMonth = month.padStart(2, '0');
  const formattedDay = day.padStart(2, '0');
  
  // 3. Convert a 2-digit year to a 4-digit year safely
  const formattedYear = year.length === 2 ? `20${year}` : year;

  // 4. Combine into ISO format YYYY-MM-DD
  finalDate = `${formattedYear}-${formattedMonth}-${formattedDay}`;
  // if (typeof item.createdAt === 'number') {
  //   const excelOffset = 25567;
  //   const milliseconds = (item.createdAt - excelOffset) * 24 * 60 * 60 * 1000;
    
  //   // 3. Create a real JS Date object
  //   const jsDate = new Date(milliseconds);
    
  //   // 4. Format it however you want! (e.g., "DD-MM-YYYY")
  //   const day = String(jsDate.getDate()).padStart(2, '0');
  //   const month = String(jsDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  //   const year = jsDate.getFullYear();
    
  //   finalDate = `${day}-${month}-${year}`;
  // }
  return {
      name: item.name,
      phone: item.phone,
      amount: Number(item.amount),
      pan: item.pan,
      email: item.email,
      orderId: item.orderId,
      date: finalDate,
      address: item.address,
      pin: item.pin
    }});
    // console.log("Formatted Data:", formatted);

    // await TotalDonations.insertMany(formatted);


    return Response.json({ success: true, data: formatted });

  } catch (err) {
    return Response.json({ error: err.message });
  }
}