module "network" {
  source = "../modules-aws/network"
  cluster_name = var.cluster_name
}

module "kms" {
  source = "../modules-aws/kms"
}

module "eks" {
  source = "../modules-aws/eks"
  cluster_name = var.cluster_name
  private_subnet_ids = module.network.private_subnet_ids
  public_subnet_ids  = module.network.public_subnet_ids
  eks_kms_key_arn    = module.kms.eks_kms_key_arn
}

resource "kubernetes_config_map" "aws_auth" {
  metadata {
    name      = "aws-auth"
    namespace = "kube-system"
  }

  data = {
    mapRoles = yamlencode([
      {
        # this allows the worker nodes to join the cluster
        rolearn  = module.eks.eks_nodes_role_arn
        username = "system:node:{{EC2PrivateDNSName}}"
        groups   = ["system:bootstrappers", "system:nodes"]
      },
      {
        # maps IAM user for kubectl access
        rolearn = "arn:aws:iam::${var.aws_account_id}:user/${var.iam_user_name}"
        username = "${var.iam_user_name}"
        groups = ["system:masters"]
      }
    ])
  }
}


module "karpenter" {
  source = "../modules-aws/karpenter"

  eks_oidc_url = module.eks.eks_oidc_url
  eks_oidc_arn = module.eks.eks_oidc_arn
  eks_nodes_role_name    = module.eks.eks_nodes_role_name

  eks_cluster_id       = module.eks.eks_cluster_id
  eks_cluster_endpoint = module.eks.eks_cluster_endpoint
}