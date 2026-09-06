import * as xlsx from "xlsx";
import path from "path";
import fs from "fs";
import crypto from "crypto"; // Native Node.js module for collision-free IDs
import dbConnect from "@/app/lib/dbConnect";
import TotalDonations from "@/models/TotalDonations";

// Force Next.js to skip static evaluation during build time
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await dbConnect();

    let filePath = path.join(process.cwd(), "src", "app", "api", "dashboard", "data_entry", "FY2324.xlsx");
    if (!fs.existsSync(filePath)) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    let fileBuffer = fs.readFileSync(filePath);
    let workbook = xlsx.read(fileBuffer, { type: "buffer" });
    let sheet = workbook.Sheets[workbook.SheetNames[0]];
    let data = xlsx.utils.sheet_to_json(sheet, { raw: false });

    let itemsWithTempIds = data.map((item) => ({
      ...item,
      tempOrderId: `order_${crypto.randomInt(100000, 1000000)}`,
    }));

    // 2. Extract generated IDs
    let generatedIds = itemsWithTempIds.map((item) => item.tempOrderId);

    // 3. Query MongoDB ONCE to find any existing collisions
    let existingDocs = await TotalDonations.find(
      { orderId: { $in: generatedIds } },
      { orderId: 1 }
    ).lean();

    let existingIdsSet = new Set(existingDocs.map((doc) => doc.orderId));

    // FAST: Generate collision-free unique IDs instantly without DB round-trips
    // 4. Map documents, regenerating any ID that collided (extremely rare)
    let formattedDocs = itemsWithTempIds.map((item) => {
      let finalOrderId = item.tempOrderId;

      // If a collision occurred, generate a new one
      while (existingIdsSet.has(finalOrderId)) {
        finalOrderId = `order_${crypto.randomInt(100000, 1000000)}`;
      }

      // const [day, month, year] = item.createdAt.split("/").map(Number);
      let excelEpoch = new Date(Date.UTC(1899, 11, 30));

      return {
        name: item.name,
        phone: item.phone,
        amount: item.amount,
        orderId: finalOrderId,
        donationDate: new Date(excelEpoch.getTime() + item.createdAt * 86400000),
        source: "UPI",
        seva: "General Donation",
        address: {
          addressLine1: item.address,
          district: item.district,
          state: item.state,
          pinCode: item.pin,
          country: "India",
        },
      };
    });

    if (formattedDocs.length > 0) {
      await TotalDonations.insertMany(formattedDocs);
      console.log(`Inserted ${formattedDocs.length} new donations.`);
    }

    return Response.json({ success: true, count: formattedDocs.length });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}