import { google } from "googleapis";

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/calendar/callback`
);

export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
  });
};

// Timezone is now configurable via env var (fixes L-4)
export const CALENDAR_TIMEZONE =
  process.env.GARAGE_TIMEZONE ?? "Europe/London";

export const createCalendarEvent = async (
  refreshToken: string,
  eventDetails: {
    summary: string;
    description: string;
    startTime: string;
    endTime: string;
  }
) => {
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const event = {
    summary: eventDetails.summary,
    description: eventDetails.description,
    start: {
      dateTime: eventDetails.startTime,
      timeZone: CALENDAR_TIMEZONE,
    },
    end: {
      dateTime: eventDetails.endTime,
      timeZone: CALENDAR_TIMEZONE,
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });

  return response.data;
};
