Add-Type -AssemblyName System.Drawing
$brandDir = Join-Path $PSScriptRoot 'dist/brand'
New-Item -ItemType Directory -Path $brandDir -Force | Out-Null
$invariant = [Globalization.CultureInfo]::InvariantCulture
function Number([double]$value) { return $value.ToString('0.###', $invariant) }
function Outline-Text([string]$text, [string]$family, [single]$size) {
  $shape = New-Object Drawing.Drawing2D.GraphicsPath
  $font = New-Object Drawing.FontFamily($family)
  $shape.AddString($text, $font, 0, $size, (New-Object Drawing.PointF(0,0)), [Drawing.StringFormat]::GenericTypographic)
  $points = $shape.PathPoints; $types = $shape.PathTypes; $parts = New-Object 'Collections.Generic.List[string]'
  for ($i=0; $i -lt $points.Length; $i++) {
    $kind = $types[$i] -band 7
    if ($kind -eq 0) { $parts.Add(('M' + (Number $points[$i].X) + ' ' + (Number $points[$i].Y))) }
    elseif ($kind -eq 1) { $parts.Add(('L' + (Number $points[$i].X) + ' ' + (Number $points[$i].Y))) }
    elseif ($kind -eq 3) {
      $parts.Add(('C' + (Number $points[$i].X) + ' ' + (Number $points[$i].Y) + ' ' + (Number $points[$i+1].X) + ' ' + (Number $points[$i+1].Y) + ' ' + (Number $points[$i+2].X) + ' ' + (Number $points[$i+2].Y)))
      $i += 2
    }
    if (($types[$i] -band 128) -ne 0) { $parts.Add('Z') }
  }
  $result = @{d=($parts -join ' ');bounds=$shape.GetBounds()}
  $shape.Dispose(); $font.Dispose(); return $result
}
$word = Outline-Text 'Sahra' 'Georgia' 88
$subtitle = Outline-Text 'YEMENI KITCHEN' 'Segoe UI' 12
$wordScale = 194 / $word.bounds.Width
$subScale = 153 / $subtitle.bounds.Width
$wordX = 109 - $word.bounds.X*$wordScale; $wordY = 30 - $word.bounds.Y*$wordScale
$subX = 112 - $subtitle.bounds.X*$subScale; $subY = 104 - $subtitle.bounds.Y*$subScale
$emblem = '<g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 114V49C12 25 27 10 46 5C65 10 80 25 80 49V114H12Z"/><path d="M23 108V51C23 33 33 21 46 16C59 21 69 33 69 51V108" opacity=".45" stroke-width="1.4"/><path d="M26 77H66C63 91 56 98 46 98C36 98 29 91 26 77Z"/><path d="M22 77H70M36 104H56M41 64C33 53 52 51 44 38M53 65C48 58 59 54 55 46"/><path d="M46 22L49 26L46 30L43 26Z" fill="currentColor" stroke="none"/></g>'
foreach ($variant in @(@{name='sahra-logo-dark.svg';color='#f1c66d'},@{name='sahra-logo-light.svg';color='#26291f'})) {
  $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 126" role="img" aria-labelledby="title" style="color:' + $variant.color + '"><title id="title">Sahra - Yemeni Kitchen</title>' + $emblem + '<g fill="currentColor"><path transform="translate(' + (Number $wordX) + ' ' + (Number $wordY) + ') scale(' + (Number $wordScale) + ')" d="' + $word.d + '"/><path transform="translate(' + (Number $subX) + ' ' + (Number $subY) + ') scale(' + (Number $subScale) + ')" d="' + $subtitle.d + '"/></g></svg>'
  [IO.File]::WriteAllText((Join-Path $brandDir $variant.name),$svg)
}
$mark = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92 126" style="color:#f1c66d"><title>Sahra</title>' + $emblem + '</svg>'
[IO.File]::WriteAllText((Join-Path $brandDir 'sahra-mark.svg'),$mark)
$favicon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="27" fill="#26291f"/><g transform="translate(18 3)" style="color:#f1c66d">'+$emblem+'</g></svg>'
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'dist/logo.svg'),$favicon)
Write-Output 'Created three outlined SVG logo assets and the matching favicon.'
