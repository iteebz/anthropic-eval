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
  className: z.string().optional(),
  onSendMessage: z.any().optional()
});

type ContactFormData = z.infer<typeof ContactFormSchema>;

export function ContactForm(props: ContactFormData) {
  const { onSendMessage, ...data } = props;
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
        onSendMessage?.(JSON.stringify({
          type: 'contact-form-submission',
          formData,
          status: 'success'
        }));
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
    const baseClasses = "w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
    const errorClasses = "border-destructive"
    
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
                <p className="text-sm text-destructive">{field.label} is required</p>
              )}
            </div>
          );
        })}

        {submitStatus === 'success' && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded p-4">
            <span className="text-emerald-600 dark:text-emerald-400">✓ Message sent successfully!</span>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-destructive/10 border border-destructive/20 rounded p-4">
            <span className="text-destructive">✗ Error sending message. Please try again.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground py-2 px-4 rounded-md transition-colors"
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