# Kubernetes Deployment Guide for GadgetToyShop

This guide will help you deploy the GadgetToyShop application on Kubernetes.

## Prerequisites

- Kubernetes cluster (minikube, kind, EKS, GKE, AKS, etc.)
- kubectl configured to access your cluster
- Docker installed (to build the image)

## Directory Structure

```
k8s/
├── README.md                  # This file
├── app-configmap.yaml        # Application configuration
├── app-secrets.yaml          # Database credentials (change before deploying!)
├── app-deployment.yaml       # Application deployment and service
└── postgres-deployment.yaml  # PostgreSQL database deployment
```

## Quick Start

### Step 1: Build Docker Image

```bash
# Build the application image
docker build -t gadgettoyshop:latest .

# If using minikube, load image into minikube
minikube image load gadgettoyshop:latest

# If using kind
kind load docker-image gadgettoyshop:latest
```

### Step 2: Update Secrets (IMPORTANT!)

**Before deploying to production, change the default passwords in `app-secrets.yaml`:**

```bash
# Edit the secrets file
vi k8s/app-secrets.yaml

# Change these values:
# - POSTGRES_PASSWORD: "your-secure-password-here"
# - DATABASE_URL: "postgresql://postgres:your-secure-password-here@postgres:5432/shop_data"
```

### Step 3: Deploy to Kubernetes

```bash
# Create namespace (optional)
kubectl create namespace toyshop

# Deploy ConfigMap and Secrets
kubectl apply -f k8s/app-configmap.yaml
kubectl apply -f k8s/app-secrets.yaml

# Deploy PostgreSQL
kubectl apply -f k8s/postgres-deployment.yaml

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s

# Deploy Application
kubectl apply -f k8s/app-deployment.yaml

# Wait for app to be ready
kubectl wait --for=condition=ready pod -l app=gadgettoyshop --timeout=120s
```

### Step 4: Access the Application

**For LoadBalancer (cloud providers):**
```bash
# Get external IP
kubectl get service gadgettoyshop

# Access at http://<EXTERNAL-IP>
```

**For minikube:**
```bash
# Get minikube service URL
minikube service gadgettoyshop --url

# Or use port-forward
kubectl port-forward service/gadgettoyshop 3000:80
# Access at http://localhost:3000
```

**For any cluster with port-forward:**
```bash
kubectl port-forward service/gadgettoyshop 3000:80
# Access at http://localhost:3000
```

## Database Setup

### Initialize Database (First Time)

```bash
# Get app pod name
POD_NAME=$(kubectl get pods -l app=gadgettoyshop -o jsonpath='{.items[0].metadata.name}')

# Run migrations
kubectl exec -it $POD_NAME -- npx prisma migrate deploy

# Seed database with sample data
kubectl exec -it $POD_NAME -- npx tsx clean-slate.ts
```

### Database Management

**View PostgreSQL logs:**
```bash
kubectl logs -l app=postgres -f
```

**Connect to PostgreSQL:**
```bash
# Port forward to PostgreSQL
kubectl port-forward service/postgres 5432:5432

# Connect with psql
psql -h localhost -U postgres -d shop_data
```

**Backup database:**
```bash
# Get postgres pod name
POSTGRES_POD=$(kubectl get pods -l app=postgres -o jsonpath='{.items[0].metadata.name}')

# Backup
kubectl exec $POSTGRES_POD -- pg_dump -U postgres shop_data > backup.sql
```

**Restore database:**
```bash
cat backup.sql | kubectl exec -i $POSTGRES_POD -- psql -U postgres shop_data
```

## Monitoring

### Check Application Status

```bash
# View all resources
kubectl get all

# View pod logs
kubectl logs -l app=gadgettoyshop -f

# View specific pod logs
kubectl logs <pod-name> -f

# Describe deployment
kubectl describe deployment gadgettoyshop

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

### Health Checks

The application includes:
- **Readiness probe**: Checks if app is ready to receive traffic
- **Liveness probe**: Restarts pod if app becomes unresponsive

```bash
# Check pod health
kubectl get pods -l app=gadgettoyshop -o wide

# View probe status
kubectl describe pod <pod-name>
```

## Scaling

### Scale Application

```bash
# Scale to 3 replicas
kubectl scale deployment gadgettoyshop --replicas=3

# Horizontal Pod Autoscaler (HPA)
kubectl autoscale deployment gadgettoyshop --cpu-percent=70 --min=2 --max=10

# Check HPA status
kubectl get hpa
```

## Updating the Application

### Rolling Update

```bash
# Build new image with version tag
docker build -t gadgettoyshop:v2 .

# Load into cluster (if using minikube/kind)
minikube image load gadgettoyshop:v2

# Update deployment
kubectl set image deployment/gadgettoyshop app=gadgettoyshop:v2

# Watch rollout
kubectl rollout status deployment/gadgettoyshop

# Rollback if needed
kubectl rollout undo deployment/gadgettoyshop
```

## Configuration Updates

### Update ConfigMap

```bash
# Edit configmap
kubectl edit configmap app-config

# Or apply updated file
kubectl apply -f k8s/app-configmap.yaml

# Restart pods to pick up changes
kubectl rollout restart deployment/gadgettoyshop
```

### Update Secrets

```bash
# Edit secrets
kubectl edit secret app-secrets

# Or apply updated file
kubectl apply -f k8s/app-secrets.yaml

# Restart pods
kubectl rollout restart deployment/gadgettoyshop
```

## Ingress (Optional)

For production with custom domain:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: gadgettoyshop-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: toyshop.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gadgettoyshop
            port:
              number: 80
```

Apply with:
```bash
kubectl apply -f ingress.yaml
```

## Troubleshooting

### Common Issues

**Pods not starting:**
```bash
# Check pod status
kubectl describe pod <pod-name>

# View logs
kubectl logs <pod-name>

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

**Database connection issues:**
```bash
# Check if PostgreSQL is running
kubectl get pods -l app=postgres

# Check PostgreSQL logs
kubectl logs -l app=postgres

# Test database connection from app pod
kubectl exec -it <app-pod> -- nc -zv postgres 5432
```

**Image pull errors:**
```bash
# If using local images with minikube/kind
# Make sure to load the image:
minikube image load gadgettoyshop:latest
# or
kind load docker-image gadgettoyshop:latest

# For private registries, create imagePullSecret
kubectl create secret docker-registry regcred \
  --docker-server=<registry-url> \
  --docker-username=<username> \
  --docker-password=<password>
```

## Cleanup

### Delete Everything

```bash
# Delete all resources
kubectl delete -f k8s/app-deployment.yaml
kubectl delete -f k8s/postgres-deployment.yaml
kubectl delete -f k8s/app-secrets.yaml
kubectl delete -f k8s/app-configmap.yaml

# Or delete by label
kubectl delete all -l app=gadgettoyshop
kubectl delete all -l app=postgres
kubectl delete pvc postgres-pvc
```

## Production Considerations

### Security

1. **Change default passwords** in `app-secrets.yaml`
2. **Use external secrets management** (AWS Secrets Manager, HashiCorp Vault)
3. **Enable RBAC** and restrict pod permissions
4. **Use network policies** to restrict traffic
5. **Scan images** for vulnerabilities

### High Availability

1. **Use external managed database** (AWS RDS, Cloud SQL, Azure Database)
2. **Set up backup strategy** for PostgreSQL
3. **Use persistent volumes** with proper backup
4. **Configure pod disruption budgets**
5. **Use multiple replicas** for the application

### Monitoring & Logging

1. **Set up Prometheus** for metrics
2. **Use Grafana** for visualization
3. **Configure log aggregation** (ELK, Loki)
4. **Set up alerts** for critical issues

### Resource Management

```yaml
# Example with resource limits
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

## Using Cloud Databases

To use a managed database instead of the in-cluster PostgreSQL:

1. Create database in cloud provider (RDS, Cloud SQL, etc.)
2. Update `app-secrets.yaml` with external DATABASE_URL:
   ```yaml
   DATABASE_URL: "postgresql://user:pass@external-host:5432/shop_data"
   ```
3. Skip deploying `postgres-deployment.yaml`
4. Ensure network connectivity from cluster to database

## Contact & Support

For issues and questions:
- Check application logs: `kubectl logs -l app=gadgettoyshop`
- Check PostgreSQL logs: `kubectl logs -l app=postgres`
- Review Kubernetes events: `kubectl get events`

---

Built with ❤️ for Kubernetes deployments
