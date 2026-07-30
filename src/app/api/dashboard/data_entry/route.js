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

    const formatted = data.map(item => {
        const utcDays = item.createdAt - 25569;
        const utcValue = utcDays * 86400000;
        return {
            name: item.name,
            phone: item.phone,
            amount: item.amount,
            orderId: String(item.orderId),
            donationDate: new Date(utcValue),
            source : "Cash",
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

    await TotalDonations.insertMany(formatted);
    return Response.json({ success: true, data: formatted });

  } catch (err) {
    return Response.json({ error: err.message });
  }
}