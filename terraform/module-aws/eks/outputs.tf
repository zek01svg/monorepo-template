output "eks_nodes_role_arn" {
  value = aws_iam_role.eks_nodes_role.arn
}

output "eks_cluster_id" {
  value = aws_eks_cluster.eks_cluster.id
}

output "eks_cluster_name" {
  value = aws_eks_cluster.eks_cluster.name
}

output "eks_cluster_endpoint" {
  value = aws_eks_cluster.eks_cluster.endpoint
}

output "eks_cluster_certificate_authority_data" {
  value = aws_eks_cluster.eks_cluster.certificate_authority.0.data
}

output "eks_cluster_token" {
  value = data.aws_eks_cluster_auth.eks_cluster_auth.token
}

output "eks_oidc_url" {
  value = aws_iam_openid_connect_provider.eks_oidc.url
}

output "eks_oidc_arn" {
  value = aws_iam_openid_connect_provider.eks_oidc.arn
}

output "eks_nodes_role_name" {
  value = aws_iam_role.eks_nodes_role.name
}
