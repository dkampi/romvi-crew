const { google } = require('googleapis');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const now = new Date().toISOString();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    const response = await calendar.events.list({
      calendarId: process.env.CALENDAR_ID,
      timeMin: now,
      timeMax: threeMonthsLater.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = (response.data.items || []).map(e => ({
      id: e.id,
      title: e.summary || 'Ναύλος',
      date: e.start?.date || e.start?.dateTime?.slice(0, 10),
      timeStart: e.start?.dateTime
        ? new Date(e.start.dateTime).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })
        : '',
      timeEnd: e.end?.dateTime
        ? new Date(e.end.dateTime).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })
        : '',
      notes: e.description || '',
    }));

    return res.status(200).json(events);
  } catch (error) {
    console.error('Calendar error:', error);
    return res.status(500).json({ error: 'Failed to fetch calendar' });
  }
}
