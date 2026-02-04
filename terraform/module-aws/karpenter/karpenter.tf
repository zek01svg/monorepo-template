# deploying karpenter using helm
resource "helm_release" "karpenter" {
  namespace        = "karpenter"
  create_namespace = true

  name       = "karpenter"
  repository = "https://charts.karpenter.sh"
  chart      = "karpenter"
  version    = "v0.16.3"

  # provides karpenter permissions to manage nodes
  values = [
    yamlencode({
      serviceAccount = {
        annotations = {
          "eks.amazonaws.com/role-arn" = aws_iam_role.karpenter_controller_role.arn
        }
      }
      clusterName = var.eks_cluster_id
      clusterEndpoint = var.eks_cluster_endpoint
      aws = {
        defaultInstanceProfile = aws_iam_instance_profile.karpenter_profile.name
      }
    })
  ]
}
