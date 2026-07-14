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

    const workbook = xlsx.read(fileBuffer, { type: "buffer" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const formatted = data.map(item => ({
      name: item.name,
      phone: item.phone,
      amount: Number(item.amount),
      pan: item.pan,
      email: item.email,
      orderId: item.orderId,
      date: item.createdAt,
      address: item.address,
      pin: item.pin
    }));
    // console.log("Formatted Data:", formatted);

    // await TotalDonations.insertMany(formatted);


    return Response.json({ success: true, data: formatted });

  } catch (err) {
    return Response.json({ error: err.message });
  }
}