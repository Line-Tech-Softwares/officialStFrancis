$ministries = @(
    @{name="Choir"; subtitle="Voices of Praise"; icon="fa-music"; slug="choir"},
    @{name="Youth"; subtitle="Growth in Faith & Community"; icon="fa-heart"; slug="youth"},
    @{name="Outreach"; subtitle="Serving Beyond Our Walls"; icon="fa-handshake"; slug="outreach"},
    @{name="Sunday School"; subtitle="Teaching God's Love to Children"; icon="fa-book"; slug="sunday-school"},
    @{name="Mothers Union"; subtitle="Sisterhood & Support"; icon="fa-venus"; slug="mothers-union"},
    @{name="Women's Fellowship"; subtitle="Women Growing Together"; icon="fa-users"; slug="womens-fellowship"},
    @{name="Men's Guild"; subtitle="Strength in Fellowship"; icon="fa-male"; slug="mens-guild"},
    @{name="Anglican Men's Guild"; subtitle="Men of Faith & Service"; icon="fa-shield"; slug="anglican-mens-guild"},
    @{name="Lay Ministers"; subtitle="Serving Our Community"; icon="fa-hands-praying"; slug="lay-ministers"},
    @{name="St. Agnes"; subtitle="Compassion & Care"; icon="fa-cross"; slug="st-agnes"},
    @{name="St. Mary Magdalene"; subtitle="Transformation Through Grace"; icon="fa-dove"; slug="st-mary-magdalene"},
    @{name="Women of Charity"; subtitle="Love in Action"; icon="fa-gift"; slug="women-of-charity"},
    @{name="St. Lawrence Guild"; subtitle="Fellowship & Service"; icon="fa-shield-alt"; slug="st-lawrence-guild"}
)

$templatePath = "c:\st-francis-church\ministries\st-lawrence-guild.html"
$template = Get-Content -Path $templatePath -Raw

foreach ($ministry in $ministries) {
    $updated = $template
    
    # Replace title and subtitle
    $updated = $updated -replace "St\. Lawrence Guild", $ministry.name
    $updated = $updated -replace "Fellowship & Service Inspired by Saint Lawrence", $ministry.subtitle
    $updated = $updated -replace 'data-image="">\s*<i class="fas fa-shield-alt">', "data-image=`"`">`n            <i class=`"fas $($ministry.icon)`""
    
    $filePath = "c:\st-francis-church\ministries\$($ministry.slug).html"
    
    if ($ministry.slug -eq "st-lawrence-guild") {
        Write-Host "Keeping original: $filePath"
    } else {
        Set-Content -Path $filePath -Value $updated
        Write-Host "Updated: $filePath"
    }
}

Write-Host "All ministry pages updated successfully!"
