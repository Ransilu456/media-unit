import React from 'react';
import { StatusBadge } from '@/components/ui/Badge';
import type { Competition, FormField } from '@/lib/types';

type CompetitionPreviewData = Omit<Competition, 'id'>;

const previewInputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-500 placeholder:text-slate-400';

function PreviewField({ field }: { field: FormField }) {
  const placeholder = field.placeholder || 'Enter your answer';

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {field.label}{field.required ? ' *' : ''}
      </label>
      {field.type === 'textarea' ? (
        <textarea disabled rows={2} placeholder={placeholder} className={previewInputClass} />
      ) : field.type === 'select' ? (
        <select disabled defaultValue="" className={previewInputClass}>
          <option value="">{placeholder}</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input disabled type={field.type} placeholder={placeholder} className={previewInputClass} />
      )}
      {field.helperText && <p className="mt-1 text-[11px] text-slate-500">{field.helperText}</p>}
    </div>
  );
}

export function CompetitionPreviewPanel({
  competition,
}: {
  competition: CompetitionPreviewData;
}) {
  return (
    <div className="space-y-5" aria-label="Competition preview">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
        Preview only. This is how the competition details and entry questions will appear to schools.
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-800">
            {competition.category}
          </span>
          <div className="flex items-center gap-2">
            {competition.medium !== 'None' && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                {competition.medium}
              </span>
            )}
            <StatusBadge status={competition.status} />
          </div>
        </div>

        <h3 className="text-xl font-bold tracking-tight text-slate-950">{competition.title || 'Competition title'}</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {competition.description || 'Competition description will appear here.'}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-xs">
          <div>
            <dt className="text-slate-500">Deadline</dt>
            <dd className="mt-1 font-semibold text-slate-900">{competition.deadline || 'Not set'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Entries per school</dt>
            <dd className="mt-1 font-semibold text-slate-900">{competition.maxEntriesPerSchool}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-slate-500">Eligibility</dt>
            <dd className="mt-1 font-semibold text-slate-900">{competition.eligibility || 'Not set'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-slate-500">Awards</dt>
            <dd className="mt-1 font-semibold text-slate-900">{competition.prizePool || 'Not set'}</dd>
          </div>
          {competition.ageCategory && (
            <div className="col-span-2">
              <dt className="text-slate-500">Age / grade eligibility</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {competition.ageCategory.label}: ages {competition.ageCategory.minAge}–{competition.ageCategory.maxAge}
                {' · '}{competition.ageCategory.grades.join(', ')}
              </dd>
            </div>
          )}
        </dl>

        {competition.guidelines.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requirements</h4>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700">
              {competition.guidelines.map((guideline, index) => <li key={`${guideline}-${index}`}>{guideline}</li>)}
            </ul>
          </div>
        )}
      </article>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-900">Entry form preview</h3>
        <p className="mb-4 mt-1 text-xs text-slate-500">Schools will enter these details after choosing this competition.</p>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Student full name *</label>
            <input disabled placeholder="Full student name" className={previewInputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Date of birth *</label>
            <input disabled type="date" className={previewInputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Current grade *</label>
            <select disabled defaultValue="" className={previewInputClass}>
              <option value="">Choose a grade</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Student / parent contact *</label>
            <input disabled type="tel" placeholder="e.g. 077 123 4567" className={previewInputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Entry / project title *</label>
            <input disabled placeholder="Enter the title of the work" className={previewInputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Submission link *</label>
            <input disabled type="url" placeholder="https://drive.google.com/..." className={previewInputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Synopsis / concept description *</label>
            <textarea disabled rows={2} placeholder="Describe the idea behind this entry" className={previewInputClass} />
          </div>
          {(competition.customFields ?? []).map((field) => <PreviewField key={field.id} field={field} />)}
          {(competition.customFields ?? []).length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
              No additional questions have been added.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
