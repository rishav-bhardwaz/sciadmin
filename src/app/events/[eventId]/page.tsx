"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use } from "react";
import { eventsApi, ApiError } from "@/lib/api";
import { toast } from "react-hot-toast";

interface EventData {
  id: string;
  title: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  meetLink?: string;
  featuredImage?: string;
  isFree?: boolean;
  price?: number;
  maxAttendees?: number;
  category?: string;
  speakers?: Array<{
    name: string;
    title: string;
    company?: string;
    bio?: string;
    profileImage?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      website?: string;
    };
  }>;
  agenda?: Array<{
    title: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    speakerName?: string;
    sessionType?: string;
  }>;
}

export default function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { eventId } = resolvedParams;

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await eventsApi.getEventById(eventId);
        const evt = response.data || response;
        setEvent(evt);
      } catch (err: any) {
        console.error("Error fetching event:", err);
        const errorMessage = err instanceof ApiError ? err.message : "Failed to load event";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return "Not specified";
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateTimeString;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "Not specified";
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 px-4 md:px-10 py-10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-900">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white text-gray-900 px-4 md:px-10 py-10">
        <button
          onClick={() => router.back()}
          className="inline-flex justify-center rounded-md border border-transparent bg-black py-2 px-5 mb-10 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
        >
          ← Back
        </button>
        <div className="text-center py-12">
          <p className="text-red-600 text-lg mb-4">{error || "Event not found"}</p>
          <button
            onClick={() => router.push("/events")}
            className="inline-flex justify-center rounded-md border border-transparent bg-black py-2 px-5 text-sm font-medium text-white shadow-sm hover:bg-gray-900"
          >
            Go to Events
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white text-gray-900 px-4 md:px-10 py-10">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex justify-center rounded-md border border-transparent bg-black py-2 px-5 mb-10 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
      >
        ← Back
      </button>

      {/* Event Header */}
      <section className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">{event.title || "Untitled Event"}</h1>
        {event.description && (
          <p className="text-gray-700 mt-3 text-lg">{event.description}</p>
        )}
      </section>

      {/* Event Image */}
      {event.featuredImage && (
        <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <Image
            src={event.featuredImage}
            alt="Event Banner"
            fill
            className="object-cover"
            quality={75}
          />
        </div>
      )}

      {/* Basic Info */}
      <section className="grid md:grid-cols-2 gap-6 bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-10 shadow-sm">
        <div>
          <h3 className="font-semibold text-gray-900">Start Date & Time</h3>
          <p className="text-gray-700">{formatDateTime(event.startDateTime)}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">End Date & Time</h3>
          <p className="text-gray-700">{formatDateTime(event.endDateTime)}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Venue Type</h3>
          <p className="text-gray-700">Online</p>
        </div>
        {event.meetLink && (
          <div>
            <h3 className="font-semibold text-gray-900">Meeting Link</h3>
            <a
              href={event.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {event.meetLink}
            </a>
          </div>
        )}
        {event.maxAttendees && (
          <div>
            <h3 className="font-semibold text-gray-900">Capacity</h3>
            <p className="text-gray-700">{event.maxAttendees} attendees</p>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900">Price</h3>
          <p className="text-gray-700">
            {event.isFree ? "Free" : event.price ? `₹${event.price}` : "Not specified"}
          </p>
        </div>
        {event.category && (
          <div>
            <h3 className="font-semibold text-gray-900">Category</h3>
            <p className="text-gray-700">{event.category}</p>
          </div>
        )}
      </section>

      {/* Speakers */}
      {event.speakers && event.speakers.length > 0 && (
        <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-10 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Speakers</h2>
          {event.speakers.map((speaker, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row gap-6 border-b border-gray-200 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0"
            >
              {speaker.profileImage && (
                <div className="w-32 h-32 relative rounded-lg overflow-hidden shadow-sm border border-gray-200 flex-shrink-0">
                  <Image
                    src={speaker.profileImage}
                    alt={speaker.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{speaker.name}</h3>
                <p className="text-gray-700">
                  {speaker.title}
                  {speaker.company && ` – ${speaker.company}`}
                </p>
                {speaker.bio && (
                  <p className="text-gray-600 mt-2">{speaker.bio}</p>
                )}
                {speaker.socialLinks && (
                  <div className="flex gap-4 mt-3">
                    {speaker.socialLinks.linkedin && (
                      <a
                        href={speaker.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        LinkedIn
                      </a>
                    )}
                    {speaker.socialLinks.twitter && (
                      <a
                        href={speaker.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Twitter
                      </a>
                    )}
                    {speaker.socialLinks.website && (
                      <a
                        href={speaker.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Website
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Agenda */}
      {event.agenda && event.agenda.length > 0 && (
        <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-10 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Agenda</h2>
          {event.agenda.map((item, i) => (
            <div
              key={i}
              className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0"
            >
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="text-gray-700">
                {formatTime(item.startTime)} - {formatTime(item.endTime)}
              </p>
              {item.speakerName && (
                <p className="mt-1 text-gray-700">
                  Speaker: <b>{item.speakerName}</b>
                  {item.sessionType && ` | Type: ${item.sessionType}`}
                </p>
              )}
              {item.description && (
                <p className="mt-2 text-gray-700">{item.description}</p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
