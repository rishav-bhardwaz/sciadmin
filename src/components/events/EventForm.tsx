'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DocumentTextIcon,
  PhotoIcon,
  UserGroupIcon,
  CogIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().min(1, 'End date is required'),
  endTime: z.string().min(1, 'End time is required'),
  venue: z.string().min(1, 'Venue is required'),
  venueType: z.enum(['online', 'physical']),
  venueLink: z.string().optional(),
  maxAttendees: z.number().min(1, 'Max attendees must be at least 1'),
  registrationFields: z.array(z.object({
    name: z.string(),
    type: z.enum(['text', 'email', 'phone', 'select']),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
  })),
  speakers: z.array(z.object({
    name: z.string(),
    bio: z.string(),
    photo: z.string().optional(),
  })),
  agenda: z.array(z.object({
    time: z.string(),
    title: z.string(),
    description: z.string(),
    speaker: z.string().optional(),
  })),
  status: z.enum(['draft', 'published']),
  sendNotification: z.boolean(),
  metaDescription: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

const tabs = [
  { id: 'details', name: 'Core Details', icon: DocumentTextIcon },
  { id: 'media', name: 'Media & Registration', icon: PhotoIcon },
  { id: 'speakers', name: 'Speakers & Agenda', icon: UserGroupIcon },
  { id: 'publishing', name: 'Publishing Controls', icon: CogIcon },
];

export default function EventForm() {
  const [activeTab, setActiveTab] = useState('details');
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      venueType: 'physical',
      status: 'draft',
      sendNotification: false,
      registrationFields: [
        { name: 'Full Name', type: 'text', required: true },
        { name: 'Email', type: 'email', required: true },
      ],
      speakers: [],
      agenda: [],
    },
  });

  const venueType = watch('venueType');
  const registrationFields = watch('registrationFields') || [];
  const speakers = watch('speakers') || [];
  const agenda = watch('agenda') || [];

  const onSubmit = (data: EventFormData) => {
    console.log('Event data:', data);
    // Handle form submission
  };

  const addRegistrationField = () => {
    const newField = { name: '', type: 'text' as const, required: false };
    setValue('registrationFields', [...registrationFields, newField]);
  };

  const removeRegistrationField = (index: number) => {
    const updated = registrationFields.filter((_, i) => i !== index);
    setValue('registrationFields', updated);
  };

  const addSpeaker = () => {
    const newSpeaker = { name: '', bio: '', photo: '' };
    setValue('speakers', [...speakers, newSpeaker]);
  };

  const removeSpeaker = (index: number) => {
    const updated = speakers.filter((_, i) => i !== index);
    setValue('speakers', updated);
  };

  const addAgendaItem = () => {
    const newItem = { time: '', title: '', description: '', speaker: '' };
    setValue('agenda', [...agenda, newItem]);
  };

  const removeAgendaItem = (index: number) => {
    const updated = agenda.filter((_, i) => i !== index);
    setValue('agenda', updated);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <tab.icon
                className={clsx(
                  'mr-2 h-5 w-5',
                  activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Core Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black">Event Title</label>
              <input
                type="text"
                {...register('title')}
                className="mt-1 pl-2 block h-10 w-full border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter event title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black">Description</label>
              <textarea
                {...register('description')}
                rows={6}
                className="mt-1 h-10 pl-2 block w-full border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Describe your event in detail..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black">Start Date</label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="mt-1 block w-full h-10 pl-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Start Time</label>
                <input
                  type="time"
                  {...register('startTime')}
                  className="mt-1 block w-full h-10 pl-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black">End Date</label>
                <input
                  type="date"
                  {...register('endDate')}
                  className="mt-1 block w-full h-10 pl-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-black">End Time</label>
                <input
                  type="time"
                  {...register('endTime')}
                  className="mt-1 block w-full h-10 pl-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black">Venue Type</label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register('venueType')}
                    value="physical"
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-black">Physical Location</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register('venueType')}
                    value="online"
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-black">Online Event</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium  text-black">
                {venueType === 'online' ? 'Meeting Link' : 'Venue Address'}
              </label>
              <input
                type="text"
                {...register('venue')}
                className="mt-1 block w-full h-10 pl-2 border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={venueType === 'online' ? 'https://zoom.us/j/...' : 'Enter venue address'}
              />
              {errors.venue && <p className="mt-1 text-sm text-red-600">{errors.venue.message}</p>}
            </div>
          </div>
        )}

        {/* Media & Registration Tab */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black">Featured Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black">Max Attendees</label>
              <input
                type="number"
                {...register('maxAttendees', { valueAsNumber: true })}
                className="mt-1 h-10 pl-2 block w-full border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter maximum number of attendees"
              />
              {errors.maxAttendees && <p className="mt-1 text-sm text-red-600">{errors.maxAttendees.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-black">Registration Form Fields</label>
                <button
                  type="button"
                  onClick={addRegistrationField}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Field
                </button>
              </div>
              
              <div className="mt-3 space-y-3">
                {registrationFields.map((field, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                    <input
                      type="text"
                      placeholder="Field name"
                      {...register(`registrationFields.${index}.name`)}
                      className="flex-1 h-10 pl-2 border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <select
                      {...register(`registrationFields.${index}.type`)}
                      className="h-10 pl-2 border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="select">Select</option>
                    </select>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        {...register(`registrationFields.${index}.required`)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-black">Required</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeRegistrationField(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Speakers & Agenda Tab */}
        {activeTab === 'speakers' && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-black">Speakers</label>
                <button
                  type="button"
                  onClick={addSpeaker}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Speaker
                </button>
              </div>
              
              <div className="mt-3 space-y-4">
                {speakers.map((speaker, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          placeholder="Speaker name"
                          {...register(`speakers.${index}.name`)}
                          className="block w-full h-10 pl-2 border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <textarea
                          placeholder="Speaker bio"
                          {...register(`speakers.${index}.bio`)}
                          rows={3}
                          className="block w-full h-10 pl-2 border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <input
                          type="url"
                          placeholder="Photo URL (optional)"
                          {...register(`speakers.${index}.photo`)}
                          className="block w-full h-10 pl-2 border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpeaker(index)}
                        className="ml-3 text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-black">Event Agenda</label>
                <button
                  type="button"
                  onClick={addAgendaItem}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Agenda Item
                </button>
              </div>
              
              <div className="mt-3 space-y-3">
                {agenda.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                    <input
                      type="time"
                      {...register(`agenda.${index}.time`)}
                      className="h-10 pl-2 border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Session title"
                      {...register(`agenda.${index}.title`)}
                      className="flex-1 h-10 pl-2 border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      {...register(`agenda.${index}.description`)}
                      className="flex-1 h-10 pl-2 border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Speaker (optional)"
                      {...register(`agenda.${index}.speaker`)}
                      className="w-32 h-10 pl-2 border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeAgendaItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Publishing Controls Tab */}
        {activeTab === 'publishing' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black">Publication Status</label>
              <div className="mt-2 space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register('status')}
                    value="draft"
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-black">Save as Draft</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register('status')}
                    value="published"
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-black">Publish Event</span>
                </label>
              </div>
            </div>

            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  {...register('sendNotification')}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm font-medium text-black">
                  Send notification to all users when published
                </span>
              </label>
              <p className="mt-1 text-sm text-gray-500">
                This will send an email notification to all registered users about the new event.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black">SEO Meta Description</label>
              <textarea
                {...register('metaDescription')}
                rows={3}
                className="mt-1 h-10 pl-2 block w-full border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Brief description for search engines (optional)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Recommended length: 150-160 characters
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <div className="flex space-x-3">
          <button
            type="submit"
            onClick={() => setValue('status', 'draft')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            onClick={() => setValue('status', 'published')}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Publish Event
          </button>
        </div>
      </div>
    </form>
  );
}
