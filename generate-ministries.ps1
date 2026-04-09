# Ministries data
$ministries = @(
    @{
        file = "choir.html"
        title = "Choir Ministry"
        bio = "Leads worship through music, blending Anglican tradition with hymns and choral excellence."
        icon = "fa-music"
    },
    @{
        file = "youth.html"
        title = "Youth Ministry"
        bio = "Fellowship, service, and spiritual growth for young people (ages 13-25)."
        icon = "fa-heart"
    },
    @{
        file = "outreach.html"
        title = "Community Outreach"
        bio = "Serving the community through charity programs, support initiatives, and evangelism."
        icon = "fa-handshake"
    },
    @{
        file = "sunday-school.html"
        title = "Sunday School"
        bio = "Teaching children about God in a fun, safe, and nurturing environment."
        icon = "fa-book"
    },
    @{
        file = "mothers-union.html"
        title = "Mothers Union"
        bio = "Supporting families through prayer, outreach, and Christian family values."
        icon = "fa-venus"
    },
    @{
        file = "womens-fellowship.html"
        title = "Anglican Womens Fellowship"
        bio = "Encouraging spiritual growth, unity, and service among women."
        icon = "fa-users"
    },
    @{
        file = "mens-guild.html"
        title = "Bernard Mizeki Mens Guild"
        bio = "A mens fellowship inspired by St. Bernard Mizeki, focused on faith, service, and leadership."
        icon = "fa-male"
    },
    @{
        file = "anglican-mens-guild.html"
        title = "Anglican Mens Guild"
        bio = "Strengthening men in faith and commitment to church life and service."
        icon = "fa-shield"
    },
    @{
        file = "lay-ministers.html"
        title = "Lay Ministers"
        bio = "Supporting clergy through worship assistance, pastoral care, and ministry work."
        icon = "fa-hands-praying"
    },
    @{
        file = "st-agnes.html"
        title = "St. Agnes Guild"
        bio = "Guiding young girls in Christian values, leadership, and service."
        icon = "fa-cross"
    },
    @{
        file = "st-mary-magdalene.html"
        title = "St. Mary Magdalene Guild"
        bio = "A womens fellowship inspired by devotion, service, and spiritual growth."
        icon = "fa-dove"
    },
    @{
        file = "women-of-charity.html"
        title = "Women of Charity"
        bio = "Focused on acts of kindness, service, and helping those in need."
        icon = "fa-gift"
    }
)

# Read template
$template = Get-Content -Path "c:\st-francis-church\ministries\st-lawrence-guild.html" -Raw

foreach ($ministry in $ministries) {
    $content = $template
    
    # Replace content
    $content = $content -replace "St\. Lawrence Guild", $ministry.title
    $content = $content -replace "A guild of altar servers dedicated to reverence, discipline, and faithful service at the altar, inspired by St\. Lawrence's devotion and martyrdom\.", $ministry.bio
    $content = $content -replace "The St\. Lawrence Guild honors the legacy of Saint Lawrence through fellowship and dedicated service\. Like Saint Lawrence who gave himself in service to Christ, we gather as men committed to supporting one another and serving our community with strength and compassion\..*?Through regular meetings, spiritual study, charitable work, and brotherhood, we live out our faith together\. All men are welcome to join this fellowship\.", "The $($ministry.title) is dedicated to the spiritual growth and active service of our community members. We gather regularly for fellowship, study, and meaningful work that reflects our commitment to faith and service."
    
    # Update profile icon
    $content = $content -replace '<i class="fas fa-shield-alt"></i>', "<i class=`"fas $($ministry.icon)`"></i>"
    
    # Update title in HTML
    $content = $content -replace '<title>St\. Lawrence Guild \| St\. Francis of Assisi Church</title>', "<title>$($ministry.title) | St. Francis of Assisi Church</title>"
    $content = $content -replace '<meta name="description" content="St\. Lawrence Guild - Fellowship & Service for Men">', "<meta name=`"description`" content=`"$($ministry.title) - St. Francis of Assisi Church`">"
    
    # Write file
    $path = "c:\st-francis-church\ministries\$($ministry.file)"
    Set-Content -Path $path -Value $content
    Write-Host "Created: $($ministry.file)"
}

Write-Host "All 12 ministry pages created successfully!"
