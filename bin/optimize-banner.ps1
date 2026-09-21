Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\Brosoft\Local Sites\matcha-ai-smart-gallery\app\public\wp-content\plugins\matcha-gallery\.wordpress-org\studio-preview.png"
$outPath = "c:\Users\Brosoft\Local Sites\matcha-ai-smart-gallery\app\public\wp-content\plugins\matcha-gallery\.wordpress-org\studio-preview-opt.jpg"

$src = [System.Drawing.Image]::FromFile($srcPath)
$bmp = New-Object System.Drawing.Bitmap 1060, 670
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($src, 0, 0, 1060, 670)

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$g.Dispose()
$bmp.Dispose()
$src.Dispose()

Write-Host "Optimized studio preview created at: $outPath"
