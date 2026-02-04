resource "helm_release" "argocd" {
  depends_on       = [helm_release.cilium]
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = var.argocd_helm_version
  namespace        = "argocd"
  create_namespace = true
  values = [
    file("${path.module}/values/argocd.values.yaml"),
    yamlencode({
      global = {
        domain = "argocd.${var.cluster_domain_public}"
      },
    })
  ]
}

# https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories
# https://argo-cd.readthedocs.io/en/stable/operator-manual/argocd-repositories-yaml/
# https://registry.terraform.io/providers/1Password/onepassword/latest/docs/data-sources/item
resource "kubectl_manifest" "argocd_repo_git" {
  depends_on = [helm_release.argocd]
  yaml_body  = templatefile("${path.module}/values/argocd-repo-git.yaml", {
    git_url = var.argocd_git_url
    git_username = var.argocd_git_username
    git_password = var.argocd_git_password
  })
}

resource "kubectl_manifest" "argocd_repo_oci" {
  depends_on = [helm_release.argocd]
  yaml_body  = templatefile("${path.module}/values/argocd-repo-oci.yaml", {
    oci_url = var.argocd_oci_url
    oci_username = var.argocd_oci_username
    oci_password = var.argocd_oci_password
  })
}

resource "kubectl_manifest" "argocd_appsets" {
  depends_on = [helm_release.argocd]
  yaml_body = templatefile("${path.module}/values/argocd-appsets.yaml", {
    appsets_include = var.argocd_appsets_include
    git_url = var.argocd_git_url
  })
}

resource "random_password" "argocd_oidc_secret" {
  length  = 64
  special = false
}

resource "kubernetes_secret" "argocd_oidc_secret" {
  depends_on = [helm_release.argocd]
  metadata {
    name      = "argocd-oidc-secret"
    namespace = "argocd"
    labels = {
      "app.kubernetes.io/part-of" = "argocd"
    }
  }
  data = {
    "oidc.better-auth.issuer"       = "https://auth.${var.cluster_domain_public}/api/auth"
    "oidc.better-auth.clientID"     = "argocd"
    "oidc.better-auth.clientSecret" = random_password.argocd_oidc_secret.result
    "oidc.better-auth.allowedAudience" = var.argocd_oidc_allowed_audience
  }
}