# AWS
variable "aws_account_id" {
  type        = string
  description = "AWS account ID"
}

variable "aws_profile" {
  type        = string
  description = "AWS profile"
}

variable "iam_user_name" {
  type        = string
  description = "IAM user name"
}

variable "hosted_zone_id" {
  type        = string
  description = "Route53 zone ID"
}

variable "nlb_zone_id" {
  type        = string
  description = "Route53 zone ID for the NLB"
  default     = null
}