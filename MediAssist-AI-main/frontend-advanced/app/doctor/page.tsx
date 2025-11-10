"use client"

import { useState, useEffect, useRef } from "react"
import { MainNav } from "@/components/main-nav"
import { AnimatedSection } from "@/components/animated-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApi } from "@/hooks/use-api"
import {
  Folder,
  Upload,
  CheckCircle,
  Clock,
  Eye,
  Save,
  Send,
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Activity,
} from "lucide-react"

type SubmissionStatus = "pending" | "in-review" | "approved"

interface Submission {
  id: string
  patientName: string
  date: string
  status: SubmissionStatus
  transcript: string
  aiSummary: string
  simplifiedInstructions: string
}

// Mock data removed - now using real API data

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState<"queue" | "upload" | "approved">("queue")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [editableInstructions, setEditableInstructions] = useState("")
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [patientName, setPatientName] = useState("")
  const prescriptionInputRef = useRef<HTMLInputElement>(null)

  const { submitPrescription, getSubmissions, approveSubmission, loading, error } = useApi()

  // Load submissions on component mount
  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    const response = await getSubmissions()
    if (response.data) {
      // Transform API data to match our interface
      const transformedSubmissions = response.data.submissions.map((sub: any) => ({
        id: sub.id.toString(),
        patientName: `Patient ${sub.id}`,
        date: new Date().toISOString().split('T')[0],
        status: sub.status as SubmissionStatus,
        transcript: sub.transcribed_text || '',
        aiSummary: sub.doctor_summary || '',
        simplifiedInstructions: sub.patient_instructions || ''
      }))
      setSubmissions(transformedSubmissions)
    }
  }

  const handleSubmissionSelect = (submission: Submission) => {
    setSelectedSubmission(submission)
    setEditableInstructions(submission.simplifiedInstructions)
  }

  const handleSaveDraft = () => {
    if (selectedSubmission) {
      // Update the submission with draft instructions
      console.log("Saving draft for:", selectedSubmission.id, editableInstructions)
    }
  }

  const handleApprove = async () => {
    if (selectedSubmission) {
      // Approve and send to patient
      const response = await approveSubmission(parseInt(selectedSubmission.id))
      if (response.data) {
        console.log("Submission approved successfully")
        await loadSubmissions() // Reload to get updated status
        setSelectedSubmission(null)
      }
    }
  }

  const handlePrescriptionUpload = async () => {
    if (prescriptionInputRef.current?.files?.[0]) {
      const file = prescriptionInputRef.current.files[0]
      const response = await submitPrescription(file)
      if (response.data) {
        // Reload submissions to show the new one
        await loadSubmissions()
        setActiveTab("queue")
      }
    }
  }

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case "in-review":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            In Review
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        )
    }
  }

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "in-review":
        return <Activity className="h-4 w-4 text-blue-600" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="flex">
        {/* Sidebar Navigation */}
        <AnimatedSection animation="slide-up">
          <aside className="w-64 bg-sidebar border-r border-sidebar-border min-h-[calc(100vh-4rem)] p-4">
            <nav className="space-y-2">
              <Button
                variant={activeTab === "queue" ? "default" : "ghost"}
                className="w-full justify-start hover-lift transition-all duration-300"
                onClick={() => setActiveTab("queue")}
              >
                <Folder className="mr-2 h-4 w-4" />
                Submissions Queue
              </Button>
              <Button
                variant={activeTab === "upload" ? "default" : "ghost"}
                className="w-full justify-start hover-lift transition-all duration-300"
                onClick={() => setActiveTab("upload")}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Prescription
              </Button>
              <Button
                variant={activeTab === "approved" ? "default" : "ghost"}
                className="w-full justify-start hover-lift transition-all duration-300"
                onClick={() => setActiveTab("approved")}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approved Instructions
              </Button>
            </nav>

            {/* Stats Cards in Sidebar */}
            <div className="mt-8 space-y-4">
              <AnimatedSection animation="scale-in" delay={200}>
                <Card className="bg-sidebar-accent hover-lift transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-sidebar-foreground/70">Pending</p>
                        <p className="text-2xl font-bold text-sidebar-foreground">
                          {submissions.filter((s) => s.status === "pending").length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection animation="scale-in" delay={400}>
                <Card className="bg-sidebar-accent hover-lift transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-sidebar-foreground/70">In Review</p>
                        <p className="text-2xl font-bold text-sidebar-foreground">
                          {submissions.filter((s) => s.status === "in-review").length}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </aside>
        </AnimatedSection>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Submissions Queue */}
          {activeTab === "queue" && !selectedSubmission && (
            <div>
              <AnimatedSection animation="fade-in">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-foreground mb-2">Submissions Queue</h1>
                  <p className="text-muted-foreground">Review and process patient submissions</p>
                </div>
              </AnimatedSection>

              <div className="grid gap-4">
                {submissions.map((submission, index) => (
                  <AnimatedSection key={submission.id} animation="slide-up" delay={index * 100}>
                    <Card className="hover-lift transition-all duration-300 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{submission.patientName}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-1 h-3 w-3" />
                                {submission.date}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(submission.status)}
                            {getStatusBadge(submission.status)}
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4 line-clamp-2">{submission.transcript}</p>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSubmissionSelect(submission)}
                          className="hover-lift transition-all duration-300"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          )}

          {/* Submission Detail View */}
          {activeTab === "queue" && selectedSubmission && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedSubmission(null)}
                    className="mb-2 hover-lift transition-all duration-300"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Queue
                  </Button>
                  <h1 className="text-3xl font-bold text-foreground">Patient Submission</h1>
                  <p className="text-muted-foreground">
                    {selectedSubmission.patientName} - {selectedSubmission.date}
                  </p>
                </div>
                {getStatusBadge(selectedSubmission.status)}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Transcript */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Patient Transcript
                      </CardTitle>
                      <CardDescription>Original patient description</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground leading-relaxed">"{selectedSubmission.transcript}"</p>
                    </CardContent>
                  </Card>

                  {/* AI Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="mr-2 h-5 w-5" />
                        AI Summary
                      </CardTitle>
                      <CardDescription>AI-generated clinical summary</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground leading-relaxed">{selectedSubmission.aiSummary}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Upload Prescription */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Upload className="mr-2 h-5 w-5" />
                        Upload Prescription Image
                      </CardTitle>
                      <CardDescription>Upload prescription for this patient</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="prescription-upload">Prescription Image</Label>
                          <Input
                            id="prescription-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPrescriptionFile(e.target.files?.[0] || null)}
                            className="mt-1"
                          />
                        </div>
                        {prescriptionFile && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-foreground">Selected: {prescriptionFile.name}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Simplified Instructions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Simplified Instructions (AI Draft)
                      </CardTitle>
                      <CardDescription>Edit and approve patient instructions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Enter simplified instructions for the patient..."
                          value={editableInstructions}
                          onChange={(e) => setEditableInstructions(e.target.value)}
                          className="min-h-32"
                        />
                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            onClick={handleSaveDraft}
                            className="hover-lift transition-all duration-300 bg-transparent"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Save Draft
                          </Button>
                          <Button
                            onClick={handleApprove}
                            disabled={!editableInstructions.trim()}
                            className="hover-lift transition-all duration-300"
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Approve & Send to Patient
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Upload Prescription Tab */}
          {activeTab === "upload" && (
            <div>
              <AnimatedSection animation="fade-in">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-foreground mb-2">Upload Prescription</h1>
                  <p className="text-muted-foreground">Upload and process prescription images</p>
                </div>
              </AnimatedSection>

              <Card className="max-w-2xl hover-lift transition-all duration-300">
                <CardHeader>
                  <CardTitle>New Prescription Upload</CardTitle>
                  <CardDescription>Upload a prescription image to generate simplified instructions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="patient-name">Patient Name</Label>
                    <Input id="patient-name" placeholder="Enter patient name" className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="prescription-file">Prescription Image</Label>
                    <input
                      ref={prescriptionInputRef}
                      id="prescription-file"
                      type="file"
                      accept="image/*"
                      className="mt-1"
                      onChange={handlePrescriptionUpload}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea id="notes" placeholder="Any additional notes or context..." className="mt-1" />
                  </div>

                  <Button className="w-full hover-lift transition-all duration-300">
                    <Upload className="mr-2 h-4 w-4" />
                    Process Prescription
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Approved Instructions Tab */}
          {activeTab === "approved" && (
            <div>
              <AnimatedSection animation="fade-in">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-foreground mb-2">Approved Instructions</h1>
                  <p className="text-muted-foreground">View all approved patient instructions</p>
                </div>
              </AnimatedSection>

              <div className="grid gap-4">
                {submissions
                  .filter((submission) => submission.status === "approved")
                  .map((submission, index) => (
                    <AnimatedSection key={submission.id} animation="slide-up" delay={index * 100}>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">{submission.patientName}</h3>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  Approved on {submission.date}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover-lift transition-all duration-300 bg-transparent"
                            >
                              View Full Record
                              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                            </Button>
                          </div>

                          <div className="bg-muted/30 rounded-lg p-4 hover-lift transition-all duration-300">
                            <h4 className="font-medium mb-2">Approved Instructions:</h4>
                            <p className="text-muted-foreground">{submission.simplifiedInstructions}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </AnimatedSection>
                  ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
