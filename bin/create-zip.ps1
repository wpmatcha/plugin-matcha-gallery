param (
    [Parameter(Mandatory=$true)]
    [string]$StageDir,

    [Parameter(Mandatory=$true)]
    [string]$ZipFile
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path $ZipFile) {
    Remove-Item $ZipFile -Force
}

$stageResolved = (Resolve-Path $StageDir).Path

$zipStream = [System.IO.File]::Open($ZipFile, [System.IO.FileMode]::Create)
$archive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)

Get-ChildItem -Path $stageResolved -Recurse -File | ForEach-Object {
    $fullPath = $_.FullName
    $relPath = $fullPath.Substring($stageResolved.Length).TrimStart('\', '/')
    $entryName = "matcha-gallery/" + ($relPath -replace '\\', '/')
    
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
        $archive,
        $fullPath,
        $entryName,
        [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
}

$archive.Dispose()
$zipStream.Dispose()

Write-Host "ZIP created successfully with POSIX forward slashes at: $ZipFile"
