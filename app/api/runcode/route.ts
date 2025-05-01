import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
    try {
        const { code, language } = await req.json();

        if (!code || !language) {
            return NextResponse.json({ error: "Missing code or language" }, { status: 400 });
        }

        // JDoodle API Credentials (Use environment variables in production)
        const JDoodle_ClientId = "1ed425d3ed173afd308cf4d06b4ab096";
        const JDoodle_ClientSecret = "dca8fbbb4173d37d8fa9f4a7d7418bd010c0b26c05623c30e9f24ff6a1d4cc17";

        const response = await axios.post("https://api.jdoodle.com/v1/execute", {
            script: code,
            language: language,
            versionIndex: "0",
            clientId: JDoodle_ClientId,
            clientSecret: JDoodle_ClientSecret
        });

        return NextResponse.json({ output: response.data.output });
    } catch (error: any) {
        console.error("Code Execution Error:", error.response?.data || error.message);
        return NextResponse.json({ error: "Failed to execute code" }, { status: 500 });
    }
}
