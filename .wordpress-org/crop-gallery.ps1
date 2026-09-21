Add-Type -AssemblyName System.Drawing

$baseDir = "c:\Users\Brosoft\Local Sites\matcha-ai-smart-gallery\app\public\wp-content\plugins\matcha-gallery\.wordpress-org"
$srcPath = Join-Path $baseDir "gallery-preview.jpg"
$outPath = Join-Path $baseDir "gallery-mosaic-square.jpg"

$src = [System.Drawing.Image]::FromFile($srcPath)
$bmp = New-Object System.Drawing.Bitmap 800, 800
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Crop from x=120, y=0, w=800, h=800 (captures snowdrops, letter, vase, hay bale girl, flowers)
$g.DrawImage($src, [System.Drawing.Rectangle]::new(0, 0, 800, 800), 120, 0, 800, 800, [System.Drawing.GraphicsUnit]::Pixel)

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$g.Dispose()
$bmp.Dispose()
$src.Dispose()
Write-Host "Created gallery-mosaic-square.jpg (800x800)"
