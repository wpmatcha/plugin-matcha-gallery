Add-Type -AssemblyName System.Drawing

$baseDir = "c:\Users\Brosoft\Local Sites\matcha-ai-smart-gallery\app\public\wp-content\plugins\matcha-gallery\.wordpress-org"
$photoPath = Join-Path $baseDir "gallery-mosaic-square.jpg"
$photo = [System.Drawing.Image]::FromFile($photoPath)

function GenerateIcon($size, $radius, $outFileName) {
    $outPath = Join-Path $baseDir $outFileName
    $pluginOutPath = Join-Path "c:\Users\Brosoft\Local Sites\matcha-ai-smart-gallery\app\public\wp-content\plugins\matcha-gallery\assets\images" $outFileName
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Matte Sage Background (#73907F)
    $sageColor = [System.Drawing.Color]::FromArgb(255, 115, 144, 127)
    $g.Clear($sageColor)
    
    $s = $size / 256.0
    
    # Pure Symbol Mode: Centered Leaf Contour:
    # M 47,45 L 147,45 A 62,62 0 0,1 209,107 L 209,211 L 109,211 A 62,62 0 0,1 47,149 Z
    $leafBox = New-Object System.Drawing.Drawing2D.GraphicsPath
    
    # Top edge: (47, 45) to (147, 45)
    $leafBox.AddLine([float](47 * $s), [float](45 * $s), [float](147 * $s), [float](45 * $s))
    # Top-right arc: from (147, 45) sweeping 90 deg to (209, 107)
    $leafBox.AddArc([float](85 * $s), [float](45 * $s), [float](124 * $s), [float](124 * $s), 270, 90)
    # Right edge: from (209, 107) down to (209, 211)
    $leafBox.AddLine([float](209 * $s), [float](107 * $s), [float](209 * $s), [float](211 * $s))
    # Bottom edge: from (209, 211) left to (109, 211)
    $leafBox.AddLine([float](209 * $s), [float](211 * $s), [float](109 * $s), [float](211 * $s))
    # Bottom-left arc: from (109, 211) sweeping 90 deg to (47, 149)
    $leafBox.AddArc([float](47 * $s), [float](87 * $s), [float](124 * $s), [float](124 * $s), 90, 90)
    # Left edge: from (47, 149) up to (47, 45)
    $leafBox.AddLine([float](47 * $s), [float](149 * $s), [float](47 * $s), [float](45 * $s))
    $leafBox.CloseFigure()
    
    # Double-Exposure Photo: Clip and draw full mosaic gallery wall inside centered leaf
    $g.SetClip($leafBox)
    $g.DrawImage($photo, [System.Drawing.RectangleF]::new([float](34 * $s), [float](32 * $s), [float](188 * $s), [float](188 * $s)))
    
    # Subtle matte sage grading over the photo (14% opacity)
    $tintBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(36, 115, 144, 127))
    $g.FillPath($tintBrush, $leafBox)
    $tintBrush.Dispose()
    
    # Reset clip back to full canvas
    $g.ResetClip()
    
    # White Leaf-Box Border (2.2px)
    $whitePen1 = New-Object System.Drawing.Pen -ArgumentList ([System.Drawing.Color]::FromArgb(255, 255, 255, 255)), ([float](2.2 * $s))
    $g.DrawPath($whitePen1, $leafBox)
    $whitePen1.Dispose()
    
    # 4 White Concentric Gyre Loops centered at (128, 128)
    function DrawTiltedEllipse($cx, $cy, $rx, $ry, $angle, $alpha, $width) {
        $state = $g.Save()
        $g.TranslateTransform([float]($cx * $s), [float]($cy * $s))
        $g.RotateTransform([float]$angle)
        $pen = New-Object System.Drawing.Pen -ArgumentList ([System.Drawing.Color]::FromArgb($alpha, 255, 255, 255)), ([float]($width * $s))
        $g.DrawEllipse($pen, [float](-$rx * $s), [float](-$ry * $s), [float]($rx * 2 * $s), [float]($ry * 2 * $s))
        $pen.Dispose()
        $g.Restore($state)
    }
    
    DrawTiltedEllipse 128 128 62 48 -22 230 2.0
    DrawTiltedEllipse 128 128 56 45  24 217 2.0
    DrawTiltedEllipse 128 128 48 40  -8 204 2.0
    DrawTiltedEllipse 128 128 36 29  12 242 2.0
    
    $leafBox.Dispose()
    
    # Save PNG to both .wordpress-org and assets/images
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($pluginOutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated $outFileName ($size x $size) with pure symbol design to both folders!"
}

GenerateIcon 256 0 "icon-256x256.png"
GenerateIcon 128 0 "icon-128x128.png"
$photo.Dispose()
Write-Host "Pure Symbol icons successfully generated!"


