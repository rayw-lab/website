import { useState } from 'react'

interface FormState {
  name: string
  email: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

const emptyForm: FormState = { name: '', email: '', message: '' }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.name.trim()) errors.name = 'Please tell me your name.'
  if (!form.email.trim()) {
    errors.email = 'An email is required so I can reply.'
  } else if (!emailPattern.test(form.email.trim())) {
    errors.email = 'That doesn’t look like a valid email.'
  }
  if (!form.message.trim()) {
    errors.message = 'Your message can’t be empty.'
  } else if (form.message.trim().length < 10) {
    errors.message = 'A little more detail, please (10+ characters).'
  }
  return errors
}

export default function Contact() {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      setSubmitted(true)
      setForm(emptyForm)
    }
  }

  return (
    <section className="section" id="contact">
      <div className="section__header">
        <span className="section__index">03.</span>
        <h2 className="section__title">Get in touch</h2>
      </div>
      <p className="contact__lead">
        Have a project in mind, a question, or just want to say hello? Drop me a
        message and I&apos;ll get back to you.
      </p>

      {submitted ? (
        <div className="contact__success" role="status">
          <span className="contact__success-icon" aria-hidden="true">
            ✓
          </span>
          <div>
            <strong>Thanks — your message is on its way!</strong>
            <p>I&apos;ll be in touch soon.</p>
          </div>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setSubmitted(false)}
          >
            Send another
          </button>
        </div>
      ) : (
        <form className="contact__form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              aria-invalid={Boolean(errors.name)}
              placeholder="Ada Lovelace"
            />
            {errors.name && <span className="field__error">{errors.name}</span>}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
              placeholder="ada@example.com"
            />
            {errors.email && (
              <span className="field__error">{errors.email}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              aria-invalid={Boolean(errors.message)}
              placeholder="Tell me a little about what you have in mind…"
            />
            {errors.message && (
              <span className="field__error">{errors.message}</span>
            )}
          </div>

          <button type="submit" className="btn btn--primary">
            Send message
          </button>
        </form>
      )}
    </section>
  )
}
