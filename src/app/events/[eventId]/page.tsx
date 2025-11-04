"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use } from "react"; // new hook to unwrap promises

export default function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>; // params is now a Promise
}) {
  const router = useRouter();

  // Unwrap the params promise
  const resolvedParams = use(params);
  const { eventId } = resolvedParams;

  console.log("Event ID:", eventId);

  const event = {
    title: "Tech Conference 2024",
    description:
      "Join us for an exciting tech conference featuring top experts in AI, cloud computing, cybersecurity, and innovation. Gain insights, hands-on experience, and network with professionals shaping the future of technology.",
    startDate: "20-12-2024 09:00 AM",
    endDate: "20-12-2024 05:00 PM",
    venueType: "Hybrid (Online + In-Person)",
    venueLocation: "TechPark Auditorium, Bengaluru, India",
    featuredImage:
      "https://imgs.search.brave.com/dG2Ov7Z4dgrAwWt3ZDiUWt9wMUxZrUSw8Wf_ZEaRqN4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTQ4/MzQ4NzA0Mi9waG90/by9wb3J0cmFpdC1v/Zi1hLWZlbWFsZS1h/dmF0YXItbWFkZS1m/b3Itd2ViMy1hbmQt/dGhlLW1ldGF2ZXJz/ZS5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9UEN0a3lEb1FI/WjNXWl96em9rckIw/N0YzblMxRWpWQ2hL/RHE2SWxYcUF6bz0",
    isFree: false,
    ticketPrice: "₹1,499",
    capacity: 250,
    registrationFields: [
      { fieldName: "Full Name", placeholder: "Enter your full name" },
      { fieldName: "Email", placeholder: "Enter your email address" },
      { fieldName: "Phone Number", placeholder: "Enter your contact number" },
      { fieldName: "Organization", placeholder: "Your company or institution" },
    ],
    speakers: [
      {
        name: "Dr. Jane Smith",
        title: "AI Research Director",
        company: "TechCorp",
        profileImg:
          "https://imgs.search.brave.com/GAMU3dRtcBIISUDbnMKfpkmQ5pUBBPEOEIz9vKrHc0w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzE1LzQwLzM2LzI3/LzM2MF9GXzE1NDAz/NjI3ODhfN2h4QWt1/Y0dEbkg1TE9RRzhH/RU03REtSY09MY0lW/T1EuanBn",
        social: {
          linkedin: "https://linkedin.com/",
          twitter: "https://twitter.com/",
          website: "https://techcorp.com",
        },
      },
      {
        name: "Arjun Mehta",
        title: "Cloud Architect",
        company: "Google Cloud India",
        profileImg:
          "https://imgs.search.brave.com/GAMU3dRtcBIISUDbnMKfpkmQ5pUBBPEOEIz9vKrHc0w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzE1LzQwLzM2LzI3/LzM2MF9GXzE1NDAz/NjI3ODhfN2h4QWt1/Y0dEbkg1TE9RRzhH/RU03REtSY09MY0lW/T1EuanBn",
        social: {
          linkedin: "https://linkedin.com/in/arjunmehta",
          twitter: "https://twitter.com/arjunmehta",
          website: "https://cloud.google.com",
        },
      },
      {
        name: "Sara Johnson",
        title: "Cybersecurity Analyst",
        company: "SecureNet",
        profileImg:
          "https://imgs.search.brave.com/GAMU3dRtcBIISUDbnMKfpkmQ5pUBBPEOEIz9vKrHc0w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzE1LzQwLzM2LzI3/LzM2MF9GXzE1NDAz/NjI3ODhfN2h4QWt1/Y0dEbkg1TE9RRzhH/RU03REtSY09MY0lW/T1EuanBn",
        social: {
          linkedin: "https://linkedin.com/in/sarajohnson",
          twitter: "https://twitter.com/sarajohnson",
          website: "https://securenet.com",
        },
      },
    ],
    agenda: [
      {
        title: "Opening Keynote: The Future of AI",
        startTime: "20-12-2024 09:30 AM",
        endTime: "20-12-2024 11:00 AM",
        speaker: "Dr. Jane Smith",
        type: "Keynote",
        description:
          "An inspiring session exploring the evolution of artificial intelligence and how it is reshaping industries globally.",
      },
      {
        title: "Hands-On Cloud Workshop",
        startTime: "20-12-2024 11:30 AM",
        endTime: "20-12-2024 01:00 PM",
        speaker: "Arjun Mehta",
        type: "Workshop",
        description:
          "Learn how to deploy scalable cloud infrastructure on Google Cloud with practical demonstrations.",
      },
      {
        title: "Cybersecurity in 2024: Trends and Challenges",
        startTime: "20-12-2024 02:00 PM",
        endTime: "20-12-2024 03:30 PM",
        speaker: "Sara Johnson",
        type: "Panel Discussion",
        description:
          "A discussion on emerging cybersecurity threats, zero trust frameworks, and data protection best practices.",
      },
      {
        title: "AI + Cloud: The Next Frontier",
        startTime: "20-12-2024 03:45 PM",
        endTime: "20-12-2024 05:00 PM",
        speaker: "All Speakers",
        type: "Roundtable",
        description:
          "An engaging roundtable on how artificial intelligence and cloud computing together will shape the next decade.",
      },
    ],
    organizer: {
      name: "Global Tech Community",
      contactEmail: "contact@globaltechconf.com",
      website: "https://globaltechconf.com",
    },
    sponsors: [
      {
        name: "TechCorp",
        logo: "https://logos-world.net/wp-content/uploads/2020/09/Google-Logo.png",
      },
      {
        name: "SecureNet",
        logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      },
      {
        name: "CloudWorks",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
      },
    ],
    tags: ["AI", "Cloud", "Cybersecurity", "Innovation", "Networking"],
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 px-50 py-10 ">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex justify-center rounded-md border border-transparent bg-black py-2 px-5 mb-10 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 disabled:opacity-50"
      >
        ← Back
      </button>

      {/* Event Header */}
      <section className="mb-10 ">
        <h1 className="text-4xl font-bold">{event.title}</h1>
        <p className="text-gray-600 mt-3 text-lg">{event.description}</p>
      </section>

      {/* Event Image */}
      <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <Image
          src={event.featuredImage}
          alt="Event Banner"
          fill
          className="object-cover"
          quality={75}
        />
      </div>

      {/* Basic Info */}
      <section className="grid md:grid-cols-2 gap-6 bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-10 shadow-sm">
        <div>
          <h3 className="font-semibold text-gray-700">Start Date & Time</h3>
          <p className="text-gray-600">{event.startDate}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700">End Date & Time</h3>
          <p className="text-gray-600">{event.endDate}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700">Venue Type</h3>
          <p className="text-gray-600">{event.venueType}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700">Capacity</h3>
          <p className="text-gray-600">{event.capacity}</p>
        </div>
      </section>

      {/* Registration Fields */}
      <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-10 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Registration Form</h2>
        <ul className="list-disc ml-6 text-gray-600 space-y-2">
          {event.registrationFields.map((field, i) => (
            <li key={i}>
              <strong>{field.fieldName}</strong> – <i>{field.placeholder}</i>
            </li>
          ))}
        </ul>
      </section>

      {/* Speakers */}
      <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-10 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Speakers</h2>
        {event.speakers.map((sp, i) => (
          <div
            key={i}
            className="flex flex-col md:flex-row gap-6 border-b border-gray-200 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0"
          >
            <div className="w-32 h-32 relative rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <Image src={sp.profileImg} alt={sp.name} fill className="object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{sp.name}</h3>
              <p className="text-gray-600">
                {sp.title} – {sp.company}
              </p>
              <div className="flex gap-4 mt-3 text-blue-600">
                <a href={sp.social.linkedin}>LinkedIn</a>
                <a href={sp.social.twitter}>Twitter</a>
                <a href={sp.social.website}>Website</a>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Agenda */}
      <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-10 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Agenda</h2>
        {event.agenda.map((ag, i) => (
          <div
            key={i}
            className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0"
          >
            <h3 className="text-lg font-semibold">{ag.title}</h3>
            <p className="text-gray-600">
              {ag.startTime} - {ag.endTime}
            </p>
            <p className="mt-1 text-gray-600">
              Speaker: <b>{ag.speaker}</b> | Type: {ag.type}
            </p>
            <p className="mt-2 text-gray-600">{ag.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
