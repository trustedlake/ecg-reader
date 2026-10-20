terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  # Dedicated state bucket (versioned, private).
  backend "s3" {
    bucket = "ecg-reader-terraform-state-785236377332"
    key    = "ecg-reader/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region  = "us-east-1"
  profile = var.aws_profile
}

locals {
  app_name = "ecg-reader"
  app_host = "app.${var.domain}"
}

# Unique bucket suffix (8 hex chars). Fixed keeper: stops random_id from
# regenerating and "changing" the bucket name in future runs.
resource "random_id" "bucket_suffix" {
  keepers = {
    app_name = local.app_name
  }
  byte_length = 4
}

# Private bucket: nothing public. Access only through CloudFront + OAC.
resource "aws_s3_bucket" "spa" {
  bucket = "${local.app_name}-spa-${random_id.bucket_suffix.hex}"
  tags = {
    Name = "${local.app_name}-spa"
  }
}

resource "aws_s3_bucket_public_access_block" "spa" {
  bucket                  = aws_s3_bucket.spa.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# OAC (Origin Access Control): authenticated CloudFront access to the bucket.
resource "aws_cloudfront_origin_access_control" "spa" {
  name                              = "${local.app_name}-oac"
  description                       = "OAC between CloudFront and the ${local.app_name} static bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Bucket policy: GetObject ONLY for this CloudFront (via OAC). Not public
# under block_public_policy above: the principal is the CloudFront service.
resource "aws_s3_bucket_policy" "spa" {
  bucket = aws_s3_bucket.spa.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.spa.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.spa.arn
        }
      }
    }]
  })
}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

# Zone that already exists in Route53 (not created by this state).
data "aws_route53_zone" "main" {
  name         = "${var.domain}."
  private_zone = false
}

# Certificate for the app host. Must be in us-east-1
# (the provider already is) for CloudFront to accept it.
resource "aws_acm_certificate" "spa" {
  domain_name       = local.app_host
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "spa_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.spa.domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      record  = dvo.resource_record_value
      type    = dvo.resource_record_type
      zone_id = data.aws_route53_zone.main.zone_id
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = each.value.zone_id
}

resource "aws_acm_certificate_validation" "spa" {
  certificate_arn         = aws_acm_certificate.spa.arn
  validation_record_fqdns = [for r in aws_route53_record.spa_cert_validation : r.fqdn]
}

resource "aws_cloudfront_distribution" "spa" {
  enabled             = true
  comment             = "SPA ${local.app_name} (React) served from S3"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  aliases             = [local.app_host]

  origin {
    domain_name              = aws_s3_bucket.spa.bucket_regional_domain_name
    origin_id                = "${local.app_name}-s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.spa.id
  }

  default_cache_behavior {
    target_origin_id       = "${local.app_name}-s3-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = data.aws_cloudfront_cache_policy.caching_optimized.id

    compress = true
  }

  # SPA with client-side routing (react-router): any 403/404 falls back to
  # index.html with status 200.
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.spa.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_route53_record" "spa_app" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = local.app_host
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.spa.domain_name
    zone_id                = aws_cloudfront_distribution.spa.hosted_zone_id
    evaluate_target_health = false
  }
}
