output "bucket_name" {
  description = "Name of the S3 bucket with the static build."
  value       = aws_s3_bucket.spa.id
}

output "distribution_id" {
  description = "ID of the new CloudFront distribution."
  value       = aws_cloudfront_distribution.spa.id
}

output "distribution_domain_name" {
  description = "HTTPS domain name of the distribution (dXXXXXXXXXX.cloudfront.net)."
  value       = aws_cloudfront_distribution.spa.domain_name
}

output "custom_domains" {
  description = "Custom domains pointing to the distribution."
  value       = aws_cloudfront_distribution.spa.aliases
}