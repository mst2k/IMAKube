'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, BarChart, Info, PresentationIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function KubernetesDemoPage() {
  const [requestCount, setRequestCount] = useState<number>(100)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [result, setResult] = useState<string | null>(null)

  const handleGenerateLoad = async () => {
    setIsLoading(true)
    setResult(null)
    try {
      const response = await fetch('/api/generate-load', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count: requestCount }),
      })
      const data = await response.json()
      setResult(`Last erfolgreich generiert. ${data.processedRequests} Fibonacci-Berechnungen durchgeführt.`)
    } catch (error) {
      setResult('Fehler bei der Lastgenerierung. Bitte versuchen Sie es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCrashBackend = async () => {
    setIsLoading(true)
    setResult(null)
    try {
      await fetch('/api/crash-backend', { method: 'POST' })
      setResult('Backend-Absturz ausgelöst. Der Service sollte in Kürze neu starten.')
    } catch (error) {
      setResult('Fehler beim Auslösen des Backend-Absturzes. Der Service könnte bereits abgestürzt sein.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Informationsmanagement / ERP-Systeme</h1>
        <div className="flex items-center justify-center text-xl text-blue-600">
          <PresentationIcon className="mr-2" />
          <span>Präsentation: Kubernetes</span>
        </div>
      </header>

      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl">Kubernetes HPA Demo</CardTitle>
          <CardDescription className="text-blue-100">
            Lastgenerierung und Backend-Absturz zur Demonstration des Horizontal Pod Autoscaling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Über diese Demo</AlertTitle>
            <AlertDescription>
              Dieses Frontend wurde speziell für die Präsentation im Modul "Informationsmanagement / ERP-Systeme" entwickelt, um Kubernetes-Konzepte zu demonstrieren:<br />
              - "Last generieren" ruft Fibonacci-Berechnungen im Backend auf, um CPU-Last zu erzeugen.<br />
              - "Backend abstürzen" löst einen Fatal-Error aus, um einen Pod-Neustart zu simulieren.<br />
              Beobachten Sie, wie Kubernetes darauf reagiert und skaliert!
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="requestCount">Anzahl der Anfragen</Label>
            <Input
              id="requestCount"
              type="number"
              value={requestCount}
              onChange={(e) => setRequestCount(parseInt(e.target.value))}
              min="1"
              className="text-lg"
            />
          </div>
          <div className="flex space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleGenerateLoad} disabled={isLoading} size="lg" className="w-1/2">
                    <BarChart className="mr-2 h-5 w-5" />
                    Last generieren
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Erzeugt Last durch Fibonacci-Berechnungen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleCrashBackend} disabled={isLoading} variant="destructive" size="lg" className="w-1/2">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Backend abstürzen
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Löst einen Absturz im Backend aus</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50">
          {result && (
            <Alert className="w-full">
              <AlertTitle>Ergebnis</AlertTitle>
              <AlertDescription>{result}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}