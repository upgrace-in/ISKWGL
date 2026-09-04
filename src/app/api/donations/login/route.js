import { NextResponse } from "next/server";
import crypto from "crypto";
const donationsPassword = process.env.Dashboard_VIEWER_PASSWORD;
export async function POST(request) {
    try {
        const { password } = await request.json();

        if (password !== donationsPassword) {
            return NextResponse.json(
                { success: false, message: "Invalid password" },
                { status: 401 }
            );
        }

        const token = crypto.randomBytes(32).toString("hex");

        const response = NextResponse.json({
            success: true,
            role: "viewer",
        });

        response.cookies.set("donations_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        return response;
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}