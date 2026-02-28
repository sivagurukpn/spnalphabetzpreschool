param(
  [string]$GalleryPath = "assets/img/Gallery",
  [string]$OutputFile = "index.json",
  [string]$JsOutputFile = "gallery-manifest.js"
)

$root = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { Get-Location }
$galleryDir = Join-Path $root $GalleryPath

if (-not (Test-Path $galleryDir)) {
  Write-Error "Gallery folder not found: $galleryDir"
  exit 1
}

$allowedExtensions = @('.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg')

$files = Get-ChildItem -Path $galleryDir -File |
  Where-Object { $allowedExtensions -contains $_.Extension.ToLowerInvariant() } |
  Sort-Object Name |
  Select-Object -ExpandProperty Name

$outputPath = Join-Path $galleryDir $OutputFile
$jsOutputPath = Join-Path $galleryDir $JsOutputFile

$files |
  ConvertTo-Json |
  Set-Content -Path $outputPath -Encoding UTF8

$jsContent = "window.__GALLERY_IMAGES = " + ($files | ConvertTo-Json -Compress) + ";"
$jsContent | Set-Content -Path $jsOutputPath -Encoding UTF8

Write-Host "Gallery manifest updated: $outputPath"
Write-Host "Gallery JS manifest updated: $jsOutputPath"
Write-Host "Images included: $($files.Count)"
