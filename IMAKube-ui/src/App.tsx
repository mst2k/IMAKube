import "./App.css"
import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, BarChart, Info, PresentationIcon, StopCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface LogEntry {
  id: number;
  type: 'request' | 'response' | 'error';
  message: string;
  timestamp: Date;
}

export default function KubernetesDemoPage() {
  const [fibonacciNumber, setFibonacciNumber] = useState<number>(30)
  const [requestInterval, setRequestInterval] = useState<number>(1000)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [totalRequests, setTotalRequests] = useState<number>(0)
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline'>('offline')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const requestCountRef = useRef<number>(0)

  const checkBackendStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/healthz', { signal: AbortSignal.timeout(1000) })
      setBackendStatus(response.ok ? 'online' : 'offline')
    } catch (error) {
      setBackendStatus('offline')
    }
  }, [])

  useEffect(() => {
    const statusInterval = setInterval(checkBackendStatus, 500) 
    return () => clearInterval(statusInterval)
  }, [checkBackendStatus])

  const addLogEntry = useCallback((type: 'request' | 'response' | 'error', message: string) => {
    setLogs(prev => [
      { id: Date.now(), type, message, timestamp: new Date() },
      ...prev.slice(0, 39) // Keep only the last 40 entries
    ])
  }, [])

  const sendRequest = useCallback(async () => {
    const requestId = ++requestCountRef.current
    setTotalRequests(requestId)
    addLogEntry('request', `Anfrage ${requestId}: Fibonacci(${fibonacciNumber}) gesendet`)

    try {
      const response = await fetch(`/api/generate-load?n=${fibonacciNumber}`)
      const data = await response.json()
      addLogEntry('response', `Antwort ${requestId}: Fibonacci(${fibonacciNumber}) = ${data.result}`)
    } catch (error) {
      console.error('Error sending request:', error)
      addLogEntry('error', `Fehler ${requestId}: ${error}`)
    }
  }, [fibonacciNumber, addLogEntry])

  const handleStartLoad = () => {
    setIsLoading(true)
    setLogs([])
    requestCountRef.current = 0
    setTotalRequests(0)

    sendRequest() // Sende sofort eine erste Anfrage
    intervalRef.current = setInterval(sendRequest, requestInterval)
  }

  const handleStopLoad = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsLoading(false)
  }

  const handleCrashBackend = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/crash-backend', { method: 'GET' })
      addLogEntry('response', 'Backend-Absturz ausgelöst. Der Service sollte in Kürze neu starten.')
    } catch (error) {
      addLogEntry('error', 'Fehler beim Auslösen des Absturzes. Das Backend konnte nicht erreicht werden - ist es vielleicht schon abgestürzt?')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Informationsmanagement / ERP-Systeme</h1>
        <div className="flex items-center justify-center text-xl text-blue-600">
          <PresentationIcon className="mr-2" />
          <span>Präsentation: Kubernetes</span>
        </div>
      </header>

      <Card className="w-full mx-auto shadow-lg">
        <CardHeader className="bg-blue-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl text-left">Kubernetes HPA Demo</CardTitle>
              <CardDescription className="text-blue-100">
                Kontinuierliche Lastgenerierung und Backend-Absturz zur Demonstration des Horizontal Pod Autoscaling
              </CardDescription>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-white">Backend Status:</span>
              <div className={`w-4 h-4 rounded-full ${backendStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
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
            <div>
              <Label htmlFor="requestInterval">Intervall zwischen Anfragen (ms)</Label>
              <Input
                id="requestInterval"
                type="number"
                value={requestInterval}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setRequestInterval(Math.max(100, isNaN(value) ? 100 : value));
                }}
                min="100"
                step="0.1"
                className="text-lg"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleStartLoad} disabled={isLoading || backendStatus === 'offline'} size="lg" className="w-1/3">
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
                  <Button onClick={handleCrashBackend} disabled={isLoading || backendStatus === 'offline'} variant="destructive" size="lg" className="w-1/3">
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
        <CardFooter className="bg-gray-50 flex-col items-start">
          <Alert className="w-full mb-4">
            <AlertTitle>Status</AlertTitle>
            <AlertDescription>
              Gesendete Anfragen: {totalRequests}
            </AlertDescription>
          </Alert>
          <div className="w-full grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-2">Anfragen</h3>
              <div className="space-y-2 max-h-60 min-h-60 overflow-y-auto pr-2">
                {logs.filter(log => log.type === 'request').map((log) => (
                  <Alert key={log.id} variant="default">
                    <AlertDescription>
                      [{log.timestamp.toLocaleTimeString()}] 🔼 {log.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2">Antworten & Fehler</h3>
              <div className="space-y-2 max-h-60 min-h-60 overflow-y-auto pr-2">
                {logs.filter(log => log.type === 'response' || log.type === 'error').map((log) => (
                  <Alert key={log.id} variant={log.type === 'error' ? 'destructive' : 'default'}>
                    <AlertDescription>
                      [{log.timestamp.toLocaleTimeString()}] 
                      {log.type === 'response' && '🔽 '}
                      {log.type === 'error' && '❌ '}
                      {log.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}