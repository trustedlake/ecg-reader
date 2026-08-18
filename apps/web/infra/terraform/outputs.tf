output "bucket_name" {
  description = "Nome do bucket S3 com o build estatico."
  value       = aws_s3_bucket.spa.id
}

output "distribution_id" {
  description = "ID da distribution CloudFront nova."
  value       = aws_cloudfront_distribution.spa.id
}

output "distribution_domain_name" {
  description = "Domain name HTTPS da distribution (dXXXXXXXXXX.cloudfront.net)."
  value       = aws_cloudfront_distribution.spa.domain_name
}

output "custom_domains" {
  description = "Dominios customizados apontando para a distribution."
  value       = aws_cloudfront_distribution.spa.aliases
}