import "./App.css"
import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, BarChart, Info, PresentationIcon, StopCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function KubernetesDemoPage() {
  const [fibonacciNumber, setFibonacciNumber] = useState<number>(30)
  const [requestInterval, setRequestInterval] = useState<number>(100)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [result, setResult] = useState<string | null>(null)
  const [totalRequests, setTotalRequests] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleStartLoad = () => {
    setIsLoading(true)
    setResult(null)
    setTotalRequests(0)

    const sendRequest = async () => {
      try {
        const response = await fetch(`/api/generate-load?n=${fibonacciNumber}`)
        const data = await response.json()
        setTotalRequests(prev => prev + 1)
        setResult(`Laufende Lastgenerierung. Bisher ${totalRequests + 1} Anfragen gesendet.`)
      } catch (error) {
        console.error('Error sending request:', error)
      }
    }

    intervalRef.current = setInterval(sendRequest, requestInterval)
  }

  const handleStopLoad = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsLoading(false)
    setResult(`Lastgenerierung gestoppt. Insgesamt ${totalRequests} Anfragen gesendet.`)
  }

  const handleCrashBackend = async () => {
    setIsLoading(true)
    setResult(null)
    try {
      await fetch('/api/crash-backend', { method: 'GET' })
      setResult('Backend-Absturz ausgelöst. Der Service sollte in Kürze neu starten.')
    } catch (error) {
      setResult('Fehler beim Auslösen des Backend-Absturzes. Der Service könnte bereits abgestürzt sein.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container min-w-2xl mx-auto p-4 min-h-screen">
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
            Kontinuierliche Lastgenerierung und Backend-Absturz zur Demonstration des Horizontal Pod Autoscaling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Über diese Demo</AlertTitle>
            <AlertDescription className="text-left">
              <br/>
              Dieses Frontend wurde für die Präsentation im Modul "Informationsmanagement / ERP-Systeme" entwickelt, um Kubernetes-Konzepte zu demonstrieren:<br />
              <br/>
              <b>Last generieren</b>: Sendet kontinuierlich Anfragen zur Fibonacci-Berechnung an das Backend, um CPU-Last zu erzeugen.
              <br/>
              <b>Backend abstürzen</b>: Löst einen Fatal-Error aus, um einen Pod-Neustart zu simulieren.
              <br/>
              <br/>
              Beobachten Sie, wie Kubernetes auf die Last reagiert und automatisch skaliert!
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="fibonacciNumber">Zu berechnende Fibonacci-Zahl</Label>
            <Input
              id="fibonacciNumber"
              type="number"
              value={fibonacciNumber}
              onChange={(e) => setFibonacciNumber(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requestInterval">Intervall zwischen Anfragen (ms)</Label>
            <Input
              id="requestInterval"
              type="number"
              value={requestInterval}
              onChange={(e) => setRequestInterval(Math.max(100, parseInt(e.target.value) || 100))}
              min="100"
              className="text-lg"
            />
          </div>
          <div className="flex space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleStartLoad} disabled={isLoading} size="lg" className="w-1/3">
                    <BarChart className="mr-2 h-5 w-5" />
                    Start Load
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Startet kontinuierliche Lastgenerierung</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleStopLoad} disabled={!isLoading} size="lg" className="w-1/3">
                    <StopCircle className="mr-2 h-5 w-5" />
                    Stop Load
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Stoppt die Lastgenerierung</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleCrashBackend} disabled={isLoading} variant="destructive" size="lg" className="w-1/3">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Crash Backend
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
              <AlertTitle>Status</AlertTitle>
              <AlertDescription>{result}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}