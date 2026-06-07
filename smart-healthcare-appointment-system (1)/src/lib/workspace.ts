import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from './firebase';

// In-memory cache for the Google OAuth access token
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const GOOGLE_PROVIDER = new GoogleAuthProvider();
GOOGLE_PROVIDER.addScope('https://www.googleapis.com/auth/gmail.send');
GOOGLE_PROVIDER.addScope('https://www.googleapis.com/auth/gmail.readonly');
GOOGLE_PROVIDER.addScope('https://www.googleapis.com/auth/meetings.space.created');
GOOGLE_PROVIDER.addScope('https://www.googleapis.com/auth/calendar');

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, GOOGLE_PROVIDER);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google identity provider credential');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Workspace Authentication Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const isWorkspaceConnected = (): boolean => {
  return cachedAccessToken !== null;
};

/**
 * Sends an email on behalf of the authenticated user via their real Gmail account.
 * Encodes structure according to RFC 2822 formatting criteria.
 */
export async function sendGmailMessage(to: string, subject: string, bodyHtml: string): Promise<any> {
  const token = getAccessToken();
  if (!token) throw new Error("Google Workspace credentials not connected. Please authorize Gmail in your dashboard.");

  const emailContent = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    bodyHtml,
  ].join('\r\n');

  // Convert MIME string to base64url safe string
  const base64Safe = btoa(unescape(encodeURIComponent(emailContent)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: base64Safe
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gmail API failure: ${errText}`);
  }

  return response.json();
}

/**
 * Lists the authenticated user's recent clinical-related emails.
 */
export async function listGmailMessages(): Promise<any> {
  const token = getAccessToken();
  if (!token) throw new Error("Google Workspace credentials not connected.");

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to list Gmail messages: ${errText}`);
  }

  return response.json();
}

/**
 * Fetches the metadata and content of a single Gmail message.
 */
export async function getGmailMessage(messageId: string): Promise<any> {
  const token = getAccessToken();
  if (!token) throw new Error("Google Workspace credentials not connected.");

  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error("Failed to load individual message structure from Google API");
  }

  return response.json();
}

/**
 * Direct client orchestration of instant Google Meet conferences.
 */
export async function createGoogleMeetSpace(): Promise<{ meetingUri: string; meetingCode: string }> {
  const token = getAccessToken();
  if (!token) throw new Error("Google Workspace credentials not connected. Please authorize Meet in your dashboard.");

  const response = await fetch('https://meet.googleapis.com/v2/spaces', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Meet API Space creation failed: ${errText}`);
  }

  const data = await response.json();
  return {
    meetingUri: data.meetingUri || `https://meet.google.com/${data.meetingCode || 'unknown'}`,
    meetingCode: data.meetingCode || data.name?.replace('spaces/', '') || 'unknown'
  };
}

/**
 * Lists the authenticated user's upcoming Google Calendar events.
 */
export async function listCalendarEvents(maxResults: number = 8): Promise<any> {
  const token = getAccessToken();
  if (!token) throw new Error("Google Workspace credentials not connected.");

  const timeMin = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=${maxResults}&orderBy=startTime&singleEvents=true`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to list Google Calendar events: ${errText}`);
  }

  return response.json();
}

/**
 * Creates an event on the user's primary Google Calendar.
 */
export async function createCalendarEvent(eventData: {
  summary: string;
  description: string;
  location?: string;
  startDateTime: string;
  endDateTime: string;
}): Promise<any> {
  const token = getAccessToken();
  if (!token) throw new Error("Google Workspace credentials not connected. Please authorize Calendar in your dashboard.");

  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

  const body = {
    summary: eventData.summary,
    description: eventData.description,
    location: eventData.location || "",
    start: {
      dateTime: eventData.startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    },
    end: {
      dateTime: eventData.endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Calendar API Error: ${errText}`);
  }

  return response.json();
}
