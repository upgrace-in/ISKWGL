import { NextResponse } from "next/server";
import crypto from "crypto";
const dashboardviewerPassword = process.env.DASHBOARD_VIEWER_PASSWORD;
const dashboardadminPassword = process.env.DASHBOARD_ADMIN_PASSWORD;

export async function POST(request) {
    try {
        const { password } = await request.json();

        let role = null;

        if (password === dashboardadminPassword) {
            role = "admin";
        } else if (password === dashboardviewerPassword) {
            role = "viewer";
        }

        if (!role) {
            return NextResponse.json(
                { success: false, message: "Invalid password" },
                { status: 401 }
            );
        }

        // Create a random session token
        const token = crypto.randomBytes(32).toString("hex");

        const response = NextResponse.json({
            success: true,
            role,
        });

        response.cookies.set("dashboard_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
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