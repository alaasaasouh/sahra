$projectRoot = Split-Path -Parent $PSScriptRoot
# Re-encode generated food photography for web delivery without changing dimensions or composition.
Add-Type -AssemblyName System.Drawing
$assetRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot 'dist/assets'))
$originalRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot '.image-originals'))
New-Item -ItemType Directory -Path $originalRoot -Force | Out-Null
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
foreach ($asset in Get-ChildItem -LiteralPath $assetRoot -Filter '*.png' -File) {
  $target = Join-Path $assetRoot ($asset.BaseName + '.jpg')
  $photo = [System.Drawing.Image]::FromFile($asset.FullName)
  $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]88)
  try { $photo.Save($target, $jpegCodec, $parameters) } finally { $photo.Dispose(); $parameters.Dispose() }
  Move-Item -LiteralPath $asset.FullName -Destination (Join-Path $originalRoot $asset.Name)
}
Get-ChildItem -LiteralPath $assetRoot -Filter '*.jpg' -File | Measure-Object -Property Length -Sum | Select-Object Count,Sum
