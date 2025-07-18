import React, { useState } from 'react';
import { z } from 'zod';
import { registerComponent } from '../../registry/unified';

const ContactFormSchema = z.object({
  fields: z.array(z.object({
    name: z.string(),
    type: z.string(),
    label: z.string(),
    required: z.boolean().optional(),
    placeholder: z.string().optional()
  })),
  action: z.string().optional(),
  submitText: z.string().optional(),
  className: z.string().optional()
});

type ContactFormData = z.infer<typeof ContactFormSchema>;

export function ContactForm(props: ContactFormData) {
  const data = props;
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch(data.action || '/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({})
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: ContactFormData['fields'][0]) => {
    const baseClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
    const errorClasses = "border-red-500 dark:border-red-400"
    
    const fieldValue = formData[field.name] || ''
    const isRequired = field.required ?? false
    const hasError = isRequired && !fieldValue && submitStatus === 'error'

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={isRequired}
            rows={4}
            className={`${baseClasses} ${hasError ? errorClasses : ''}`}
            aria-describedby={hasError ? `${field.name}-error` : undefined}
          />
        )
      case 'email':
        return (
          <input
            type="email"
            id={field.name}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={isRequired}
            className={`${baseClasses} ${hasError ? errorClasses : ''}`}
            aria-describedby={hasError ? `${field.name}-error` : undefined}
          />
        )
      case 'tel':
        return (
          <input
            type="tel"
            id={field.name}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={isRequired}
            className={`${baseClasses} ${hasError ? errorClasses : ''}`}
            aria-describedby={hasError ? `${field.name}-error` : undefined}
          />
        )
      default:
        return (
          <input
            type="text"
            id={field.name}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={isRequired}
            className={`${baseClasses} ${hasError ? errorClasses : ''}`}
            aria-describedby={hasError ? `${field.name}-error` : undefined}
          />
        )
    }
  }

  return (
    <div className={`max-w-2xl mx-auto ${data.className || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {data.fields.map((field) => {
          const isRequired = field.required ?? false;
          const hasError = isRequired && !formData[field.name] && submitStatus === 'error';
          
          return (
            <div key={field.name} className="space-y-2">
              <label htmlFor={field.name} className="block text-sm font-medium">
                {field.label}{isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
              {hasError && (
                <p className="text-sm text-red-600">{field.label} is required</p>
              )}
            </div>
          );
        })}

        {submitStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <span className="text-green-600">✓ Message sent successfully!</span>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <span className="text-red-600">✗ Error sending message. Please try again.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded"
        >
          {isSubmitting ? 'Sending...' : (data.submitText || 'Send Message')}
        </button>
      </form>
    </div>
  );
}

// Register with unified registry
registerComponent({
  type: 'contact-form',
  schema: ContactFormSchema,
  render: ContactForm
});