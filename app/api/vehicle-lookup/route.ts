import { NextResponse } from "next/server";

// UK vehicle registration: letters & digits only, 2–8 chars (spaces stripped before sending)
const REG_ALLOWLIST = /^[A-Z0-9]{2,8}$/;
const MAX_REG_LENGTH = 8;

// Fixed DVLA VES endpoint — POST only, registration in body per DVLA spec
const DVLA_VES_URL =
    "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles";

export async function POST(request: Request) {
    let body: { registration?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }

    const raw = body?.registration;

    if (!raw || typeof raw !== "string") {
        return NextResponse.json(
            { error: "Registration number is required" },
            { status: 400 }
        );
    }

    // Strip HTML, trim, remove spaces, and uppercase — DVLA rejects spaces in the VRN
    const registration = raw
        .replace(/<[^>]*>/g, "")
        .trim()
        .replace(/\s+/g, "")
        .toUpperCase();

    if (
        registration.length > MAX_REG_LENGTH ||
        !REG_ALLOWLIST.test(registration)
    ) {
        return NextResponse.json(
            { error: "Invalid registration plate format" },
            { status: 400 }
        );
    }

    const apiKey = process.env.UK_VEHICLE_API_KEY;

    if (!apiKey) {
        console.warn("UK_VEHICLE_API_KEY is not set. Returning mock data.");
        return NextResponse.json({
            registration,
            make: "FORD",
            model: "FIESTA",
            year: "2018",
            color: "BLUE",
            fuelType: "PETROL",
            motStatus: "Valid",
            taxStatus: "Taxed",
        });
    }

    try {
        const response = await fetch(DVLA_VES_URL, {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ registrationNumber: registration }),
        });

        if (response.status === 404) {
            return NextResponse.json(
                { error: "Vehicle not found" },
                { status: 404 }
            );
        }

        if (!response.ok) {
            const errText = await response.text().catch(() => response.statusText);
            throw new Error(`DVLA API error ${response.status}: ${errText}`);
        }

        const dvla = await response.json();

        // Map DVLA response fields to the shape the app expects
        return NextResponse.json({
            registration: dvla.registrationNumber ?? registration,
            make: dvla.make ?? "",
            // DVLA does not return a model field; keep blank for manual entry
            model: "",
            year: dvla.yearOfManufacture ? String(dvla.yearOfManufacture) : "",
            color: dvla.colour ?? "",
            fuelType: dvla.fuelType ?? "",
            motStatus: dvla.motStatus ?? "",
            taxStatus: dvla.taxStatus ?? "",
            engineCapacity: dvla.engineCapacity ?? null,
            co2Emissions: dvla.co2Emissions ?? null,
            monthOfFirstRegistration: dvla.monthOfFirstRegistration ?? "",
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to lookup vehicle details";
        console.error("Error in DVLA VES lookup:", err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
