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
      donationDate: { $lt: new Date("2024-04-30") }
    });

    let filePath = path.join(process.cwd(), "src", "app", "api", "dashboard", "data_entry", "FY2122.xlsx");
    if (!fs.existsSync(filePath)) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    let fileBuffer = fs.readFileSync(filePath);
    let workbook = xlsx.read(fileBuffer, { type: "buffer" });
    let sheet = workbook.Sheets[workbook.SheetNames[0]];
    let data = xlsx.utils.sheet_to_json(sheet, { raw: false });

    let generatedIdsSet = new Set();
    let itemsWithTempIds = data.map((item) => {
      let tempId;
      do {
        tempId = `order_${crypto.randomInt(100000, 1000000)}`;
      } while (generatedIdsSet.has(tempId)); // Ensures no intra-batch duplicates

      generatedIdsSet.add(tempId);
      return { ...item, tempOrderId: tempId };
    });

    // 2. Extract generated IDs
    let generatedIds = Array.from(generatedIdsSet);

    // 3. Query MongoDB ONCE to find any existing collisions
    let existingDocs = await TotalDonations.find(
      { orderId: { $in: generatedIds } },
      { orderId: 1 }
    ).lean();

    let takenIdsSet = new Set([
      ...generatedIdsSet,
      ...existingDocs.map((doc) => doc.orderId),
    ]);

    // 3. Format docs, safely regenerating any ID that collided with the DB
    let formattedDocs = itemsWithTempIds.map((item) => {
      let finalOrderId = item.tempOrderId;

      // Check if it exists in the DB
      if (existingDocs.some((doc) => doc.orderId === finalOrderId)) {
        do {
          finalOrderId = `order_${crypto.randomInt(100000, 1000000)}`;
        } while (takenIdsSet.has(finalOrderId)); // Must check against ALL taken IDs

        takenIdsSet.add(finalOrderId);
      }

      let [day, month, year] = item.createdAt.split("/").map(Number);

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

    filePath = path.join(process.cwd(), "src", "app", "api", "dashboard", "data_entry", "FY2223.xlsx");
    if (!fs.existsSync(filePath)) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    fileBuffer = fs.readFileSync(filePath);
    workbook = xlsx.read(fileBuffer, { type: "buffer" });
    sheet = workbook.Sheets[workbook.SheetNames[0]];
    data = xlsx.utils.sheet_to_json(sheet, { raw: false });

    generatedIdsSet = new Set();
    itemsWithTempIds = data.map((item) => {
      let tempId;
      do {
        tempId = `order_${crypto.randomInt(100000, 1000000)}`;
      } while (generatedIdsSet.has(tempId)); // Ensures no intra-batch duplicates

      generatedIdsSet.add(tempId);
      return { ...item, tempOrderId: tempId };
    });

    // 2. Extract generated IDs
    generatedIds = Array.from(generatedIdsSet);

    // 3. Query MongoDB ONCE to find any existing collisions
    existingDocs = await TotalDonations.find(
      { orderId: { $in: generatedIds } },
      { orderId: 1 }
    ).lean();

    takenIdsSet = new Set([
      ...generatedIdsSet,
      ...existingDocs.map((doc) => doc.orderId),
    ]);

    formattedDocs = itemsWithTempIds.map((item) => {
      let finalOrderId = item.tempOrderId;

      // Check if it exists in the DB
      if (existingDocs.some((doc) => doc.orderId === finalOrderId)) {
        do {
          finalOrderId = `order_${crypto.randomInt(100000, 1000000)}`;
        } while (takenIdsSet.has(finalOrderId)); // Must check against ALL taken IDs

        takenIdsSet.add(finalOrderId);
      }

      let [day, month, year] = item.createdAt.split("/").map(Number);

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

    filePath = path.join(process.cwd(), "src", "app", "api", "dashboard", "data_entry", "FY2324.xlsx");
    if (!fs.existsSync(filePath)) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    fileBuffer = fs.readFileSync(filePath);
    workbook = xlsx.read(fileBuffer, { type: "buffer" });
    sheet = workbook.Sheets[workbook.SheetNames[0]];
    data = xlsx.utils.sheet_to_json(sheet, { raw: false });

    generatedIdsSet = new Set();
    itemsWithTempIds = data.map((item) => {
      let tempId;
      do {
        tempId = `order_${crypto.randomInt(100000, 1000000)}`;
      } while (generatedIdsSet.has(tempId)); // Ensures no intra-batch duplicates

      generatedIdsSet.add(tempId);
      return { ...item, tempOrderId: tempId };
    });

    // 2. Extract generated IDs
    generatedIds = Array.from(generatedIdsSet);

    // 3. Query MongoDB ONCE to find any existing collisions
    existingDocs = await TotalDonations.find(
      { orderId: { $in: generatedIds } },
      { orderId: 1 }
    ).lean();

    takenIdsSet = new Set([
      ...generatedIdsSet,
      ...existingDocs.map((doc) => doc.orderId),
    ]);

    formattedDocs = itemsWithTempIds.map((item) => {
      let finalOrderId = item.tempOrderId;

      // Check if it exists in the DB
      if (existingDocs.some((doc) => doc.orderId === finalOrderId)) {
        do {
          finalOrderId = `order_${crypto.randomInt(100000, 1000000)}`;
        } while (takenIdsSet.has(finalOrderId)); // Must check against ALL taken IDs

        takenIdsSet.add(finalOrderId);
      }

      let utcDays = item.createdAt - 25569;
      let utcValue = utcDays * 86400000;

      return {
        name: item.name,
        phone: item.phone,
        amount: item.amount,
        orderId: finalOrderId,
        donationDate: new Date(utcValue),
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