Add-Type -AssemblyName System.Drawing

$brainDir = "$HOME\.gemini\antigravity-ide\brain\a51d6328-bcd0-45f1-9a6b-dadeb6f7ed62"
$bannerSrc = Join-Path $brainDir "matcha_banner_hero_1789759292521.png"
$iconSrc   = Join-Path $brainDir "matcha_plugin_icon_1789759306896.png"
$destDir   = "c:\Users\Brosoft\Local Sites\matcha-ai-smart-gallery\app\public\wp-content\plugins\matcha-gallery\.wordpress-org"

if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

function Resize-Image($srcFile, $destFile, $targetW, $targetH, $crop = $true) {
    $src = [System.Drawing.Image]::FromFile($srcFile)
    $bmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    if ($crop) {
        # Center-crop to aspect ratio
        $srcAspect = $src.Width / $src.Height
        $targetAspect = $targetW / $targetH
        
        if ($srcAspect -gt $targetAspect) {
            $srcH = $src.Height
            $srcW = [int]($src.Height * $targetAspect)
            $srcX = [int](($src.Width - $srcW) / 2)
            $srcY = 0
        } else {
            $srcW = $src.Width
            $srcH = [int]($src.Width / $targetAspect)
            $srcX = 0
            $srcY = [int](($src.Height - $srcH) / 2)
        }
        $srcRect = New-Object System.Drawing.Rectangle($srcX, $srcY, $srcW, $srcH)
        $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetW, $targetH)
        $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    } else {
        $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetW, $targetH)
        $g.DrawImage($src, $destRect)
    }

    $g.Dispose()
    $src.Dispose()
    $bmp.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created: $destFile ($targetW x $targetH)"
}

# 1. Banners
Resize-Image $bannerSrc (Join-Path $destDir "banner-1544x500.png") 1544 500 $true
Resize-Image $bannerSrc (Join-Path $destDir "banner-772x250.png") 772 250 $true

# 2. Icons
Resize-Image $iconSrc (Join-Path $destDir "icon-256x256.png") 256 256 $false
Resize-Image $iconSrc (Join-Path $destDir "icon-128x128.png") 128 128 $false
