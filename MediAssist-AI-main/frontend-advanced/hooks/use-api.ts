"use client"

import { useState } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiResponse<T> {
  data?: T
  error?: string
  loading: boolean
}

interface SubmissionResponse {
  message: string
  transcribed_text?: string
  doctor_summary?: string
  extracted_text?: string
  patient_instructions?: string
  submission_id: number
}

interface AudioResponse {
  message: string
  audio_file: string
  file_path: string
}

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitAudio = async (file: File): Promise<ApiResponse<SubmissionResponse>> => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/submit_audio`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data, loading: false }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { error: errorMessage, loading: false }
    } finally {
      setLoading(false)
    }
  }

  const submitPrescription = async (file: File): Promise<ApiResponse<SubmissionResponse>> => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/submit_prescription`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data, loading: false }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { error: errorMessage, loading: false }
    } finally {
      setLoading(false)
    }
  }

  const generateAudio = async (text: string, language: string = 'en'): Promise<ApiResponse<AudioResponse>> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/generate_audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data, loading: false }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { error: errorMessage, loading: false }
    } finally {
      setLoading(false)
    }
  }

  const getSubmissions = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/get_result`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data, loading: false }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { error: errorMessage, loading: false }
    } finally {
      setLoading(false)
    }
  }

  const approveSubmission = async (submissionId: number): Promise<ApiResponse<any>> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/approve/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data, loading: false }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { error: errorMessage, loading: false }
    } finally {
      setLoading(false)
    }
  }

  return {
    submitAudio,
    submitPrescription,
    generateAudio,
    getSubmissions,
    approveSubmission,
    loading,
    error
  }
}
