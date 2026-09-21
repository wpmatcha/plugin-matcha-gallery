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
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    
    # Matte Sage Background (#73907F) - Full square as defined in user's SVG
    $sageColor = [System.Drawing.Color]::FromArgb(255, 115, 144, 127)
    $g.Clear($sageColor)
    
    $s = $size / 256.0
    
    # Style 1: The Canva Botanical Leaf Contour
    $leafBox = New-Object System.Drawing.Drawing2D.GraphicsPath
    $lx = 68.0 * $s
    $ly = 24.0 * $s
    $lw = 120.0 * $s
    $lh = 122.0 * $s
    $larc = 46.0 * $s
    $larcD = $larc * 2.0
    
    # Top edge to top-right arc
    $leafBox.AddLine([float]$lx, [float]$ly, [float]($lx + $lw - $larc), [float]$ly)
    $leafBox.AddArc([float]($lx + $lw - $larcD), [float]$ly, [float]$larcD, [float]$larcD, 270, 90)
    # Right edge to bottom-right sharp corner
    $leafBox.AddLine([float]($lx + $lw), [float]($ly + $larc), [float]($lx + $lw), [float]($ly + $lh))
    # Bottom edge to bottom-left arc
    $leafBox.AddLine([float]($lx + $lw), [float]($ly + $lh), [float]($lx + $larc), [float]($ly + $lh))
    $leafBox.AddArc([float]$lx, [float]($ly + $lh - $larcD), [float]$larcD, [float]$larcD, 90, 90)
    $leafBox.CloseFigure()
    
    # Double-Exposure Photo: Clip and draw full mosaic gallery wall inside leaf
    $g.SetClip($leafBox)
    $g.DrawImage($photo, [System.Drawing.RectangleF]::new([float](58 * $s), [float](14 * $s), [float](140 * $s), [float](140 * $s)))
    
    # Subtle matte sage grading over the photo
    $tintBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(45, 115, 144, 127))
    $g.FillPath($tintBrush, $leafBox)
    $tintBrush.Dispose()
    
    # Reset clip back to full canvas
    $g.ResetClip()
    
    # White Hairline Leaf-Box Border (1.8px)
    $whitePen1 = New-Object System.Drawing.Pen -ArgumentList ([System.Drawing.Color]::FromArgb(255, 255, 255, 255)), ([float](1.8 * $s))
    $g.DrawPath($whitePen1, $leafBox)
    $whitePen1.Dispose()
    
    # 4 White Tilted Gyre Loops (Canva Signature)
    $whitePenLoop = New-Object System.Drawing.Pen -ArgumentList ([System.Drawing.Color]::FromArgb(230, 255, 255, 255)), ([float](1.6 * $s))
    
    function DrawTiltedEllipse($cx, $cy, $rx, $ry, $angle) {
        $state = $g.Save()
        $g.TranslateTransform([float]($cx * $s), [float]($cy * $s))
        $g.RotateTransform([float]$angle)
        $g.DrawEllipse($whitePenLoop, [float](-$rx * $s), [float](-$ry * $s), [float]($rx * 2 * $s), [float]($ry * 2 * $s))
        $g.Restore($state)
    }
    
    DrawTiltedEllipse 128 85 46 36 -22
    DrawTiltedEllipse 128 85 42 34 24
    DrawTiltedEllipse 128 85 36 30 -8
    DrawTiltedEllipse 128 85 27 22 12
    $whitePenLoop.Dispose()
    
    # Banner Typography:
    # "Matcha Gallery" - clean, bold Outfit style
    $fontTitle = New-Object System.Drawing.Font ("Segoe UI", [float](15.5 * $s), [System.Drawing.FontStyle]::Bold)
    $fontSub = New-Object System.Drawing.Font ("Segoe UI", [float](6.5 * $s), [System.Drawing.FontStyle]::Bold)
    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    
    $g.DrawString("Matcha Gallery", $fontTitle, $whiteBrush, [float](128 * $s), [float](168 * $s), $sf)
    $g.DrawString("A I   S M A R T   G A L L E R Y", $fontSub, $whiteBrush, [float](128 * $s), [float](195 * $s), $sf)
    
    # Small twin leaf / accent mark at bottom
    $dotBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 255, 255, 255))
    $g.FillEllipse($dotBrush, [float](126.5 * $s), [float](218 * $s), [float](3.2 * $s), [float](3.2 * $s))
    $dotBrush.Dispose()
    
    $fontTitle.Dispose()
    $fontSub.Dispose()
    $whiteBrush.Dispose()
    $leafBox.Dispose()
    
    # Save PNG to both .wordpress-org and assets/images
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($pluginOutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated $outFileName ($size x $size) with exact user SVG to both folders!"
}

GenerateIcon 256 0 "icon-256x256.png"
GenerateIcon 128 0 "icon-128x128.png"
$photo.Dispose()
Write-Host "Style 1 exact icons successfully generated!"

