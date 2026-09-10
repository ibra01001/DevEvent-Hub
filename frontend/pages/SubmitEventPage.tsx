import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  MapPin,
  Globe,
  Upload,
  Layers,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Eye,
  Info
} from 'lucide-react';
import { eventApi } from '../services/api.ts';
import { EventType, LocationType, IEvent } from '../types.ts';
import { EventCard } from '../components/EventCard.tsx';
import { useToast } from '../context/ToastContext.tsx';

const CURATED_COVERS = [
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
];

const AVAILABLE_TECHS = [
  'React',
  'TypeScript',
  'Python',
  'AI',
  'Node.js',
  'Rust',
  'Tech Stack',
  'Hardware',
  'Delivery',
  'Freelance',
  'Web3',
  'Blockchain',
  'Cloud',
  'DevOps',
  'Mobile'
];

export const SubmitEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    type: 'hackathon' as EventType,
    technologies: ['React', 'TypeScript'] as string[],
    newTechInput: '',
    startDate: '',
    endDate: '',
    locationType: 'online' as LocationType,
    location: 'Global / Virtual Livestream',
    onlineUrl: 'https://deveventhub.com/join-stream',
    website: '',
    coverImage: CURATED_COVERS[0],
    customCover: '',
    participantsLimit: 500,
    prizePool: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Synchronous validation
  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Event title is required.';
    if (!formData.description.trim()) errors.description = 'Short description is required.';
    if (formData.description.trim().length > 300) errors.description = 'Description should be under 300 characters.';
    if (!formData.startDate) errors.startDate = 'Start date is required.';
    if (!formData.endDate) errors.endDate = 'End date is required.';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.endDate = 'End date cannot be earlier than start date.';
    }
    if (formData.technologies.length === 0) {
      errors.technologies = 'Please select at least one technology.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !formData.technologies.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, trimmed],
        newTechInput: ''
      }));
    }
  };

  const handleRemoveTech = (techToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== techToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toastError('Validation Failed', 'Please fix the highlighted errors before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      let coverImage = formData.customCover.trim() || formData.coverImage;

      if (formData.customCover && formData.customCover.startsWith('data:')) {
        const file = await fetch(formData.customCover).then(res => res.blob());
        const eventFolderName = formData.title.trim() || 'untitled-event';
        const uploaded = await eventApi.uploadImage(
          new File([file], `${eventFolderName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-cover`, { type: file.type || 'image/jpeg' }),
          eventFolderName
        );
        coverImage = uploaded.data.url;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        longDescription: formData.longDescription.trim() || formData.description.trim(),
        type: formData.type,
        technologies: formData.technologies,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        locationType: formData.locationType,
        location: formData.location.trim() || (formData.locationType === 'online' ? 'Online' : 'TBD'),
        onlineUrl: formData.onlineUrl.trim() || undefined,
        organizer: 'Community Organizer',
        organizerEmail: 'community@deveventhub.com',
        website: formData.website.trim() || undefined,
        coverImage,
        participantsLimit: Number(formData.participantsLimit) || undefined,
        prizePool: formData.prizePool.trim() || undefined,
        status: 'pending' as const
      };

      await eventApi.createEvent(payload);
      success('Event Submitted Successfully!', 'Your event is now in the organizer review queue.');
      navigate('/organizer');
    } catch (err: any) {
      console.error('Submit error:', err);
      toastError('Submission Error', err.message || 'Failed to submit event to server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toastError('Invalid image', 'Please choose a valid image file (JPG, PNG, WEBP, GIF).');
      event.target.value = '';
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      const result = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read the selected image.'));
        reader.readAsDataURL(file);
      });

      setFormData(prev => ({
        ...prev,
        customCover: result,
        coverImage: result
      }));
      success('Image selected', 'Your image is ready and will be uploaded to Cloudinary only when you submit the form.');
    } catch (err: any) {
      toastError('Image selection failed', err.message || 'Unable to prepare the image for upload.');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  // Construct preview event object for the Live Event Card preview
  const previewEvent: IEvent = {
    _id: 'preview-id',
    slug: 'preview-event',
    title: formData.title || 'Your Event Title Will Appear Here',
    description: formData.description || 'Provide a compelling short summary explaining what participants will build, learn, or experience at your event.',
    type: formData.type,
    technologies: formData.technologies.length > 0 ? formData.technologies : ['React', 'TypeScript'],
    startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date(Date.now() + 86400000 * 7).toISOString(),
    endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date(Date.now() + 86400000 * 8).toISOString(),
    locationType: formData.locationType,
    location: formData.location || 'Online',
    organizer: 'Community Organizer',
    organizerEmail: 'community@deveventhub.com',
    coverImage: formData.customCover || formData.coverImage,
    status: 'pending',
    featured: false,
    currentParticipants: 1,
    participantsLimit: formData.participantsLimit,
    prizePool: formData.prizePool,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 min-h-screen">
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-700 dark:text-cyan-300 border border-violet-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Organizer Submission Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Submit a Tech Event
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
          List your hackathon, meetup, conference, or workshop on DevEvent Hub. Submissions are reviewed and listed in our global developer discovery directory.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Form (7 cols on lg) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
          {/* Section 1: Basic Information */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-600 text-white text-xs flex items-center justify-center font-mono">
                1
              </span>
              <span>General Information</span>
            </h2>

            {/* Event Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Event Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="event-input-title"
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Global AI & Agents Hackathon 2026"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all ${
                  formErrors.title ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-700'
                }`}
              />
              {formErrors.title && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{formErrors.title}</span>
                </p>
              )}
            </div>

            {/* Event Type & Prize Pool */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Event Type <span className="text-rose-500">*</span>
                </label>
                <select
                  id="event-input-type"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as EventType })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="hackathon">Hackathon</option>
                  <option value="meetup">Meetup</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="webinar">Webinar</option>
                  <option value="competition">Competition</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Prize Pool / Bounties (Optional)
                </label>
                <input
                  type="text"
                  value={formData.prizePool}
                  onChange={e => setFormData({ ...formData, prizePool: e.target.value })}
                  placeholder="e.g. $50,000 in bounties"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Short Description (Cards & Previews) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="A concise summary of the theme, challenges, and goals (max 300 chars)"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all ${
                  formErrors.description ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-700'
                }`}
              />
              {formErrors.description && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{formErrors.description}</span>
                </p>
              )}
            </div>

            {/* Long Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Full Event Details (Markdown / Detailed Overview)
              </label>
              <textarea
                rows={4}
                value={formData.longDescription}
                onChange={e => setFormData({ ...formData, longDescription: e.target.value })}
                placeholder="Include eligibility, rules, tracks, speakers, and instructions for participants..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Section 2: Technologies */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-600 text-white text-xs flex items-center justify-center font-mono">
                2
              </span>
              <span>Tags</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Selected Tags <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3 min-h-[38px] p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                {formData.technologies.map(t => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-600 text-white text-xs font-medium"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(t)}
                      className="hover:text-rose-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {formErrors.technologies && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{formErrors.technologies}</span>
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <input
                  type="text"
                  value={formData.newTechInput}
                  onChange={e => setFormData({ ...formData, newTechInput: e.target.value })}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTech(formData.newTechInput);
                    }
                  }}
                  placeholder="Add a custom tags (e.g. Technologies, Supabase, AI Agents)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddTech(formData.newTechInput)}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-violet-500/40 bg-violet-500/10 text-xs font-semibold text-violet-700 dark:text-violet-200 hover:bg-violet-500/15"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Tech
                </button>
              </div>

              {/* Quick Add Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-xs text-zinc-400 py-1 mr-1">Suggestions:</span>
                {AVAILABLE_TECHS.filter(t => !formData.technologies.includes(t)).slice(0, 8).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleAddTech(t)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-violet-500"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Date, Time & Location */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-600 text-white text-xs flex items-center justify-center font-mono">
                3
              </span>
              <span>Schedule & Location</span>
            </h2>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Start Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                {formErrors.startDate && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  End Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                {formErrors.endDate && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.endDate}</p>
                )}
              </div>
            </div>

            {/* Location Format */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Location Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.locationType}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      locationType: e.target.value as LocationType,
                      location: e.target.value === 'online' ? 'Online / Virtual' : formData.location
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Location / Venue Description
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder={formData.locationType === 'online' ? 'Online Stream, Discord, or YouTube' : 'City, Venue name or Address'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Online URL & Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Online Stream / Meeting URL
                </label>
                <input
                  type="url"
                  value={formData.onlineUrl}
                  onChange={e => setFormData({ ...formData, onlineUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Attendee Capacity
                </label>
                <input
                  type="number"
                  value={formData.participantsLimit}
                  onChange={e => setFormData({ ...formData, participantsLimit: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Cover Image */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-600 text-white text-xs flex items-center justify-center font-mono">
                4
              </span>
              <span>Cover Image</span>
            </h2>

            {/* Curated Cover Picks */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Choose a Cover Banner
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                {CURATED_COVERS.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setFormData({ ...formData, coverImage: img, customCover: '' })}
                    className={`cursor-pointer rounded-xl overflow-hidden h-16 border-2 transition-all ${
                      formData.coverImage === img && !formData.customCover
                        ? 'border-violet-600 scale-102 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="url"
                  value={formData.customCover}
                  onChange={e => setFormData({ ...formData, customCover: e.target.value })}
                  placeholder="Or paste a custom image URL (https://...)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2.5 text-xs font-semibold text-violet-700 dark:text-violet-200">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'Preparing image...' : 'Choose image'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="px-5 py-3 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              id="submit-event-submit-button"
              type="submit"
              disabled={submitting}
              className="px-7 py-3 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Submitting to Review...' : 'Submit Event for Review'}
            </button>
          </div>
        </form>

        {/* Right Live Preview Sticky Column (5 cols on lg) */}
        <aside className="lg:col-span-5 hidden lg:block sticky top-24 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Card Preview</span>
            </span>
            <span className="text-[11px] text-zinc-500">Real-time update</span>
          </div>

          {/* The live card */}
          <div className="w-full max-w-sm mx-auto shadow-2xl rounded-2xl">
            <EventCard event={previewEvent} />
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
              <Info className="w-3.5 h-3.5 text-violet-500" />
              <span>Review Guidelines</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Submissions undergo automated verification and curator review. Approved events typically appear in the search index and homepage within minutes.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
