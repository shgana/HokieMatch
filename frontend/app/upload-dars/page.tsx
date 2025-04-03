"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Cloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function UploadDARSPage() {
  const [file, setFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  })

  const handleSubmit = () => {
    if (file) {
      // Here you would typically upload the file to your server
      console.log("Uploading file:", file.name)
      // Reset the file state after upload
      setFile(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Upload DARS Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
            }`}
          >
            <input {...getInputProps()} />
            <Cloud className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            {file ? (
              <p className="text-sm text-gray-600">File selected: {file.name}</p>
            ) : isDragActive ? (
              <p className="text-sm text-gray-600">Drop the PDF file here...</p>
            ) : (
              <p className="text-sm text-gray-600">Drag and drop your DARS PDF here, or click to select a file</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={!file} className="w-full">
            Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

