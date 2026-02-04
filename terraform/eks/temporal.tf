resource "random_password" "temporal_oidc_secret" {
  length  = 64
  special = false
}

resource "kubernetes_namespace" "services" {
  metadata {
    name = "services"
  }
}

resource "kubernetes_secret" "temporal_oidc_secret" {
  depends_on = [kubernetes_namespace.services]
  metadata {
    name      = "temporal-oidc-secret"
    namespace = "services"
  }
  data = {
    "providerURL"  = "https://auth.${var.cluster_domain_public}/api/auth"
    "clientID"     = "temporal"
    "clientSecret" = random_password.temporal_oidc_secret.result
    "scopes"       = "openid,profile,email"
    "callbackURL"  = "https://temporal.${var.cluster_domain_public}"
  }
}