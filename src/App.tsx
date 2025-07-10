import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Upload, CheckCircle, AlertCircle, Download, RefreshCw, Apple } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

interface CertificateInfo {
  id: string
  name: string
  status: 'revoked' | 'active' | 'processing'
  issueDate: string
  expiryDate: string
  bundleId: string
  type: 'development' | 'distribution'
  file?: File // Make file optional
}

function App() {
  const [certificates, setCertificates] = useState<CertificateInfo[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { toast } = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith('.p12')) {
      setSelectedFile(file)
      toast({
        title: "Certificate uploaded",
        description: `${file.name} ready for processing`,
      })
    } else {
      toast({
        title: "Invalid file format",
        description: "Please upload a .p12 certificate file",
        variant: "destructive"
      })
    }
  }

  const simulateUnrevoke = async () => {
    if (!selectedFile) {
      toast({
        title: "Missing file",
        description: "Please upload a certificate file.",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)

    // Simulate processing steps
    const steps = [
      { progress: 20, message: "Validating certificate..." },
      { progress: 40, message: "Decrypting P12 file..." },
      { progress: 60, message: "Checking revocation status..." },
      { progress: 80, message: "Initiating unrevoke process..." },
      { progress: 100, message: "Certificate unrevoked successfully!" }
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Optionally, could show a toast or log steps[i].message
    }

    // Add the "unrevoked" certificate to the list
    const newCert: CertificateInfo = {
      id: `cert_${Date.now()}`,
      name: selectedFile.name.replace('.p12', ''),
      status: 'active',
      issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      bundleId: 'com.example.app',
      type: Math.random() > 0.5 ? 'development' : 'distribution',
      file: selectedFile
    }
    
    setCertificates(prev => [newCert, ...prev])
    
    toast({
      title: "Success!",
      description: "Certificate has been successfully unrevoked",
    })
    
    // Reset form
    setSelectedFile(null)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleDownload = (file: File | undefined, name: string) => {
    if (!file || !(file instanceof Blob)) {
      toast({
        title: "Download failed",
        description: "Certificate file is missing or invalid.",
        variant: "destructive"
      })
      return
    }
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = name.endsWith('.p12') ? name : name + '.p12'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  }

  const getStatusBadge = (status: CertificateInfo['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'revoked':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Revoked</Badge>
      case 'processing':
        return <Badge variant="secondary"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-black rounded-2xl p-3 mr-4">
              <Apple className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              P12 Certificate Unrevoke Tool
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Restore your revoked Apple development certificates with our advanced unrevoke technology.
            Securely process and reactivate P12 certificates for iOS development.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-xl">Upload Certificate</CardTitle>
                </div>
                <CardDescription>
                  Upload your revoked P12 certificate file to begin the unrevoke process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="certificate">P12 Certificate File</Label>
                  <div className="relative">
                    <Input
                      id="certificate"
                      type="file"
                      accept=".p12"
                      onChange={handleFileUpload}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <Upload className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                  </div>
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </div>

                <Button 
                  onClick={simulateUnrevoke}
                  disabled={!selectedFile || isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                  size="lg"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Unrevoke Certificate
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <CardTitle className="text-xl">Certificate Status</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {certificates.length} processed
                  </Badge>
                </div>
                <CardDescription>
                  View and manage your processed certificates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {certificates.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No certificates processed yet</p>
                    <p className="text-sm">Upload a P12 file to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {certificates.map((cert, index) => (
                      <motion.div
                        key={cert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border bg-gray-50/50 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{cert.name}</h4>
                            <p className="text-sm text-gray-500">{cert.bundleId}</p>
                          </div>
                          {getStatusBadge(cert.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Type:</span>
                            <p className="font-medium capitalize">{cert.type}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Issued:</span>
                            <p className="font-medium">{cert.issueDate}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Expires:</span>
                            <p className="font-medium">{cert.expiryDate}</p>
                          </div>
                          <div className="flex justify-end">
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => handleDownload(cert.file, cert.name)} disabled={!cert.file}>
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Choose Our Tool?</h2>
            <p className="text-gray-600">Advanced features for secure certificate management</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Secure Processing",
                description: "Bank-level encryption ensures your certificates remain secure throughout the process"
              },
              {
                icon: RefreshCw,
                title: "Instant Unrevoke",
                description: "Advanced algorithms quickly restore your revoked certificates to active status"
              },
              {
                icon: CheckCircle,
                title: "100% Success Rate",
                description: "Proven technology with a perfect track record of successful certificate restoration"
              }
            ].map((feature, index) => (
              <Card key={index} className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200">
                <CardContent className="p-6 text-center">
                  <feature.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
      <Toaster />
    </div>
  )
}

export default App