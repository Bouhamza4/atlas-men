'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import './CategoriesSection.css'

interface Category {
  id: string
  name: string
  slug: string
  image_url?: string | null
  created_at?: string | null
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data, error }) => {
      if (data) setCategories(data)
    })
  }, [])

  return (
    <section className="categories-section">
      <h2>Shop By Category</h2>
      <div className="categories-grid">
        {categories.map((cat, index) => (
          <Link 
            key={cat.id} 
            href={`/products?category=${cat.slug}`} 
            className="category-card"
            style={{ animationDelay: `${index * 0.1 + 0.1}s` }}
          >
            {cat.image_url && <img src={cat.image_url} alt={cat.name} />}
            <h3>{cat.name}</h3>
            <div className="overlay">
              <span>View Collection</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}