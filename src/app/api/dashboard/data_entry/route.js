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

    await TotalDonations.deleteMany({
      createdAt: { $lt: new Date("2022-04-02") }
    });

    const filePath = path.join(process.cwd(), "src", "app", "api", "dashboard", "data_entry", "FY2122.xlsx");
    if (!fs.existsSync(filePath)) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { raw: false });

    const itemsWithTempIds = data.map((item) => ({
      ...item,
      tempOrderId: `order_${crypto.randomBytes(6).toString("hex")}`,
    }));

    // 2. Extract generated IDs
    const generatedIds = itemsWithTempIds.map((item) => item.tempOrderId);

    // 3. Query MongoDB ONCE to find any existing collisions
    const existingDocs = await TotalDonations.find(
      { orderId: { $in: generatedIds } },
      { orderId: 1 }
    ).lean();

    const existingIdsSet = new Set(existingDocs.map((doc) => doc.orderId));

    // FAST: Generate collision-free unique IDs instantly without DB round-trips
    // 4. Map documents, regenerating any ID that collided (extremely rare)
    const formattedDocs = itemsWithTempIds.map((item) => {
      let finalOrderId = item.tempOrderId;

      // If a collision occurred, generate a new one
      while (existingIdsSet.has(finalOrderId)) {
        finalOrderId = `order_${crypto.randomBytes(6).toString("hex")}`;
      }

      const [day, month, year] = item.createdAt.split("/").map(Number);

      return {
        name: item.name,
        phone: item.phone,
        amount: item.amount,
        orderId: finalOrderId,
        donationDate: new Date(year, month - 1, day),
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