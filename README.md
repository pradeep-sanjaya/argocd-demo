# ArgoCD GitOps Demo

A demonstration of GitOps deployment workflow using ArgoCD to manage multiple microservices across dev, qa, and prod environments.

## Business Objectives

- **Primary Purpose**: Demonstrate GitOps-based continuous deployment using ArgoCD
- **Success Criteria**: Automatic deployment of microservices to multiple environments upon code changes
- **Key Stakeholders**: DevOps Engineers, Development Teams, Platform Engineers

## Technical Overview

### Architecture

This demo showcases a GitOps deployment pipeline with the following components:

- **ArgoCD**: Kubernetes controller that continuously monitors Git repositories and applies changes to the cluster
- **Microservices**: Two sample services (customer and store) with different tech stacks
- **Environments**: Three deployment environments (dev, qa, prod) with different configurations

### System Constraints

- Requires a Kubernetes cluster with ArgoCD installed
- Requires access to a container registry for storing images
- Network connectivity between Kubernetes and GitHub

### Security Requirements

- No credentials stored in the repository
- All sensitive configuration managed through Kubernetes secrets (not included in demo)
- Container images should be scanned for vulnerabilities before deployment

## Project Structure

```
argocd-demo/
├── src/
│   ├── customer/        # Node.js microservice
│   │   ├── app.js
│   │   ├── package.json
│   │   └── Dockerfile
│   └── store/           # Python Flask microservice
│       ├── app.py
│       ├── requirements.txt
│       └── Dockerfile
├── deploy/
│   ├── customer/
│   │   ├── base/        # Base Kubernetes manifests
│   │   └── overlays/    # Environment-specific configurations
│   │       ├── dev/
│   │       ├── qa/
│   │       └── prod/
│   └── store/
│       ├── base/
│       └── overlays/
│           ├── dev/
│           ├── qa/
│           └── prod/
└── applicationset.yaml  # ArgoCD ApplicationSet definition
```

## Setup Instructions

### Prerequisites

- Kubernetes cluster
- ArgoCD installed on the cluster
- kubectl configured to access your cluster
- Docker for building container images

### Deployment Steps

1. **Clone the repository**:
   ```
   git clone https://github.com/YOUR_USERNAME/argocd-demo.git
   cd argocd-demo
   ```

2. **Update the ApplicationSet**:
   Edit `applicationset.yaml` to use your GitHub repository URL.

3. **Apply the ApplicationSet to ArgoCD**:
   ```
   kubectl apply -f applicationset.yaml -n argocd
   ```

4. **Build and push the container images**:
   ```
   # For customer service
   cd src/customer
   docker build -t ngpsanjaya/customer:1.0.0 .
   docker push ngpsanjaya/customer:1.0.0
   
   # For store service
   cd ../store
   docker build -t ngpsanjaya/store:1.0.0 .
   docker push ngpsanjaya/store:1.0.0
   ```

5. **Update image references**:
   Update the image references in `deploy/*/base/deployment.yaml` files to point to your registry.

6. **Commit and push changes**:
   ```
   git add .
   git commit -m "Update image references"
   git push
   ```

7. **Access ArgoCD UI**:
   ```
   kubectl port-forward svc/argocd-server -n argocd 8080:443
   ```
   Then open https://localhost:8080 in your browser.

## Demo Workflow

1. **Initial Deployment**:
   - ArgoCD automatically creates applications for each service/environment combination
   - Applications sync with the cluster, deploying all services to their respective environments

2. **Making Changes**:
   - Modify code in the `src` directory
   - Update the image tag in the deployment manifests
   - Commit and push changes
   - ArgoCD detects changes and automatically updates the deployments

3. **Environment Promotion**:
   - Changes can be promoted from dev to qa to prod by updating the respective overlay files
   - This simulates a typical deployment pipeline

## Error Handling

- ArgoCD provides automatic recovery through the `selfHeal: true` option
- Health checks are configured for all services to ensure proper functioning
- Rollbacks can be performed through the ArgoCD UI or by reverting Git commits

## Monitoring

- Application health status is visible in the ArgoCD UI
- Detailed sync and deployment logs are available for troubleshooting

## License

This project is licensed under the MIT License - see the LICENSE file for details.
