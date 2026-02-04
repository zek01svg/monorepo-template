# Terraform Infrastructure Setup

This document explains the Terraform configuration for deploying the infrastructure across different environments.

## 🎯 Overview

The Terraform setup provides Infrastructure as Code (IaC) for both local development and production AWS environments. It follows a modular approach with reusable components and environment-specific configurations.

## 📁 Directory Structure

```
terraform/
├── kind-local/              # Local development with KIND
│   ├── providers.tf         # Terraform providers
│   ├── kind.tf             # KIND cluster configuration
│   ├── cilium.tf           # Cilium CNI networking
│   ├── argocd.tf           # ArgoCD installation
│   ├── traefik.tf          # Traefik ingress controller
│   ├── gateway.tf          # Gateway API resources
│   ├── registry.tf         # Local container registry
│   ├── tls.tf              # TLS certificate generation
│   └── variables.tf        # Input variables
├── eks/                     # Production AWS EKS
│   ├── providers.tf        # AWS providers configuration
│   ├── aws.tf              # EKS cluster and modules
│   ├── gateway.tf          # AWS Load Balancer Controller
│   ├── cilium.tf           # Cilium CNI on EKS
│   ├── argocd.tf           # ArgoCD for production
│   └── variables_*.tf      # Variable definitions
└── module-aws/             # Reusable AWS modules
    ├── eks/                # EKS cluster module
    ├── network/            # VPC networking module
    └── karpenter/          # Karpenter autoscaler module
```

## 🛠 Local Development Environment

### KIND Cluster Setup

The local environment uses KIND (Kubernetes in Docker) for development:

```hcl
resource "kind_cluster" "this" {
  name            = var.cluster_name
  node_image      = "kindest/node:${var.kubernetes_version}"
  kubeconfig_path = "${path.root}/kubeconfig"

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"
    networking {
      disable_default_cni = true  # Use Cilium instead
      kube_proxy_mode     = "none"
    }
  }
}
```

### Key Features

#### Port Forwarding

- **HTTP/HTTPS**: Port 80 for web traffic
- **PostgreSQL**: Port 5432 for database access
- **SMTP**: Port 1025 for email testing
- **Kubernetes API**: Port 6443 for kubectl access

#### Volume Mounts

- **Repository**: Mounts project root at `/mnt/monorepo-template.git`
- **CA Certificate**: Custom CA for HTTPS development

#### Networking Components

**Cilium CNI:**

```hcl
resource "helm_release" "cilium" {
  name       = "cilium"
  repository = "https://helm.cilium.io/"
  chart      = "cilium"
  namespace  = "kube-system"

  values = [
    file("${path.module}/values/cilium.values.yaml")
  ]
}
```

**Traefik Ingress:**

```hcl
resource "helm_release" "traefik" {
  name       = "traefik"
  repository = "https://traefik.github.io/charts"
  chart      = "traefik"
  namespace  = "traefik-system"
}
```

### TLS Certificate Management

Self-signed CA and certificates for local HTTPS:

```hcl
resource "tls_private_key" "ca_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_self_signed_cert" "ca_cert" {
  private_key_pem = tls_private_key.ca_key.private_key_pem

  subject {
    common_name  = "Monorepo Template CA"
    organization = "Development"
  }

  validity_period_hours = 8760  # 1 year
  is_ca_certificate     = true
}
```

## ☁️ Production AWS Environment

### EKS Cluster Configuration

The production environment uses AWS EKS with supporting infrastructure:

```hcl
module "eks" {
  source = "../module-aws/eks"

  cluster_name       = var.cluster_name
  private_subnet_ids = module.network.private_subnet_ids
  public_subnet_ids  = module.network.public_subnet_ids
  eks_kms_key_arn    = module.kms.eks_kms_key_arn
}
```

### Infrastructure Modules

#### Network Module

Creates VPC with public/private subnets:

```hcl
module "network" {
  source = "../module-aws/network"
  cluster_name = var.cluster_name
}
```

**Components:**

- VPC with CIDR block
- Public subnets for load balancers
- Private subnets for worker nodes
- Internet Gateway for external access
- NAT Gateways for outbound connectivity
- Route tables for traffic routing

#### EKS Module

Configures managed Kubernetes cluster:

```hcl
resource "aws_eks_cluster" "eks_cluster" {
  name     = var.cluster_name
  version  = "1.29"
  role_arn = aws_iam_role.eks_cluster_role.arn

  encryption_config {
    resources = ["secrets"]
    provider {
      key_arn = var.eks_kms_key_arn
    }
  }

  vpc_config {
    subnet_ids = concat(var.private_subnet_ids, var.public_subnet_ids)
  }

  enabled_cluster_log_types = [
    "api", "authenticator", "audit",
    "scheduler", "controllerManager"
  ]
}
```

#### Karpenter Module

Provides cluster autoscaling:

```hcl
module "karpenter" {
  source = "../module-aws/karpenter"

  eks_oidc_url            = module.eks.eks_oidc_url
  eks_oidc_arn            = module.eks.eks_oidc_arn
  eks_nodes_role_name     = module.eks.eks_nodes_role_name
  eks_cluster_id          = module.eks.eks_cluster_id
  eks_cluster_endpoint    = module.eks.eks_cluster_endpoint
}
```

### AWS IAM Configuration

**EKS Cluster Role:**

```hcl
resource "aws_iam_role" "eks_cluster_role" {
  name = "${var.cluster_name}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}
```

**Worker Node Role:**

```hcl
resource "aws_iam_role" "eks_nodes_role" {
  name = "${var.cluster_name}-eks-nodes-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}
```

## 🔧 Deployment Workflow

### Local Development

1. **Initialize Terraform:**

```bash
cd terraform/kind-local
terraform init
```

2. **Plan deployment:**

```bash
terraform plan
```

3. **Apply configuration:**

```bash
terraform apply
```

4. **Access cluster:**

```bash
export KUBECONFIG=$(pwd)/kubeconfig
kubectl get nodes
```

### Production Deployment

1. **Configure AWS credentials:**

```bash
aws configure
```

2. **Set up variables:**

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

3. **Deploy infrastructure:**

```bash
cd terraform/eks
terraform init
terraform plan
terraform apply
```

4. **Configure kubectl:**

```bash
aws eks update-kubeconfig --name <cluster-name> --region <region>
```

## 🔧 Provider Configuration

### Local Development Providers

```hcl
terraform {
  required_version = "~> 1.10"
  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "0.9.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 3.0"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "3.6.2"
    }
  }
}
```

### AWS Production Providers

```hcl
terraform {
  required_version = "~> 1.10"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 3.0"
    }
  }
}
```

## 📋 Variable Configuration

### Required Variables

**Local Development:**

```hcl
variable "cluster_name" {
  description = "Name of the Kubernetes cluster"
  type        = string
  default     = "monorepo-template"
}

variable "kubernetes_version" {
  description = "Kubernetes version for KIND cluster"
  type        = string
  default     = "v1.29.0"
}
```

**AWS Production:**

```hcl
variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "us-west-2"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
}
```

### Example terraform.tfvars

```hcl
aws_account_id = "123456789012"
aws_region     = "us-west-2"
cluster_name   = "production-cluster"
iam_user_name  = "eks-admin"
```

## 🛡️ Security Configuration

### KMS Encryption

- EKS secrets encrypted at rest
- Custom KMS keys for enhanced security

### Network Security

- Private subnets for worker nodes
- Security groups with minimal required access
- VPC endpoints for AWS services

### IAM Best Practices

- Least privilege access principles
- Service-specific roles and policies
- OIDC provider for workload identity

## 🔍 Monitoring and Outputs

### Terraform Outputs

**Local Development:**

```hcl
output "kubeconfig_path" {
  description = "Path to kubeconfig file"
  value       = kind_cluster.this.kubeconfig_path
}

output "cluster_endpoint" {
  description = "Cluster API endpoint"
  value       = kind_cluster.this.endpoint
}
```

**AWS Production:**

```hcl
output "cluster_id" {
  description = "EKS cluster ID"
  value       = module.eks.cluster_id
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = module.eks.cluster_security_group_id
}
```

## 🧹 Cleanup

### Local Environment

```bash
cd terraform/kind-local
terraform destroy
```

### AWS Environment

```bash
cd terraform/eks
terraform destroy
```

## 🔄 State Management

For production environments, consider:

- **Remote state backend** (S3 + DynamoDB)
- **State locking** for team collaboration
- **Encrypted state** for sensitive data

```hcl
terraform {
  backend "s3" {
    bucket         = "terraform-state-bucket"
    key            = "eks/terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

This Terraform setup provides a robust, scalable infrastructure foundation that supports both local development and production deployment patterns while maintaining security and operational best practices.
