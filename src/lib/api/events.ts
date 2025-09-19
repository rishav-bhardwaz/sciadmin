import { getAuthToken } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

export interface CreateEventStep1Data {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  venueType: 'ONLINE' | 'PHYSICAL' | 'HYBRID';
  location?: string;
  venueAddress?: string;
}

export interface RegistrationField {
  fieldName: string;
  fieldType: 'TEXT' | 'EMAIL' | 'PHONE' | 'SELECT' | 'CHECKBOX' | 'RADIO';
  isRequired: boolean;
  placeholder?: string;
  options?: string[];
  order: number;
}

export interface CreateEventStep2Data {
  featuredImage?: string;
  maxAttendees: number;
  price: number;
  isFree: boolean;
  category: 'FEATURED' | 'REGULAR' | 'WORKSHOP' | 'CONFERENCE' | 'WEBINAR';
  registrationFields: RegistrationField[];
}

export interface Speaker {
  name: string;
  title?: string;
  company?: string;
  bio?: string;
  profileImage?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface AgendaItem {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  speakerName?: string;
  sessionType: 'KEYNOTE' | 'PANEL' | 'WORKSHOP' | 'BREAK' | 'NETWORKING';
}

export interface CreateEventStep3Data {
  speakers: Speaker[];
  agenda: AgendaItem[];
}

export const createEventStep1 = async (data: CreateEventStep1Data) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/events/step1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create event');
  }

  return response.json();
};

export const createEventStep2 = async (eventId: string, data: CreateEventStep2Data) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}/step2`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update event configuration');
  }

  return response.json();
};

export const createEventStep3 = async (eventId: string, data: CreateEventStep3Data) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}/step3`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update event speakers and agenda');
  }

  return response.json();
};

export const publishEvent = async (eventId: string) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}/publish`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to publish event');
  }

  return response.json();
};

export const getEvent = async (eventId: string) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch event');
  }

  return response.json();
};
