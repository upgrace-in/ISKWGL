import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get("dashboard_session")?.value;

        if (!token) {
            return NextResponse.json({ role: null }, { status: 401 });
        }

        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        return NextResponse.json({ role: payload.role });
    } catch (error) {
        return NextResponse.json({ role: null }, { status: 401 });
    }
}