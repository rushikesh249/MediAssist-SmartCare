"use client"

import { useState, useRef } from "react"
import { MainNav } from "@/components/main-nav"
import { AnimatedSection } from "@/components/animated-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Upload, Play, CheckCircle, Volume2 } from "lucide-react"
import { useSpeechToText } from "@/hooks/use-speech-to-text"
import { useApi } from "@/hooks/use-api"

export default function PatientPage() {
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const prescriptionInputRef = useRef<HTMLInputElement>(null)

  const { transcript, isListening, error: speechError, startListening, stopListening, resetTranscript } = useSpeechToText()
  const { submitAudio, submitPrescription, generateAudio, loading, error } = useApi()

  const handleRecording = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening()
    }
  }

  const handleAudioUpload = async () => {
    if (fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0]
      const response = await submitAudio(file)
      if (response.data) {
        setResults(response.data)
        setShowResults(true)
      }
    }
  }

  const handlePrescriptionUpload = async () => {
    if (prescriptionInputRef.current?.files?.[0]) {
      const file = prescriptionInputRef.current.files[0]
      const response = await submitPrescription(file)
      if (response.data) {
        setResults(response.data)
        setShowResults(true)
        
        // Generate audio for the instructions
        if (response.data.patient_instructions) {
          const audioResponse = await generateAudio(response.data.patient_instructions)
          if (audioResponse.data) {
            setAudioUrl(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${audioResponse.data.file_path}`)
          }
        }
      }
    }
  }

  const handlePlayAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        {/* Header */}
        <AnimatedSection animation="fade-in">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Tell us your symptoms or upload a prescription
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Use your voice to describe symptoms or upload a prescription image. Our AI will help simplify everything
              for you.
            </p>
          </div>
        </AnimatedSection>

        {/* Voice Recording Section */}
        <AnimatedSection animation="scale-in" delay={200}>
          <Card className="mb-8 hover-lift transition-all duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Voice Recording</CardTitle>
              <CardDescription>Tap the microphone to start recording your symptoms</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                size="lg"
                onClick={handleRecording}
                disabled={loading}
                className={`w-32 h-32 rounded-full text-2xl transition-all duration-300 ${
                  isListening
                    ? "bg-destructive hover:bg-destructive/90 pulse-recording"
                    : "bg-primary hover:bg-primary/90 hover-lift"
                }`}
                aria-label={isListening ? "Stop recording symptoms" : "Start recording symptoms"}
              >
                {isListening ? <MicOff className="h-12 w-12" /> : <Mic className="h-12 w-12" />}
              </Button>
              <div className="mt-6">
                {isListening ? (
                  <Badge variant="destructive" className="text-lg px-4 py-2 animate-pulse">
                    Recording... Tap to stop
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Tap to start recording
                  </Badge>
                )}
              </div>
              {transcript && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Transcript:</p>
                  <p className="text-foreground">"{transcript}"</p>
                </div>
              )}
              {speechError && (
                <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive">{speechError}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Upload Section */}
        <AnimatedSection animation="slide-up" delay={400}>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="hover-lift transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Audio File
                </CardTitle>
                <CardDescription>Upload a recorded audio file of your symptoms</CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleAudioUpload}
                />
                <Button
                  variant="outline"
                  className="w-full h-16 text-lg bg-transparent hover-lift transition-all duration-300"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  aria-label="Choose audio file to upload"
                >
                  {loading ? "Uploading..." : "Choose Audio File"}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-lift transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Prescription
                </CardTitle>
                <CardDescription>Upload a photo of your prescription for simplification</CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={prescriptionInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePrescriptionUpload}
                />
                <Button
                  variant="outline"
                  className="w-full h-16 text-lg bg-transparent hover-lift transition-all duration-300"
                  onClick={() => prescriptionInputRef.current?.click()}
                  disabled={loading}
                  aria-label="Choose prescription image to upload"
                >
                  {loading ? "Uploading..." : "Choose Prescription Image"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>

        {/* Loading State */}
        {loading && (
          <AnimatedSection animation="fade-in">
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <p className="text-lg font-medium">Processing... please wait</p>
                </div>
                <Progress value={undefined} className="w-full h-3" />
                <div className="text-center mt-2">
                  <p className="text-sm text-muted-foreground">AI is analyzing your submission...</p>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}

        {/* Error State */}
        {error && (
          <AnimatedSection animation="scale-in">
            <Card className="mb-8 border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-lg font-medium text-destructive">Error occurred</p>
                  <p className="text-destructive/80">{error}</p>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}

        {/* Results Section */}
        {showResults && (
          <div className="space-y-6">
            <AnimatedSection animation="fade-in">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">Your Results</h2>
            </AnimatedSection>

            {/* Results Cards with staggered animations */}
            {[
              {
                title: "Transcript",
                description: "Here's what we understood from your audio",
                content: results?.transcribed_text || transcript,
                delay: 0,
              },
              {
                title: "Doctor Summary",
                description: "AI-generated summary for the doctor",
                content: results?.doctor_summary,
                delay: 200,
              },
              {
                title: "Simplified Instructions",
                description: "Clear, step-by-step guidance for your medication",
                content: results?.patient_instructions,
                delay: 400,
              },
              {
                title: "Audio Guidance",
                description: "Listen to your medication instructions",
                content: null,
                delay: 600,
                hasAudio: !!audioUrl,
              },
            ].filter(item => item.content || item.hasAudio).map((item, index) => (
              <AnimatedSection key={index} animation="slide-up" delay={item.delay}>
                <Card className="hover-lift transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                      {item.title}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {item.title === "Transcript" && <p className="text-foreground leading-relaxed">"{item.content}"</p>}
                    {item.title === "Doctor Summary" && <p className="text-foreground leading-relaxed">{item.content}</p>}
                    {item.title === "Simplified Instructions" && (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-foreground leading-relaxed whitespace-pre-line">{item.content}</p>
                        </div>
                      </div>
                    )}
                    {item.title === "Audio Guidance" && item.hasAudio && (
                      <Button 
                        size="lg" 
                        className="w-full hover-lift transition-all duration-300"
                        onClick={handlePlayAudio}
                      >
                        <Volume2 className="mr-2 h-5 w-5" />
                        Play Audio Guidance
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
