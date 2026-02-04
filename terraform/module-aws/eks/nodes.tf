resource "aws_eks_node_group" "eks_nodes" {
  cluster_name    = aws_eks_cluster.eks_cluster.name
  node_group_name = "${var.cluster_name}-eks-nodes"
  node_role_arn   = aws_iam_role.eks_nodes_role.arn

  subnet_ids = [
    var.private_subnet_ids[0],
    var.private_subnet_ids[1]
  ]

  capacity_type  = "SPOT"
  instance_types = ["t3.xlarge"]

  disk_size = 100

  scaling_config {
    desired_size = 4
    max_size     = 10
    min_size     = 0
  }

  update_config {
    max_unavailable = 1
  }

  labels = {
    role = "general"
  }
  taint {
    key = "node.cilium.io/agent-not-ready"
    value = "true"
    effect = "NoExecute"
  }

  depends_on = [aws_iam_role_policy_attachment.eks_nodes_AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.eks_nodes_AmazonEC2ContainerRegistryReadOnly,
    aws_iam_role_policy_attachment.eks_nodes_AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.eks_nodes_AmazonQLDBFullAccess,
    aws_iam_role_policy_attachment.eks_nodes_AmazonRDSDataFullAccess,
    aws_iam_role_policy_attachment.eks_nodes_AmazonSESFullAccess,
    aws_iam_role_policy_attachment.eks_nodes_AmazonDynamoDBFullAccess
  ]
}