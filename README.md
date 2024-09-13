# Project Name

## Inhaltsverzeichnis
1. [Voraussetzungen](#voraussetzungen)
2. [Projekt klonen](#projekt-klonen)
3. [Docker-Images bauen](#docker-images-bauen)
4. [Lokale Ausführung mit Docker Compose](#lokale-ausführung-mit-docker-compose)
5. [Installation in Kubernetes](#installation-in-kubernetes)
6. [Aktualisierung in Kubernetes](#aktualisierung-in-kubernetes)

## Voraussetzungen

Stellen Sie sicher, dass Sie folgende Tools installiert haben:
- Git
- Docker und Docker Compose
- Kubernetes-Cluster (z.B. Minikube für lokale Entwicklung)
- kubectl
- Helm

## Projekt klonen

Klonen Sie das Repository mit folgendem Befehl:

```bash
git clone https://github.com/mst2k/IMAKube.git
cd IMAKube
```

## Docker-Images bauen

Bauen Sie die Docker-Images mit Docker Compose:

```bash
docker compose build
```

## Lokale Ausführung mit Docker Compose

Führen Sie das Projekt lokal aus:

```bash
docker compose up
```

Um im Hintergrund auszuführen, fügen Sie die `-d` Flag hinzu:

```bash
docker compose up -d
```

## Installation in Kubernetes

1. Stellen Sie sicher, dass Ihr Kubernetes-Cluster läuft und `kubectl` korrekt konfiguriert ist.

2. Installieren Sie den Helm-Chart:

```bash
helm install imakube . \
  -f values.yaml \
  -f values-metrics-server.yaml \
  --create-namespace \
  --namespace imakube
```

3. Überprüfen Sie die Installation:

```bash
kubectl get pods -n imakube
kubectl get hpa -n imakube
```

## Aktualisierung in Kubernetes

Wenn Sie Änderungen an Ihrem Code oder den Kubernetes-Konfigurationen vorgenommen haben:

1. Bauen Sie die Docker-Images neu

2. Aktualisieren Sie die Helm-Release:

```bash
helm upgrade --install imakube . \
  -f values.yaml \
  -f values-metrics-server.yaml \
  --create-namespace \
  --namespace imakube
```

Dieser Befehl führt ein Upgrade durch oder installiert die Release, falls sie noch nicht existiert. Er verwendet sowohl die `values.yaml` als auch die `values-metrics-server.yaml` für die Konfiguration und stellt sicher, dass der Namespace `imakube` existiert.

4. Überprüfen Sie die Aktualisierung:

```bash
kubectl get pods -n imakube
kubectl get hpa -n imakube
```

## Zusätzliche Hinweise

- Überwachen Sie die Leistung Ihrer Anwendung und des HPAs mit:

```bash
kubectl describe hpa imakube-backend -n imakube
```

- Passen Sie die HPA-Einstellungen in der `values.yaml` und `values-metrics-server.yaml` Ihres Helm-Charts an, um das Skalierungsverhalten zu optimieren.

- Verwenden Sie `kubectl logs` und `kubectl describe`, um Probleme zu diagnostizieren. Zum Beispiel:

```bash
kubectl logs -n imakube <pod-name>
kubectl describe pod -n imakube <pod-name>
```

- Um den Status Ihres Helm-Releases zu überprüfen:

```bash
helm status imakube -n imakube
```

- Wenn Sie Änderungen an Ihren Konfigurationsdateien vornehmen, können Sie einen Dry-Run durchführen, um die Auswirkungen zu überprüfen, ohne tatsächliche Änderungen vorzunehmen:

```bash
helm upgrade --install imakube . \
  -f values.yaml \
  -f values-metrics-server.yaml \
  --create-namespace \
  --namespace imakube \
  --dry-run
```

Viel Erfolg!

# Default downscale verhalten ändern unter Docker Desktop


priviliged shell

```bash
docker run -it --privileged --pid=host debian nsenter -t 1 -m -u -n -i sh 
```

config vom controller manager ändern

```bash
vi /etc/kubernetes/manifests/kube-controller-manager.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    component: kube-controller-manager
    tier: control-plane
  name: kube-controller-manager
  namespace: kube-system
spec:
  containers:
  - command:
    ...
    - --horizontal-pod-autoscaler-sync-period=10s
    - --horizontal-pod-autoscaler-downscale-delay=10s
    - --horizontal-pod-autoscaler-downscale-stabilization=10s
    ...
```