# Responsive delivery sizes retain the complete composition of each source photograph.
Add-Type -AssemblyName System.Drawing
$root = Join-Path $PSScriptRoot 'dist/assets'
$destination = Join-Path $root 'responsive'
New-Item -ItemType Directory -Path $destination -Force | Out-Null
$jpegCodec = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
foreach ($file in Get-ChildItem -LiteralPath $root -Filter '*.jpg' -File) {
  $original = [Drawing.Image]::FromFile($file.FullName)
  try {
    foreach ($width in @(480,800)) {
      $target = Join-Path $destination ($file.BaseName + '-' + $width + '.jpg')
      if (Test-Path -LiteralPath $target) { continue }
      $height = [int][Math]::Round($original.Height * $width / $original.Width)
      $bitmap = New-Object Drawing.Bitmap($width,$height)
      $graphics = [Drawing.Graphics]::FromImage($bitmap)
      $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.CompositingQuality = [Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.DrawImage($original,0,0,$width,$height)
      $parameters = New-Object Drawing.Imaging.EncoderParameters(1)
      $parameters.Param[0] = New-Object Drawing.Imaging.EncoderParameter([Drawing.Imaging.Encoder]::Quality,[long]85)
      try { $bitmap.Save($target,$jpegCodec,$parameters) } finally { $graphics.Dispose(); $bitmap.Dispose(); $parameters.Dispose() }
    }
  } finally { $original.Dispose() }
}
Get-ChildItem -LiteralPath $destination -Filter '*.jpg' | Measure-Object -Property Length -Sum | Select-Object Count,Sum
