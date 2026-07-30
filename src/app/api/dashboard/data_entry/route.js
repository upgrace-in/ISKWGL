import * as xlsx from "xlsx";
import path from "path";
import fs from "fs";
import dbConnect from "@/app/lib/dbConnect";
import TotalDonations from "@/models/TotalDonations";

export async function GET() {
  try {
    await dbConnect();

    const filePath = path.join(process.cwd(), "src", "app", "api", "dashboard", "data_entry", "Cash_Till_June.xlsx");
    console.log("Exists:", fs.existsSync(filePath));  

     // 🔥 KEY CHANGE: read as buffer
    const fileBuffer = fs.readFileSync(filePath);

    const workbook = xlsx.read(fileBuffer, { type: "buffer"});

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { raw: false });

    // 1. Extract all orderIds from the Excel sheet into an array (converting to Strings)
const excelOrderIds = data
  .map(item => item.orderId ? String(item.orderId) : null)
  .filter(Boolean); // Remove empty/null values

// 2. Query MongoDB for existing orderIds in a single call
const existingDonations = await TotalDonations.find(
  { orderId: { $in: excelOrderIds } },
  { orderId: 1 } // Only retrieve the orderId field for performance
).lean();

// 3. Create a Set of existing orderIds for fast O(1) lookups
const existingOrderIdsSet = new Set(existingDonations.map(d => d.orderId));

// 4. Format and filter out any items whose orderId already exists
const formattedDocs = data
  .filter(item => item.orderId && !existingOrderIdsSet.has(String(item.orderId)))
  .map(item => {
    const utcDays = item.createdAt - 25569;
    const utcValue = utcDays * 86400000;

    return {
      name: item.name,
      phone: item.phone,
      amount: item.amount,
      orderId: String(item.orderId),
      donationDate: new Date(utcValue),
      source: "Cash",
      seva: item.donatedFor,
      address: {
        addressLine1: item.address,
        district: item.district,
        state: item.state,
        pinCode: item.pin,
        country: "India"
      }
    };
  });

// 5. Insert only the new documents
if (formattedDocs.length > 0) {
  await TotalDonations.insertMany(formattedDocs);
  console.log(`Inserted ${formattedDocs.length} new donations. Skipped ${data.length - formattedDocs.length} duplicate/invalid rows.`);
} else {
  console.log('No new donations to insert.');
}
    return Response.json({ success: true, data: formatted });

  } catch (err) {
    return Response.json({ error: err.message });
  }
}