import React, { useState } from 'react'
import { z } from 'zod'

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
})

type ContactFormData = z.infer<typeof ContactFormSchema>

interface ContactFormProps {
  data: ContactFormData
}

export function ContactForm({ data }: ContactFormProps) {
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
          const isRequired = field.required ?? false
          const hasError = isRequired && !formData[field.name] && submitStatus === 'error'
          
          return (
            <div key={field.name} className="space-y-2">
              <label 
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {field.label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
              {hasError && (
                <p 
                  id={`${field.name}-error`}
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {field.label} is required
                </p>
              )}
            </div>
          )
        })}

        {submitStatus === 'success' && (
          <div 
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4"
            role="alert"
          >
            <div className="flex items-center">
              <div className="text-green-400 mr-2">✓</div>
              <p className="text-sm text-green-800 dark:text-green-200">
                Message sent successfully! I'll get back to you soon.
              </p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div 
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4"
            role="alert"
          >
            <div className="flex items-center">
              <div className="text-red-400 mr-2">✗</div>
              <p className="text-sm text-red-800 dark:text-red-200">
                There was an error sending your message. Please try again.
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          {isSubmitting ? 'Sending...' : (data.submitText || 'Send Message')}
        </button>
      </form>
    </div>
  )
}