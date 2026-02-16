'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FiUpload, FiImage, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi'
import './ImageUploader.css'

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void
  folder?: string
  maxSize?: number // in MB
  aspectRatio?: number
  bucket?: string
  onUploadStateChange?: (uploading: boolean) => void
}

export default function ImageUploader({ 
  onUploadComplete, 
  folder = 'products',
  maxSize = 5,
  aspectRatio = 1,
  bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'products',
  onUploadStateChange
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const validateFile = (file: File): boolean => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, WebP, GIF)')
      return false
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSize}MB`)
      return false
    }

    return true
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    
    if (!validateFile(file)) {
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      onUploadStateChange?.(true)
      setProgress(0)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      clearInterval(progressInterval)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      if (!mountedRef.current) return
      setProgress(100)
      setUploadedUrl(publicUrl)
      onUploadComplete(publicUrl)
      
      // Reset progress after success
      setTimeout(() => {
        if (mountedRef.current) setProgress(0)
      }, 1000)
      
    } catch (error: any) {
      const message = String(error?.message || '')
      const isAbort =
        message.toLowerCase().includes('signal is aborted') ||
        error?.name === 'AbortError'

      if (isAbort) {
        if (mountedRef.current) {
          setError('Upload was interrupted. Please retry.')
        }
        return
      }

      console.error('Upload error:', error)
      if (!mountedRef.current) return
      if (message.toLowerCase().includes('bucket not found')) {
        setError(
          `Storage bucket "${bucket}" not found. Create it in Supabase Storage or set NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET.`
        )
      } else {
        setError(error.message || 'Upload failed. Please try again.')
      }
    } finally {
      if (mountedRef.current) {
        setUploading(false)
      }
      onUploadStateChange?.(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files[0]
    if (!file) return

    if (!validateFile(file)) {
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    uploadFile(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setUploadedUrl(null)
    setError(null)
    onUploadComplete('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="image-uploader">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="file-input"
      />

      {preview ? (
        <div className="preview-container">
          <div className="preview-wrapper" style={{ aspectRatio: `${aspectRatio}` }}>
            <img src={preview} alt="Preview" className="preview-image" />
            
            {uploading && (
              <div className="upload-progress">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                <span className="progress-text">{progress}%</span>
              </div>
            )}
            
            {uploadedUrl && (
              <div className="upload-success">
                <FiCheck />
                <span>Upload Successful</span>
              </div>
            )}
          </div>
          
          <div className="preview-actions">
            <button onClick={triggerFileInput} className="change-btn">
              Change Image
            </button>
            <button onClick={handleRemove} className="remove-btn">
              <FiX />
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="upload-area"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <div className="upload-content">
            <FiUpload className="upload-icon" />
            <h3>Upload Image</h3>
            <p>Drag & drop or click to browse</p>
            <p className="upload-hint">
              Supports: JPG, PNG, WebP, GIF • Max: {maxSize}MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="upload-error">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {uploadedUrl && (
        <div className="upload-info">
          <div className="info-row">
            <span className="info-label">Uploaded URL:</span>
            <input 
              type="text" 
              value={uploadedUrl} 
              readOnly 
              className="url-input"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
          </div>
          <div className="info-row">
            <span className="info-label">Preview:</span>
            <img src={uploadedUrl} alt="Uploaded" className="thumb-preview" />
          </div>
        </div>
      )}
    </div>
  )
}
