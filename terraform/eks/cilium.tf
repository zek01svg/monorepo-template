# https://www.talos.dev/v1.9/kubernetes-guides/network/deploying-cilium/
# https://registry.terraform.io/providers/hashicorp/helm/latest/docs/resources/release
resource "helm_release" "cilium" {
  name       = "cilium"
  repository = "https://helm.cilium.io/"
  chart      = "cilium"
  version    = var.cilium_version
  namespace  = "kube-system"
  values = [
    file("${path.module}/values/cilium.values.yaml"),
  ]
  set = [{
    name  = "k8sServiceHost"
    value = module.eks.eks_cluster_endpoint
    }, {
    name  = "k8sServicePort"
    value = "6443"
  }]
  wait_for_jobs = true
}
