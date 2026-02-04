variable "argocd_git_url" {
  type        = string
  description = "The URL of the Git repository to configure for ArgoCD"
  nullable    = false
}

variable "argocd_git_username" {
  type        = string
  description = "The username for the Git repository"
  nullable    = false
}

variable "argocd_git_password" {
  type        = string
  description = "The password for the Git repository"
  nullable    = false
}

variable "argocd_oci_url" {
  type        = string
  description = "The URL of the OCI repository to configure for ArgoCD"
  nullable    = false
}

variable "argocd_oci_username" {
  type        = string
  description = "The username for the OCI repository"
  nullable    = false
}

variable "argocd_oci_password" {
  type        = string
  description = "The password for the OCI repository"
  nullable    = false
}

variable "argocd_oidc_allowed_audience" {
  type        = string
  description = "The allowed audience for the OIDC provider"
  nullable    = false
}