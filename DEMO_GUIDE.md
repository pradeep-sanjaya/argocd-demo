# ArgoCD Demo Guide

This guide outlines the steps to demonstrate GitOps deployment with ArgoCD using our microservices demo.

## Demo Preparation

1. Ensure you have:
   - Access to a Kubernetes cluster with ArgoCD installed
   - The GitHub repository accessible to ArgoCD
   - Docker installed for building images

2. Build and push the container images:
   ```bash
   # For customer service
   cd src/customer
   docker build -t ngpsanjaya/customer:1.0.0 .
   docker push ngpsanjaya/customer:1.0.0
   
   # For store service
   cd ../store
   docker build -t ngpsanjaya/store:1.0.0 .
   docker push ngpsanjaya/store:1.0.0
   ```

3. Update the image references in the deployment files to match your registry.

4. Update the `applicationset.yaml` file with your GitHub repository URL.

## Demo Script

### 1. Introduction to GitOps and ArgoCD (5 minutes)

- Explain the GitOps principles:
  - Git as the single source of truth
  - Declarative infrastructure and applications
  - Pull-based deployment model
  - Automated reconciliation

- Highlight ArgoCD's key features:
  - Automated deployment
  - Multi-cluster and multi-environment support
  - Application health monitoring
  - Rollback capabilities

### 2. Project Structure Overview (5 minutes)

- Show the repository structure:
  ```
  argocd-demo/
  ├── src/ - Application source code
  │   ├── customer/ - Node.js service
  │   └── store/ - Python Flask service
  └── deploy/ - Kubernetes manifests
      ├── customer/
      │   ├── base/ - Common configuration
      │   └── overlays/ - Environment-specific configs
      └── store/
          ├── base/
          └── overlays/
  ```

- Explain Kustomize for environment configuration:
  - Base manifests contain common configurations
  - Overlays contain environment-specific changes
  - Show how resources and replicas differ between environments

### 3. Setting Up ArgoCD ApplicationSet (5 minutes)

- Apply the ApplicationSet to ArgoCD:
  ```bash
  kubectl apply -f applicationset.yaml -n argocd
  ```

- Open the ArgoCD UI and show the automatically created applications:
  ```bash
  kubectl port-forward svc/argocd-server -n argocd 8080:443
  ```
  Navigate to https://localhost:8080 in your browser

- Explain how the matrix generator creates applications for each service/environment combination

### 4. Initial Deployment (5 minutes)

- Watch the applications sync in the ArgoCD UI
- Show the deployed applications in each namespace:
  ```bash
  kubectl get pods -n dev
  kubectl get pods -n qa
  kubectl get pods -n prod
  ```

- Access one of the services to demonstrate it's working:
  ```bash
  # Run in background with Git Bash
  kubectl port-forward svc/customer -n dev 3000:80 > /dev/null 2>&1 &
  ```
  Navigate to http://localhost:3000 in your browser

### 5. Making a Code Change (10 minutes)

- Make a simple change to the customer service:
  ```javascript
  // src/customer/app.js
  app.get('/', (req, res) => {
    res.send(`Customer Service - Version: 1.0.1 - Environment: ${process.env.NODE_ENV || 'development'}`);
  });
  ```

- Build and push a new container image:
  ```bash
  cd src/customer
  docker build -t ngpsanjaya/customer:1.0.1 .
  docker push ngpsanjaya/customer:1.0.1
  ```

- Update the image tag in the deployment manifest:
  ```yaml
  # deploy/customer/base/deployment.yaml
  image: ngpsanjaya/customer:1.0.1
  ```

- Commit and push the changes:
  ```bash
  git add .
  git commit -m "Update customer service to version 1.0.1"
  git push
  ```

- Watch ArgoCD detect and apply the changes

### 6. Environment Promotion (10 minutes)

- Explain the promotion workflow:
  - Changes start in dev
  - After testing, promote to qa
  - After qa validation, promote to production

- Demonstrate a promotion from dev to qa:
  ```bash
  # First verify the change is only in dev
  kubectl port-forward svc/customer -n dev 3000:80 > /dev/null 2>&1 &
  kubectl port-forward svc/customer -n qa 3001:80 > /dev/null 2>&1 &
  ```

- Update the qa environment to use the new version:
  ```yaml
  # deploy/customer/overlays/qa/deployment-patch.yaml
  # Add image specification to the patch
  spec:
    template:
      spec:
        containers:
        - name: customer
          image: ngpsanjaya/customer:1.0.1
  ```

- Commit and push the changes:
  ```bash
  git add .
  git commit -m "Promote customer service 1.0.1 to QA"
  git push
  ```

- Watch ArgoCD sync the qa environment

### 7. Rollback Scenario (5 minutes)

- Simulate an issue with the new version in production
- Show how to rollback by reverting the Git commit:
  ```bash
  git revert HEAD
  git push
  ```

- Watch ArgoCD automatically roll back to the previous version

### 8. Health Monitoring (5 minutes)

- Show the health status in the ArgoCD UI
- Explain how health checks work
- Demonstrate a failing health check by modifying a service to return an error

### 9. Q&A and Discussion (10 minutes)

- Answer questions about the demo
- Discuss potential use cases for their specific projects
- Address any concerns about implementation

## Accessing Services

### Customer Service
- Dev: http://localhost:3000
- QA: http://localhost:3001
- Prod: http://localhost:3002

### Store Service
- Dev: http://localhost:5000
- QA: http://localhost:5001
- Prod: http://localhost:5002

## Port Forwarding Commands

```bash
# Customer Service
kubectl port-forward svc/customer -n dev 3000:80 > /dev/null 2>&1 &
kubectl port-forward svc/customer -n qa 3001:80 > /dev/null 2>&1 &
kubectl port-forward svc/customer -n prod 3002:80 > /dev/null 2>&1 &

# Store Service
kubectl port-forward svc/store -n dev 5000:80 > /dev/null 2>&1 &
kubectl port-forward svc/store -n qa 5001:80 > /dev/null 2>&1 &
kubectl port-forward svc/store -n prod 5002:80 > /dev/null 2>&1 &
```

To check which ports are currently forwarded:
```bash
netstat -ano | grep 3000  # Customer Dev
netstat -ano | grep 3001  # Customer QA
netstat -ano | grep 3002  # Customer Prod
netstat -ano | grep 5000  # Store Dev
netstat -ano | grep 5001  # Store QA
netstat -ano | grep 5002  # Store Prod
```

## Follow-up Resources

- ArgoCD Documentation: https://argo-cd.readthedocs.io/
- Kustomize Documentation: https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/
- GitOps Principles: https://www.gitops.tech/
