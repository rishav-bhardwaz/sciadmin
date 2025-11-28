/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, use } from 'react';
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
import Link from 'next/link';
import { eventsApi } from '@/lib/api';

/* ---------------------------
   Types & Zod Schemas
   --------------------------- */
type RegistrationFieldType = 'TEXT' | 'EMAIL' | 'PHONE' | 'SELECT' | 'CHECKBOX' | 'RADIO';
type VenueType = 'ONLINE' | 'PHYSICAL' | 'HYBRID';
type SessionType = 'KEYNOTE' | 'PANEL' | 'WORKSHOP' | 'BREAK' | 'NETWORKING';

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
  order: number;
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
  order: number;
}

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
  order: z.number().min(0, 'Order must not be less than 0'),
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
  order: z.number().min(0, 'Order must not be less than 0'),
});

const step1Schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  meetLink: z.string().min(1, 'Meet link is required'),
  startDateTime: z.string().min(1, 'Start date is required'),
  endDateTime: z.string().min(1, 'End date is required'),
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


/* ---------------------------
   Helper: Parse "20-12-2024 09:00 AM" -> "2024-12-20T09:00"
   --------------------------- */
function parseCustomDateToDatetimeLocal(input: string): string {
  try {
    if (!input) return '';
    const parts = input.split(' ');
    const datePart = parts[0]; // dd-mm-yyyy
    let timePart = parts[1] || '00:00';
    const ampm = parts[2] ? parts[2].toUpperCase() : undefined;

    const [dd, mm, yyyy] = datePart.split('-');
    let [hh, min] = timePart.split(':');
    let hourNum = parseInt(hh, 10);

    if (ampm) {
      if (ampm === 'PM' && hourNum !== 12) hourNum += 12;
      if (ampm === 'AM' && hourNum === 12) hourNum = 0;
    }

    const hhStr = String(hourNum).padStart(2, '0');
    const minStr = (min || '00').padStart(2, '0');

    return `${yyyy}-${mm}-${dd}T${hhStr}:${minStr}`;
  } catch (e) {
    return '';
  }
}

/* ---------------------------
   Edit Page Component
   --------------------------- */
export default function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params); // unwrap Promise-compatible param
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Note: mode: 'onChange' lets react-hook-form keep isValid updated live
  const step1Form = useForm<Step1Data>({
    mode: 'onChange',
    resolver: zodResolver(step1Schema),
    defaultValues: {
      title: '',
      description: '',
      meetLink: '',
      startDateTime: '',
      endDateTime: '',
    },
  });

  const step2Form = useForm<Step2Data>({
    mode: 'onChange',
    resolver: zodResolver(step2Schema),
    defaultValues: {
      featuredImage: '',
      maxAttendees: 100,
      price: 0,
      isFree: true,
      registrationFields: [],
    },
  });

  const step3Form = useForm<Step3Data>({
    mode: 'onChange',
    resolver: zodResolver(step3Schema),
    defaultValues: {
      speakers: [],
      agenda: [],
    },
  });

  // Field arrays for step 2 (kept for schema validation, but always sends empty array)
  const {
    fields: registrationFields,
  } = useFieldArray({
    control: step2Form.control,
    name: 'registrationFields',
  });

  // Field arrays for step 3
  const {
    fields: speakerFields,
    append: appendSpeaker,
    remove: removeSpeaker,
    replace: replaceSpeakers,
  } = useFieldArray({
    control: step3Form.control,
    name: 'speakers',
  });

  const {
    fields: agendaFields,
    append: appendAgendaItem,
    remove: removeAgendaItem,
    replace: replaceAgenda,
  } = useFieldArray({
    control: step3Form.control,
    name: 'agenda',
  });

  const isFree = step2Form.watch('isFree');

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) setCurrentStep(step);
  };

  const isStepComplete = (step: number) => completedSteps.includes(step);

  // whether all forms are valid (live)
  const [allValid, setAllValid] = useState(false);

  useEffect(() => {
    setAllValid(!!(step1Form.formState.isValid && step2Form.formState.isValid && step3Form.formState.isValid));
  }, [step1Form.formState.isValid, step2Form.formState.isValid, step3Form.formState.isValid]);

  /* ---------------------------
     Fetch event data from API and populate forms
     --------------------------- */
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        const response = await eventsApi.getEventById(eventId);
        const evt = response.data || response;

        // Step 1 mapping
        step1Form.reset({
          title: evt.title || '',
          description: evt.description || '',
          meetLink: evt.meetLink || '',
          startDateTime: evt.startDateTime ? parseCustomDateToDatetimeLocal(evt.startDateTime) : '',
          endDateTime: evt.endDateTime ? parseCustomDateToDatetimeLocal(evt.endDateTime) : '',
        });

        // Step 2 mapping
        step2Form.reset({
          category: evt.category || '',
          featuredImage: evt.featuredImage || '',
          maxAttendees: evt.maxAttendees || 100,
          price: evt.price || 0,
          isFree: evt.isFree !== undefined ? evt.isFree : true,
          registrationFields: [],
        });

        // Step 3 mapping
        const speakersMapped = (evt.speakers || []).map((s: any, index: number) => ({
          name: s.name || '',
          title: s.title || '',
          company: s.company || '',
          bio: s.bio || '',
          profileImage: s.profileImage || s.profileImg || '',
          order: s.order !== undefined ? s.order : index,
          socialLinks: {
            linkedin: s.socialLinks?.linkedin || s.social?.linkedin || '',
            twitter: s.socialLinks?.twitter || s.social?.twitter || '',
            website: s.socialLinks?.website || s.social?.website || '',
          },
        }));

        const agendaMapped = (evt.agenda || []).map((a: any, index: number) => ({
          title: a.title || '',
          description: a.description || '',
          startTime: a.startTime ? parseCustomDateToDatetimeLocal(a.startTime) : '',
          endTime: a.endTime ? parseCustomDateToDatetimeLocal(a.endTime) : '',
          speakerName: a.speakerName || a.speaker || '',
          sessionType: (a.sessionType || a.type || 'WORKSHOP') as SessionType,
          order: a.order !== undefined ? a.order : index,
        }));

        step3Form.reset({
          speakers: speakersMapped,
          agenda: agendaMapped,
        });

        replaceSpeakers(speakersMapped);
        replaceAgenda(agendaMapped);

        setCompletedSteps([1]);
      } catch (error: any) {
        console.error('Error fetching event:', error);
        toast.error(error.message || 'Failed to load event data');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  /* ---------------------------
     Submit handlers (simulate save with timeouts)
     --------------------------- */
  const onSubmitStep1 = async (data: Step1Data) => {
    try {
      setIsSubmitting(true);
      // Always send ONLINE venue type
      const dataWithVenueType = {
        ...data,
        venueType: 'ONLINE' as const,
      };
      await new Promise((res) => setTimeout(res, 800)); // simulate API
      setCompletedSteps((prev) => Array.from(new Set([...prev, 1])));
      toast.success('Basic details saved successfully!');
      goToStep(2);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save basic details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitStep2 = async (data: Step2Data) => {
    try {
      if (!eventId) {
        toast.error('Missing event id');
        return;
      }
      setIsSubmitting(true);
      // Always send empty registration fields
      const dataWithEmptyFields = {
        ...data,
        registrationFields: [],
      };
      await new Promise((res) => setTimeout(res, 800));
      setCompletedSteps((prev) => Array.from(new Set([...prev, 2])));
      toast.success('Configuration saved successfully!');
      goToStep(3);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitStep3 = async (data: Step3Data) => {
    try {
      if (!eventId) {
        toast.error('Missing event id');
        return;
      }
      setIsSubmitting(true);
      // Ensure all speakers have the order field set correctly
      const speakersWithOrder = data.speakers.map((speaker, index) => ({
        ...speaker,
        order: speaker.order !== undefined ? speaker.order : index,
      }));
      
      // Ensure all agenda items have the order field set correctly
      const agendaWithOrder = data.agenda.map((agendaItem, index) => ({
        ...agendaItem,
        order: agendaItem.order !== undefined ? agendaItem.order : index,
      }));
      
      const dataWithOrder = {
        ...data,
        speakers: speakersWithOrder,
        agenda: agendaWithOrder,
      };
      
      await new Promise((res) => setTimeout(res, 800));
      setCompletedSteps((prev) => Array.from(new Set([...prev, 3])));
      toast.success('Speakers and agenda saved successfully!');
      goToStep(4);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save speakers and agenda');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper: format errors from a form's formState.errors into readable strings
  function formatErrorsForStep(step: number) {
    let errorObj: Record<string, any> = {};
    if (step === 1) errorObj = step1Form.formState.errors;
    else if (step === 2) errorObj = step2Form.formState.errors;
    else if (step === 3) errorObj = step3Form.formState.errors;

    const messages: string[] = [];

    const walk = (obj: any, prefix = '') => {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (val && typeof val === 'object' && 'message' in val) {
          const name = prefix ? `${prefix}.${key}` : key;
          messages.push(`${name.replace(/\.\d+/g, (m) => `[${m.slice(1)}]`)}: ${val.message}`);
        } else if (val && typeof val === 'object') {
          walk(val, prefix ? `${prefix}.${key}` : key);
        }
      }
    };

    walk(errorObj);
    return messages;
  }

  // Helper: Show a single consolidated toast when validation fails
  function showValidationToast(step: number, messages: string[]) {
    const stepName =
      step === 1
        ? 'Basic Details'
        : step === 2
        ? 'Configuration'
        : step === 3
        ? 'Speakers & Agenda'
        : 'Review & Publish';

    if (messages.length) {
      toast.error(`${stepName} — ${messages.slice(0, 3).join('; ')}`);
    } else {
      toast.error(`Please fix errors in ${stepName} before continuing.`);
    }
  }

  // Save all changes from review step (simulate) — VALIDATION ADDED
  const onSaveAll = async () => {
    try {
      setIsSubmitting(true);

      // 1) Trigger validation on each form (returns boolean)
      const validStep1 = await step1Form.trigger();
      const validStep2 = await step2Form.trigger();
      const validStep3 = await step3Form.trigger();

      // If any step invalid, navigate user to the first invalid step and show toast
      if (!validStep1 || !validStep2 || !validStep3) {
        if (!validStep1) {
          const msgs = formatErrorsForStep(1);
          showValidationToast(1, msgs);
          setCurrentStep(1);
        } else if (!validStep2) {
          const msgs = formatErrorsForStep(2);
          showValidationToast(2, msgs);
          setCurrentStep(2);
        } else {
          const msgs = formatErrorsForStep(3);
          showValidationToast(3, msgs);
          setCurrentStep(3);
        }
        return;
      }

      // 2) All valid — collect data and simulate save
      const s1 = step1Form.getValues();
      const s2 = step2Form.getValues();
      const s3 = step3Form.getValues();
      const payload = { ...s1, ...s2, ...s3 };

      // simulate API call
      await new Promise((res) => setTimeout(res, 900));
      setCompletedSteps((prev) => Array.from(new Set([...prev, 4])));
      toast.success('All changes saved successfully!');
      console.log('Saved payload:', payload);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPublishEvent = async () => {
    // kept for backward compatibility if needed
    if (!eventId) {
      toast.error('Cannot publish event');
      return;
    }
    try {
      setIsSubmitting(true);
      await new Promise((res) => setTimeout(res, 800));
      setCompletedSteps((prev) => Array.from(new Set([...prev, 4])));
      toast.success('Event published successfully!');
      router.push('/events');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish event');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------
     Helpers to add fields
     --------------------------- */
  const addSpeaker = () => {
    const currentSpeakers = step3Form.getValues('speakers');
    appendSpeaker({
      name: '',
      title: '',
      company: '',
      bio: '',
      profileImage: '',
      order: currentSpeakers.length,
      socialLinks: {
        linkedin: '',
        twitter: '',
        website: '',
      },
    });
  };

  const addAgendaItem = () => {
    const currentAgenda = step3Form.getValues('agenda');
    appendAgendaItem({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      speakerName: '',
      sessionType: 'WORKSHOP',
      order: currentAgenda.length,
    });
  };

  /* ---------------------------
     Tab-click guard:
     When user clicks a tab, validate all previous steps and block if invalid
     --------------------------- */
  const handleTabClick = async (targetStep: number) => {
    if (targetStep <= currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    // validate each step from 1..targetStep-1
    for (let s = 1; s < targetStep; s++) {
      if (s === 1) {
        const ok = await step1Form.trigger();
        if (!ok) {
          const msgs = formatErrorsForStep(1);
          setCurrentStep(1);
          showValidationToast(1, msgs);
          return;
        }
      } else if (s === 2) {
        const ok = await step2Form.trigger();
        if (!ok) {
          const msgs = formatErrorsForStep(2);
          setCurrentStep(2);
          showValidationToast(2, msgs);
          return;
        }
      } else if (s === 3) {
        const ok = await step3Form.trigger();
        if (!ok) {
          const msgs = formatErrorsForStep(3);
          setCurrentStep(3);
          showValidationToast(3, msgs);
          return;
        }
      }
    }

    // all previous steps valid — allow navigation
    setCurrentStep(targetStep);
  };

  /* ---------------------------
     Render step functions
     --------------------------- */
  const renderStep1 = () => (
    <form onSubmit={step1Form.handleSubmit(onSubmitStep1)} className="space-y-6 p-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Basic Event Details</h2>
        <p className="mt-1 text-sm text-gray-500">Provide the basic information about your event.</p>
      </div> 
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            {...step1Form.register('title')}
            className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-11 px-3"
            placeholder="e.g., Tech Conference 2024"
          />
          {step1Form.formState.errors.title && (
            <p className="mt-1 text-sm text-red-600">{step1Form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            {...step1Form.register('description')}
            className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm px-3 py-2"
            placeholder="Describe your event in detail..."
          />
          {step1Form.formState.errors.description && (
            <p className="mt-1 text-sm text-red-600">{step1Form.formState.errors.description.message}</p>
          )}
        </div>

        {/* Meet Link */}
        <div>
          <label htmlFor="meetLink" className="block text-sm font-medium text-gray-700">
            Meet Link <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="meetLink"
            {...step1Form.register('meetLink')}
            className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray-500 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-11 px-3"
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
          />
          {step1Form.formState.errors.meetLink && (
            <p className="mt-1 text-sm text-red-600">{step1Form.formState.errors.meetLink.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700">
              Start Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="startDateTime"
              {...step1Form.register('startDateTime')}
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
              {...step1Form.register('endDateTime')}
              className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-11 px-3"
            />
            {step1Form.formState.errors.endDateTime && (
              <p className="mt-1 text-sm text-red-600">{step1Form.formState.errors.endDateTime.message}</p>
            )}
          </div>

        </div>

      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-5 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={step2Form.handleSubmit(onSubmitStep2)} className="space-y-6 p-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Event Configuration</h2>
        <p className="mt-1 text-sm text-gray-500">Configure pricing, capacity, and registration options.</p>
      </div>

      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900">Featured Image</h3>
          <div className="mt-4">
            <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="url"
              id="featuredImage"
              {...step2Form.register('featuredImage')}
              className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray-500 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-11 px-3"
              placeholder="https://example.com/event-banner.jpg"
            />
            {step2Form.formState.errors.featuredImage && (
              <p className="mt-1 text-sm text-red-600">{step2Form.formState.errors.featuredImage.message}</p>
            )}
          </div>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900">Pricing</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center">
              <input
                id="isFree"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                {...step2Form.register('isFree')}
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
                    {...step2Form.register('price', { valueAsNumber: true })}
                    className="block w-full pl-7 pr-12 sm:text-sm border border-gray-400 rounded-md text-black placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500 h-11"
                    placeholder="0.00"
                  />
                </div>
                {step2Form.formState.errors.price && (
                  <p className="mt-1 text-sm text-red-600">{step2Form.formState.errors.price.message}</p>
                )}
              </div>
            )}
          </div>
        </div>

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
              {...step2Form.register('maxAttendees', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-400 text-black placeholder-gray-500 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-11 px-3"
              placeholder="100"
            />
            {step2Form.formState.errors.maxAttendees && (
              <p className="mt-1 text-sm text-red-600">{step2Form.formState.errors.maxAttendees.message}</p>
            )}
          </div>
        </div>

      </div>

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
          {isSubmitting ? 'Saving...' : 'Save & Continue'}
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
                        {...step3Form.register(item.field as any)}
                        className="mt-1 block w-full rounded-md border border-black shadow-sm sm:text-sm placeholder:text-gray-400 text-black focus:border-black focus:ring-black px-3 py-2"
                        placeholder={item.placeholder}
                      />
                      {/* show inline errors for speaker fields */}
                      {step3Form.formState.errors?.speakers &&
                        (step3Form.formState.errors.speakers as any)[index] &&
                        (step3Form.formState.errors.speakers as any)[index][item.field.split('.').pop() || ''] && (
                          <p className="mt-1 text-sm text-red-600">
                            {
                              ((step3Form.formState.errors.speakers as any)[index][
                                item.field.split('.').pop() || ''
                              ] as any).message
                            }
                          </p>
                        )}
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
                        {...step3Form.register(item.field as any)}
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

  // Error summary for review — gathers top errors from each form to show
  const collectTopErrors = () => {
    const errs: { step: number; messages: string[] }[] = [];

    const e1 = step1Form.formState.errors;
    if (Object.keys(e1).length) {
      errs.push({
        step: 1,
        messages: Object.values(e1).map((v: any) => v?.message || 'Invalid value'),
      });
    }

    const e2 = step2Form.formState.errors;
    if (Object.keys(e2).length) {
      errs.push({
        step: 2,
        messages: Object.values(e2).map((v: any) => v?.message || 'Invalid value'),
      });
    }

    const e3 = step3Form.formState.errors;
    if (Object.keys(e3).length) {
      // flatten some nested speaker errors into readable text
      const msgs: string[] = [];
      if ((e3 as any).speakers) {
        (e3 as any).speakers.forEach((spErr: any, i: number) => {
          if (spErr) {
            for (const k of Object.keys(spErr)) {
              const m = spErr[k]?.message;
              if (m) msgs.push(`speakers[${i}].${k}: ${m}`);
            }
          }
        });
      }
      // other agenda errors (simple)
      if ((e3 as any).agenda) {
        (e3 as any).agenda.forEach((agErr: any, i: number) => {
          if (agErr) {
            for (const k of Object.keys(agErr)) {
              const m = agErr[k]?.message;
              if (m) msgs.push(`agenda[${i}].${k}: ${m}`);
            }
          }
        });
      }
      if (msgs.length === 0) {
        // fallback
        msgs.push(...Object.values(e3).map((v: any) => v?.message || 'Invalid value'));
      }
      errs.push({
        step: 3,
        messages: msgs,
      });
    }

    return errs;
  };

  const renderReviewDetails = () => {
    // gather values from all forms
    const s1 = step1Form.getValues();
    const s2 = step2Form.getValues();
    const s3 = step3Form.getValues();

    const topErrors = collectTopErrors();

    return (
      <div className="p-6 space-y-6">
        {/* show error summary if any */}
        {topErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
            <div className="font-medium mb-1">Please fix these errors before saving:</div>
            <ul className="list-disc ml-5">
              {topErrors.map((te) => (
                <li key={te.step}>
                  <strong>
                    {te.step === 1 ? 'Basic Details' : te.step === 2 ? 'Configuration' : 'Speakers & Agenda'}:
                  </strong>{' '}
                  {te.messages.slice(0, 3).join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        <section>
          <h3 className="text-lg font-semibold border-b text-black border-gray-300 pb-2">Basic Details</h3>
          <div className="mt-2 text-sm text-gray-700 space-y-1">
            <div><strong>Title:</strong> {s1.title || '—'}</div>
            <div><strong>Description:</strong> {s1.description || '—'}</div>
            <div><strong>Start:</strong> {s1.startDateTime || '—'}</div>
            <div><strong>End:</strong> {s1.endDateTime || '—'}</div>
            <div><strong>Venue Type:</strong> {s1.venueType}</div>
            <div><strong>Location:</strong> {s1.location || '—'}</div>
            <div><strong>Address:</strong> {s1.venueAddress || '—'}</div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold border-b text-black border-gray-300 pb-2">Configuration</h3>
          <div className="mt-2 text-sm text-gray-700 space-y-1">
            <div><strong>Featured Image:</strong> {s2.featuredImage || '—'}</div>
            <div><strong>Max Attendees:</strong> {s2.maxAttendees}</div>
            <div><strong>Price:</strong> {s2.isFree ? 'Free' : s2.price ?? '—'}</div>
            <div>
              <strong>Registration Fields:</strong>
              <ul className="list-disc ml-6">
                {s2.registrationFields?.length ? (
                  s2.registrationFields.map((f: any, i: number) => (
                    <li key={i}>{f.fieldName} {f.placeholder ? `— ${f.placeholder}` : ''}</li>
                  ))
                ) : (
                  <li>—</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold border-b text-black border-gray-300 pb-2">Speakers</h3>
          <div className="mt-2 text-sm text-gray-700 space-y-2">
            {s3.speakers?.length ? (
              s3.speakers.map((sp: any, i: number) => (
                <div key={i} className="border p-3 rounded">
                  <div><strong>{sp.name || '—'}</strong> — {sp.title || '—'}</div>
                  <div className="text-xs text-gray-600">{sp.company || ''}</div>
                  <div className="mt-1 text-sm">{sp.bio || ''}</div>
                </div>
              ))
            ) : (
              <div>—</div>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold border-b text-black border-gray-300 pb-2">Agenda</h3>
          <div className="mt-2 text-sm text-gray-700 space-y-2">
            {s3.agenda?.length ? (
              s3.agenda.map((ag: any, i: number) => (
                <div key={i} className="border p-3 rounded">
                  <div className="font-medium">{ag.title}</div>
                  <div className="text-xs text-gray-600">{ag.startTime} — {ag.endTime}</div>
                  <div className="mt-1 text-sm">{ag.description}</div>
                  <div className="text-xs text-gray-500 mt-1">Speaker: {ag.speakerName || '—'} • Type: {ag.sessionType}</div>
                </div>
              ))
            ) : (
              <div>—</div>
            )}
          </div>
        </section>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Top of review: show only Back and Save Changes */}
      <div className="flex items-center justify-between p-6 border-b bg-white rounded-t-lg">
        <button
          type="button"
          onClick={() => goToStep(3)}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Back
        </button>

        <div>
          <button
            type="button"
            onClick={onSaveAll}
            disabled={isSubmitting}
            className={`inline-flex items-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 ${
              allValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-b-lg">
        {/* Full details summary + error summary */}
        {renderReviewDetails()}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    if (loading) {
      return (
        <div className="p-12 text-center">
          <div className="text-lg font-medium mb-2">Loading event…</div>
          <div className="text-sm text-gray-500">Fetching event details to edit. Please wait.</div>
        </div>
      );
    }
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
        {/* Header with Back button + Title (no event id) */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back button + title side-by-side */}
            <button
              onClick={() => {
                try {
                  router.back();
                } catch {
                  router.push('/events');
                }
              }}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              ← Back
            </button>

            <h1 className="text-lg font-semibold text-gray-900">Edit Event</h1>
          </div>

          {/* empty right side for balance - removed eventId display */}
          <div />
        </div>

        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center space-x-6">
              {tabs.map((tab, index) => {
                const step = index + 1;
                const isActive = currentStep === step;
                const isDone = currentStep > step || isStepComplete(step);

                return (
                  <li key={tab.id}>
                    <button
                      type="button"
                      onClick={() => handleTabClick(step)}
                      className="flex items-center space-x-2 focus:outline-none hover:opacity-90"
                      style={{ cursor: 'pointer' }} // explicit pointer on hover
                    >
                      <div
                        className={`relative flex h-8 w-8 items-center justify-center rounded-full ${isDone
                          ? 'bg-indigo-600'
                          : isActive
                            ? 'border-2 border-indigo-600 bg-white'
                            : 'border-2 border-gray-300 bg-white'
                          }`}
                      >
                        {isDone ? (
                          <CheckCircleIcon className="h-5 w-5 text-white" />
                        ) : (
                          <span className={`text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                            {step}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                        {tab.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">{renderCurrentStep()}</div>
      </div>
    </div>
  );
}
