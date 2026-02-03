'use client'
import { useState, useEffect } from 'react'
import './TestimonialsSection.css'

const testimonials = [
  {
    id: 1,
    name: "Alexander Pierce",
    role: "Fashion Director",
    content: "The quality and craftsmanship of these pieces are unparalleled. Truly luxury redefined.",
    avatar: "AP"
  },
  {
    id: 2,
    name: "James Montgomery",
    role: "Business Executive",
    content: "Every piece I've purchased has exceeded expectations. The perfect blend of style and comfort.",
    avatar: "JM"
  },
  {
    id: 3,
    name: "Michael Sterling",
    role: "Designer",
    content: "Attention to detail is what sets this brand apart. Exceptional quality in every stitch.",
    avatar: "MS"
  }
]

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="testimonials-section">
      <h2>Client Testimonials</h2>
      <div className="testimonials-container">
        {testimonials.map((testimonial, index) => (
          <div 
            key={testimonial.id}
            className={`testimonial-card ${index === activeIndex ? 'active' : ''}`}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="testimonial-avatar">
              {testimonial.avatar}
            </div>
            <p className="testimonial-content">"{testimonial.content}"</p>
            <h3 className="testimonial-name">{testimonial.name}</h3>
            <p className="testimonial-role">{testimonial.role}</p>
          </div>
        ))}
      </div>
      <div className="testimonial-dots">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  )
}