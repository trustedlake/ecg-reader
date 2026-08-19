$ErrorActionPreference = "Stop"
$env:AWS_PROFILE = "trustedlake"

npm run build --workspace=web

Set-Location apps\web\infra\terraform
$bucket = terraform output -raw bucket_name
if (-not $bucket) { throw "terraform output bucket_name veio vazio" }
$distId = terraform output -raw distribution_id
if (-not $distId) { throw "terraform output distribution_id veio vazio" }
Set-Location ..\..\..

aws s3 sync apps\web\dist\ "s3://$bucket/" --delete --profile trustedlake

aws cloudfront create-invalidation --distribution-id $distId --paths "/*" --profile trustedlake

Write-Host "Deploy feito. Aguarde 1-2 min pra invalidation propagar e teste em https://app.leitorecg.com.br/upload"