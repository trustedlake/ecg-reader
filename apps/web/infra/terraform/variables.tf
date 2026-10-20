variable "aws_profile" {
  type        = string
  description = "Local AWS profile (~/.aws/credentials) used by the provider."
  default     = "trustedlake"
}