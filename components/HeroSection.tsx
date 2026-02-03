"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import './HeroSection.css'

export default function HeroSection() {
  const [floatingElements, setFloatingElements] = useState<React.ReactElement[]>([])

  useEffect(() => {
    const elements = Array.from({ length: 15 }).map((_, i) => {
      const style = {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 30 + 10}px`,
        height: `${Math.random() * 30 + 10}px`,
        animationDelay: `${Math.random() * 20}s`,
        animationDuration: `${Math.random() * 20 + 20}s`,
        background: `rgba(201, 162, 77, ${Math.random() * 0.3 + 0.1})`,
      }
      return <div key={i} className="floating-element" style={style} />
    })
    setFloatingElements(elements)
  }, [])

  return (
    <section className="hero-section">
      <div className="floating-elements">
        {floatingElements}
      </div>
      <div className="hero-content">
        <h1 className="hero-title">Dress Like a Gentleman</h1>
        <p className="hero-subtitle">Premium menswear for the modern aristocrat</p>
        <Link href="/products">
          <button className="hero-btn">
            Discover Collection
          </button>
        </Link>
      </div>
    </section>
  )
}