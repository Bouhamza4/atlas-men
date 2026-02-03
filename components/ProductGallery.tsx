'use client'
import { useState, useRef, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiMaximize } from 'react-icons/fi'
import './ProductGallery.css'

interface ProductGalleryProps {
  mainImage: string
  images?: string[]
}

export default function ProductGallery({ mainImage, images = [] }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(mainImage)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mainImageRef = useRef<HTMLDivElement>(null)

  const allImages = [mainImage, ...images]

  const handleThumbnailClick = (image: string, index: number) => {
    setSelectedImage(image)
    setCurrentIndex(index)
  }

  const handleZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    })
  }

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % allImages.length
    setCurrentIndex(nextIndex)
    setSelectedImage(allImages[nextIndex])
  }

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length
    setCurrentIndex(prevIndex)
    setSelectedImage(allImages[prevIndex])
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && mainImageRef.current) {
      mainImageRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else if (document.fullscreenElement) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div className="product-gallery-container">
      {/* Main Image Container */}
      <div 
        ref={mainImageRef}
        className={`main-image-container ${isZoomed ? 'zoomed' : ''} ${isFullscreen ? 'fullscreen' : ''}`}
        onMouseMove={handleZoom}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {/* Navigation Arrows */}
        <button className="nav-btn prev-btn" onClick={handlePrev} aria-label="Previous image">
          <FiChevronLeft />
        </button>
        
        <button className="nav-btn next-btn" onClick={handleNext} aria-label="Next image">
          <FiChevronRight />
        </button>

        {/* Main Image */}
        <div className="main-image-wrapper">
          <img 
            src={selectedImage} 
            alt="Product"
            className="main-image"
            loading="eager"
          />
          
          {/* Zoom Overlay */}
          {isZoomed && (
            <div 
              className="zoom-overlay"
              style={{
                backgroundImage: `url(${selectedImage})`,
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`
              }}
            />
          )}

          {/* Zoom Indicator */}
          <div className="zoom-indicator">
            <FiZoomIn />
            <span>Hover to zoom</span>
          </div>
        </div>

        {/* Image Controls */}
        <div className="image-controls">
          <button 
            className="control-btn zoom-btn"
            onClick={() => setIsZoomed(!isZoomed)}
            aria-label={isZoomed ? "Disable zoom" : "Enable zoom"}
          >
            <FiZoomIn />
          </button>
          
          <button 
            className="control-btn fullscreen-btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <FiMaximize />
          </button>
        </div>

        {/* Image Counter */}
        <div className="image-counter">
          <span className="current">{currentIndex + 1}</span>
          <span className="separator">/</span>
          <span className="total">{allImages.length}</span>
        </div>
      </div>

      {/* Thumbnails Gallery */}
      {allImages.length > 1 && (
        <div className="thumbnails-container">
          {allImages.map((image, index) => (
            <button
              key={index}
              className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleThumbnailClick(image, index)}
              aria-label={`View image ${index + 1}`}
            >
              <img src={image} alt={`Thumbnail ${index + 1}`} loading="lazy" />
              <div className="thumbnail-overlay"></div>
            </button>
          ))}
        </div>
      )}

      {/* Product Tags */}
      <div className="product-tags">
        <span className="tag new">NEW ARRIVAL</span>
        <span className="tag premium">PREMIUM QUALITY</span>
        <span className="tag fast">FREE SHIPPING</span>
      </div>
    </div>
  )
}