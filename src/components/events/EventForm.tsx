/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  DocumentTextIcon,
  PhotoIcon,
  UserGroupIcon,
  CogIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { eventsApi } from '@/lib/api';

// Types based on backend API
type RegistrationFieldType = 'TEXT' | 'EMAIL' | 'PHONE' | 'SELECT' | 'CHECKBOX' | 'RADIO';
type VenueType = 'ONLINE' | 'PHYSICAL' | 'HYBRID';
type SessionType = 'KEYNOTE' | 'PANEL' | 'WORKSHOP' | 'BREAK' | 'NETWORKING';
type EventCategory = 'FEATURED' | 'WORKSHOP' | 'WEBINAR' | 'CONFERENCE' | 'MEETUP';

interface RegistrationField {
  fieldName: string;
  fieldType: RegistrationFieldType;
  isRequired: boolean;
  placeholder?: string;
  options?: string[];
  order: number;
}

interface Speaker {
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
}

interface AgendaItem {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  speakerName?: string;
  sessionType: SessionType;
}

// Form Schemas based on backend API
const registrationFieldSchema = z.object({
  fieldName: z.string().min(1, 'Field name is required'),
  fieldType: z.enum(['TEXT', 'EMAIL', 'PHONE', 'SELECT', 'CHECKBOX', 'RADIO']),
  isRequired: z.boolean().default(false),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  order: z.number(),
});

const speakerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  company: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  socialLinks: z.object({
    linkedin: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    twitter: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  }).optional(),
});

const agendaItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  speakerName: z.string().optional(),
  sessionType: z.enum(['KEYNOTE', 'PANEL', 'WORKSHOP', 'BREAK', 'NETWORKING']),
});

// Step Schemas matching backend API exactly
const step1Schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  startDateTime: z.string().min(1, 'Start date is required'),
  endDateTime: z.string().min(1, 'End date is required'),
  venueType: z.enum(['ONLINE', 'PHYSICAL', 'HYBRID']),
  location: z.string().optional(),
  venueAddress: z.string().optional(),
});

const step2Schema = z.object({
  featuredImage: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  maxAttendees: z.number().min(1, 'Must have at least 1 attendee'),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  isFree: z.boolean(),
  registrationFields: z.array(registrationFieldSchema),
});

const step3Schema = z.object({
  speakers: z.array(speakerSchema),
  agenda: z.array(agendaItemSchema),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

const tabs = [
  { id: 'details', name: 'Basic Details', icon: DocumentTextIcon },
  { id: 'configuration', name: 'Configuration', icon: CogIcon },
  { id: 'speakers', name: 'Speakers & Agenda', icon: UserGroupIcon },
  { id: 'publish', name: 'Review & Publish', icon: CheckCircleIcon },
];

export default function EventForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Step 1 Form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      title: '',
      description: '',
      venueType: 'ONLINE',
      location: '',
      venueAddress: '',
    },
  });

  // Step 2 Form
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      featuredImage: '',
      maxAttendees: 100,
      price: 0,
      isFree: true,
      registrationFields: [
        { fieldName: 'Full Name', fieldType: 'TEXT', isRequired: true, placeholder: 'Enter your full name', order: 1 },
        { fieldName: 'Email', fieldType: 'EMAIL', isRequired: true, placeholder: 'Enter your email address', order: 2 },
      ],
    },
  });

  // Step 3 Form
  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      speakers: [],
      agenda: [],
    },
  });

  // Field arrays for step 2
  const {
    fields: registrationFields,
    append: appendRegistrationField,
    remove: removeRegistrationField,
  } = useFieldArray({
    control: step2Form.control,
    name: 'registrationFields',
  });

  // Field arrays for step 3
  const {
    fields: speakerFields,
    append: appendSpeaker,
    remove: removeSpeaker,
  } = useFieldArray({
    control: step3Form.control,
    name: 'speakers',
  });

  const {
    fields: agendaFields,
    append: appendAgendaItem,
    remove: removeAgendaItem,
  } = useFieldArray({
    control: step3Form.control,
    name: 'agenda',
  });

  // Watch values
  const venueType = step1Form.watch('venueType');
  const isFree = step2Form.watch('isFree');

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  };

  const isStepComplete = (step: number) => completedSteps.includes(step);

  // Submit handlers
  const onSubmitStep1 = async (data: Step1Data) => {
    try {
      setIsSubmitting(true);
      const result = await eventsApi.createEventStep1(data);

      // Check if we have a direct event object or wrapped response
      if (result.success || result.id) {
        const newEventId = result.id || result.data?.id || result.data?.eventId || result.eventId;
        setEventId(newEventId);
        setCompletedSteps([...completedSteps, 1]);
        toast.success('Basic details saved successfully!');
        goToStep(2);
      } else {
        throw new Error(result?.message || 'Failed to save basic details');
      }
    } catch (error: any) {
      console.error('Error saving step 1:', error);
      toast.error(error.message || 'Failed to save basic details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitStep2 = async (data: Step2Data) => {
    if (!eventId) {
      toast.error('Please complete step 1 first');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await eventsApi.updateEventStep2(eventId, data);

      if (result.success || result.id || result.updatedAt) {
        setCompletedSteps([...completedSteps, 2]);
        toast.success('Configuration saved successfully!');
        goToStep(3);
      } else {
        throw new Error(result?.message || 'Failed to save configuration');
      }
    } catch (error: any) {
      console.error('Error saving step 2:', error);
      toast.error(error.message || 'Failed to save configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitStep3 = async (data: Step3Data) => {
    if (!eventId) {
      toast.error('Please complete previous steps first');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await eventsApi.updateEventStep3(eventId, data);

      if (result.success || result.id || result.updatedAt) {
        setCompletedSteps([...completedSteps, 3]);
        toast.success('Speakers and agenda saved successfully!');
        goToStep(4);
      } else {
        throw new Error(result?.message || 'Failed to save speakers and agenda');
      }
    } catch (error: any) {
      console.error('Error saving step 3:', error);
      toast.error(error.message || 'Failed to save speakers and agenda');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPublishEvent = async () => {
    if (!eventId) {
      toast.error('Cannot publish event');
      return;
    }

    try {
      setIsSubmitting(true);

      // Send the data format your backend expects
      const finalizeResult = await eventsApi.finalizeEvent(eventId, {
        status: 'PUBLISHED',
        sendNotification: true
      });

      if (finalizeResult.success || finalizeResult.id || finalizeResult.updatedAt) {
        setCompletedSteps([...completedSteps, 4]);
        toast.success('Event published successfully!');
        router.push('/events');
      } else {
        throw new Error(finalizeResult?.message || 'Failed to publish event');
      }
    } catch (error: any) {
      console.error('Error publishing event:', error);
      toast.error(error.message || 'Failed to publish event');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const addRegistrationField = () => {
    appendRegistrationField({
      fieldName: '',
      fieldType: 'TEXT',
      isRequired: false,
      placeholder: '',
      order: registrationFields.length + 1,
    });
  };

  const addSpeaker = () => {
    appendSpeaker({
      name: '',
      title: '',
      company: '',
      bio: '',
      profileImage: '',
      socialLinks: {
        linkedin: '',
        twitter: '',
        website: '',
      },
    });
  };

  const addAgendaItem = () => {
    appendAgendaItem({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      speakerName: '',
      sessionType: 'WORKSHOP',
    });
  };

  const renderStep1 = () => (
    <form onSubmit={step1Form.handleSubmit(onSubmitStep1)} className="space-y-6 p-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Basic Event Details</h2>
        <p className="mt-1 text-sm text-gray-500">Provide the basic information about your event.</p>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            {...step1Form.register("title")}
            className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-11 px-3"
            placeholder="e.g., Tech Conference 2024"
          />
          {step1Form.formState.errors.title && (
            <p className="mt-1 text-sm text-red-600">{step1Form.formState.errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            {...step1Form.register("description")}
            className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm px-3 py-2"
            placeholder="Describe your event in detail..."
          />
          {step1Form.formState.errors.description && (
            <p className="mt-1 text-sm text-red-600">{step1Form.formState.errors.description.message}</p>
          )}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700">
              Start Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="startDateTime"
              {...step1Form.register("startDateTime")}
              className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-11 px-3"
            />
            {step1Form.formState.errors.startDateTime && (
              <p className="mt-1 text-sm text-red-600">{step1Form.formState.errors.startDateTime.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700">
              End Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="endDateTime"
              {...step1Form.register("endDateTime")}
              className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-11 px-3"
            />
            {step1Form.formState.errors.endDateTime && (
              <p className="mt-1 text-sm text-red-600">{step1Form.formState.errors.endDateTime.message}</p>
            )}
          </div>
        </div>

        {/* Venue Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Venue Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { value: "ONLINE", label: "Online", icon: "🌐" },
              { value: "PHYSICAL", label: "In-Person", icon: "🏢" },
              { value: "HYBRID", label: "Hybrid", icon: "🔀" },
            ].map((option) => (
              <label
                key={option.value}
                className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition ${venueType === option.value
                    ? "border-gray-600 ring-2 ring-gray-500"
                    : "border-gray-300 hover:border-gray-400"
                  }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  value={option.value}
                  {...step1Form.register("venueType")}
                />
                <div className="flex flex-col items-center w-full">
                  <span className="text-2xl mb-2">{option.icon}</span>
                  <span className="block text-sm font-medium text-gray-900">{option.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Location Fields */}
        {venueType !== "ONLINE" && (
          <>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                {...step1Form.register("location")}
                className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-11 px-3"
                placeholder="Convention Center"
              />
            </div>

            <div>
              <label htmlFor="venueAddress" className="block text-sm font-medium text-gray-700">
                Venue Address
              </label>
              <input
                type="text"
                id="venueAddress"
                {...step1Form.register("venueAddress")}
                className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-11 px-3"
                placeholder="123 Main St, City, Country"
              />
            </div>
          </>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-5 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={step2Form.handleSubmit(onSubmitStep2)} className="space-y-6 p-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Event Configuration</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure pricing, capacity, and registration options.
        </p>
      </div>

      <div className="space-y-6">
        {/* Featured Image */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900">Featured Image</h3>
          <div className="mt-4">
            <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="url"
              id="featuredImage"
              {...step2Form.register("featuredImage")}
              className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray-500 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-11 px-3"
              placeholder="https://example.com/event-banner.jpg"
            />
            {step2Form.formState.errors.featuredImage && (
              <p className="mt-1 text-sm text-red-600">
                {step2Form.formState.errors.featuredImage.message}
              </p>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900">Pricing</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center">
              <input
                id="isFree"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                {...step2Form.register("isFree")}
              />
              <label htmlFor="isFree" className="ml-2 block text-sm text-gray-700">
                This is a free event
              </label>
            </div>

            {!isFree && (
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (in INR)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    {...step2Form.register("price", { valueAsNumber: true })}
                    className="block w-full pl-7 pr-12 sm:text-sm border border-gray-400 rounded-md text-black placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500 h-11"
                    placeholder="0.00"
                  />
                </div>
                {step2Form.formState.errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {step2Form.formState.errors.price.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Capacity */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900">Capacity</h3>
          <div className="mt-4">
            <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700">
              Maximum number of attendees
            </label>
            <input
              type="number"
              id="maxAttendees"
              min="1"
              {...step2Form.register("maxAttendees", { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray-500 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-11 px-3"
              placeholder="100"
            />
            {step2Form.formState.errors.maxAttendees && (
              <p className="mt-1 text-sm text-red-600">
                {step2Form.formState.errors.maxAttendees.message}
              </p>
            )}
          </div>
        </div>

        {/* Registration Form */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Registration Form</h3>
            <button
              type="button"
              onClick={addRegistrationField}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <PlusIcon className="-ml-1 mr-1 h-4 w-4" />
              Add Field
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Customize the registration form fields for attendees.
          </p>

          <div className="mt-4 space-y-4">
            {registrationFields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Field Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Field Name
                      </label>
                      <input
                        type="text"
                        {...step2Form.register(`registrationFields.${index}.fieldName` as const)}
                        className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray-500 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-11 px-3"
                        placeholder="e.g., Phone Number"
                      />
                    </div>

                    {/* Field Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Field Type
                      </label>
                      <select
                        {...step2Form.register(`registrationFields.${index}.fieldType` as const)}
                        className="mt-1 block w-full rounded-md border border-gray-400 text-black shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-11 px-3"
                      >
                        <option value="TEXT">Text</option>
                        <option value="EMAIL">Email</option>
                        <option value="PHONE">Phone</option>
                        <option value="SELECT">Dropdown</option>
                        <option value="CHECKBOX">Checkbox</option>
                        <option value="RADIO">Radio Buttons</option>
                      </select>
                    </div>
                  </div>

                  {/* Placeholder */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      {...step2Form.register(`registrationFields.${index}.placeholder` as const)}
                      className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray-500 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-11 px-3"
                      placeholder="Enter placeholder text"
                    />
                  </div>

                  {/* Required Checkbox */}
                  <div className="flex items-center">
                    <input
                      id={`required-${index}`}
                      type="checkbox"
                      {...step2Form.register(`registrationFields.${index}.isRequired` as const)}
                      className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                    />
                    <label htmlFor={`required-${index}`} className="ml-2 block text-sm text-gray-700">
                      Required field
                    </label>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeRegistrationField(index)}
                  className="flex-shrink-0 p-2 text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => goToStep(1)}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-5 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={step3Form.handleSubmit(onSubmitStep3)} className="space-y-6 p-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Speakers & Agenda</h2>
        <p className="mt-1 text-sm text-gray-500">Add speakers and create your event agenda.</p>
      </div>

      <div className="space-y-6">
        {/* --- Speakers Section --- */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Speakers</h3>
            <button
              type="button"
              onClick={addSpeaker}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              <PlusIcon className="-ml-1 mr-1 h-4 w-4" />
              Add Speaker
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {speakerFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-md font-medium text-gray-900">Speaker {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeSpeaker(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    { label: 'Name *', field: `speakers.${index}.name`, placeholder: 'Dr. Jane Smith' },
                    { label: 'Title *', field: `speakers.${index}.title`, placeholder: 'AI Research Director' },
                    { label: 'Company', field: `speakers.${index}.company`, placeholder: 'TechCorp' },
                    { label: 'Profile Image URL', field: `speakers.${index}.profileImage`, placeholder: 'https://example.com/speaker.jpg' },
                  ].map((item) => (
                    <div key={item.field}>
                      <label className="block text-sm font-medium text-gray-700">{item.label}</label>
                      <input
                        type="text"
                        {...step3Form.register(item.field as const)}
                        className="mt-1 block w-full rounded-md border border-black shadow-sm sm:text-sm placeholder:text-gray-400 text-black focus:border-black focus:ring-black px-3 py-2"
                        placeholder={item.placeholder}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    rows={3}
                    {...step3Form.register(`speakers.${index}.bio` as const)}
                    className="mt-1 block w-full rounded-md border border-black shadow-sm sm:text-sm placeholder:text-gray-400 text-black focus:border-black focus:ring-black px-3 py-2"
                    placeholder="Leading AI researcher with 15+ years of experience"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                      { placeholder: 'LinkedIn URL', field: `speakers.${index}.socialLinks.linkedin` },
                      { placeholder: 'Twitter URL', field: `speakers.${index}.socialLinks.twitter` },
                      { placeholder: 'Website URL', field: `speakers.${index}.socialLinks.website` },
                    ].map((item) => (
                      <input
                        key={item.field}
                        type="url"
                        {...step3Form.register(item.field as const)}
                        className="block w-full rounded-md border border-black shadow-sm sm:text-sm placeholder:text-gray-400 text-black focus:border-black focus:ring-black px-3 py-2"
                        placeholder={item.placeholder}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Agenda Section --- */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Agenda</h3>
            <button
              type="button"
              onClick={addAgendaItem}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              <PlusIcon className="-ml-1 mr-1 h-4 w-4" />
              Add Agenda Item
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {agendaFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-md font-medium text-gray-900">Agenda Item {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeAgendaItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      {...step3Form.register(`agenda.${index}.title` as const)}
                      className="mt-1 block w-full rounded-md border border-black shadow-sm sm:text-sm placeholder:text-gray-400 text-black focus:border-black focus:ring-black px-3 py-2"
                      placeholder="Opening Keynote: The Future of AI"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time *</label>
                    <input
                      type="datetime-local"
                      {...step3Form.register(`agenda.${index}.startTime` as const)}
                      className="mt-1 block w-full rounded-md border border-black shadow-sm sm:text-sm text-black focus:border-black focus:ring-black px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time *</label>
                    <input
                      type="datetime-local"
                      {...step3Form.register(`agenda.${index}.endTime` as const)}
                      className="mt-1 block w-full rounded-md border border-black shadow-sm sm:text-sm text-black focus:border-black focus:ring-black px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Speaker Name</label>
                    <input
                      type="text"
                      {...step3Form.register(`agenda.${index}.speakerName` as const)}
                      className="mt-1 block w-full rounded-md border border-black shadow-sm sm:text-sm placeholder:text-gray-400 text-black focus:border-black focus:ring-black px-3 py-2"
                      placeholder="Dr. Jane Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Session Type</label>
                    <select
                      {...step3Form.register(`agenda.${index}.sessionType` as const)}
                      className="mt-1 block w-full rounded-md border border-black text-black focus:border-black focus:outline-none focus:ring-black sm:text-sm px-3 py-2"
                    >
                      <option value="KEYNOTE">Keynote</option>
                      <option value="PANEL">Panel</option>
                      <option value="WORKSHOP">Workshop</option>
                      <option value="BREAK">Break</option>
                      <option value="NETWORKING">Networking</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    {...step3Form.register(`agenda.${index}.description` as const)}
                    className="mt-1 block w-full rounded-md border border-black shadow-sm sm:text-sm placeholder:text-gray-400 text-black focus:border-black focus:ring-black px-3 py-2"
                    placeholder="Exploring the latest trends and future directions in artificial intelligence"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => goToStep(2)}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </form>
  );



  const renderStep4 = () => (
    <div className="space-y-6 p-6">
      <div className='flex items-center justify-between'>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Review & Publish</h2>
          <p className="mt-1 text-sm text-gray-500">Review your event details and publish when ready.</p>
        </div>
        {/* <button
          type="button"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          publish
        </button> */}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex">
          <CheckCircleIcon className="h-5 w-5 text-green-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Event Ready to Publish</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Your event has been configured successfully. Click the button below to make it live and available for registration.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => goToStep(3)}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onPublishEvent}
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Publishing...' : 'Publish Event'}
        </button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {tabs.map((tab, index) => (
                <li key={tab.id} className={`relative ${index !== tabs.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                  <div className="flex items-center">
                    <div
                      className={`relative flex h-8 w-8 items-center justify-center rounded-full ${currentStep > index + 1 || isStepComplete(index + 1)
                          ? 'bg-indigo-600'
                          : currentStep === index + 1
                            ? 'border-2 border-indigo-600 bg-white'
                            : 'border-2 border-gray-300 bg-white'
                        }`}
                    >
                      {currentStep > index + 1 || isStepComplete(index + 1) ? (
                        <CheckCircleIcon className="h-5 w-5 text-white" />
                      ) : (
                        <span
                          className={`text-sm font-medium ${currentStep === index + 1 ? 'text-indigo-600' : 'text-gray-500'
                            }`}
                        >
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className={`ml-4 text-sm font-medium ${currentStep === index + 1 ? 'text-indigo-600' : 'text-gray-500'
                        }`}
                    >
                      {tab.name}
                    </span>
                  </div>
                  {index !== tabs.length && (
                    <div
                      className={`absolute left-4 -ml-px h-4 w-0.5 
                      ${currentStep > index + 1 || isStepComplete(index + 1)
                          ? 'bg-indigo-600'
                          : currentStep === index + 1
                            ? 'bg-indigo-600'
                            : 'bg-gray-300'
                        }
                      `}
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Form Content */}
        <div className="bg-white shadow rounded-lg">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}