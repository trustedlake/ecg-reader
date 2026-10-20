variable "aws_profile" {
  type        = string
  description = "Local AWS profile (~/.aws/credentials) used by the provider."
  default     = "trustedlake"
}

variable "domain" {
  type        = string
  description = "Route53 domain of the web app; the app is served at app.<domain>."
  default     = "ecgreader.app"
}
