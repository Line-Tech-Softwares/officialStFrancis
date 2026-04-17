/*
 * Shared gallery loader for ministries.
 * Loads photo/video assets for each ministry tab from the Assets folder.
 */

document.addEventListener('DOMContentLoaded', function() {
    const pageName = window.location.pathname.split('/').pop().replace('.html', '').trim();
    const assetBase = '../Assets/';

    const pages = {
        'anglican-mens-guild': 'amg',
        'choir': 'choir',
        'lay-ministers': 'layministers',
        'mens-guild': 'bmmg',
        'mothers-union': 'mu',
        'st-agnes': 'stagnes',
        'st-lawrence-guild': 'stlawrence',
        'st-mary-magdalene': 'stmary',
        'sunday-school': 'sundayschool',
        'women-of-charity': 'woc',
        'womens-fellowship': 'awf',
        'youth': 'youth'
    };

    const galleryAssets = {
        'amg': ['AMG1.jpg', 'AMG2.jpg', 'amg3.jpg', 'amg4.jpg'],
        'awf': ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', 'awf.jpeg'],
        'bmmg': ['bmmg.jpeg', 'BMMG2.jpg', 'BMMG3.jpg', 'BMMG4.jpg'],
        'choir': ['CHOIR.jpg', 'choir2.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.mp4', '15.jpg', '16.jpg', '17.jpg', '18.jpg'],
        'layministers': ['lay1.jpg'],
        'mu': ['mu.jpeg', 'MU2.png', 'MU3.png', 'MU4.png', 'MU5.png', 'MU6.png', 'MU7.png', 'MU8.png', 'MU9.png', 'MU10.png', 'mu11.png', 'mu12.png', 'mu13.png', 'mu14.png', 'mu15.png', 'mu16.png', 'mu17.png', 'mu18.png', 'mu19.png', 'mu20.png', 'mu21.png', 'mu22.png'],
        'stagnes': ['STAGNES.png', 'STAGNES2.png'],
        'stlawrence': ['saint.jpg', 'serv.jpg', 'serv2.jpg'],
        'stmary': ['StMary3.jpg', 'stmary4.jpg', 'stmary5.jpg', 'stmary6.jpg', 'stmary7.jpeg'],
        'sundayschool': ['SundaySchool.png'],
        'woc': ['Woc.jpg', 'woc2.jpg', 'woc3.jpg'],
        'youth': ['Youth.png']
    };

    const galleryContainer = document.querySelector('.ministry__gallery');
    if (!galleryContainer) {
        return;
    }

    const folderName = pages[pageName];
    const assetList = folderName ? galleryAssets[folderName] || [] : [];

    galleryContainer.innerHTML = '';

    if (!folderName || assetList.length === 0) {
        const message = document.createElement('div');
        message.className = 'gallery__empty';
        message.innerHTML = '<div class="gallery__placeholder"><div class="gallery__icon"><i class="fas fa-images"></i></div><div class="gallery__label">No gallery assets are configured for this page yet.</div></div>';
        galleryContainer.appendChild(message);
        return;
    }

    const galleryItems = assetList.map(assetFile => {
        const extension = assetFile.split('.').pop().toLowerCase();
        const assetPath = assetBase + folderName + '/' + assetFile;
        return { assetFile, assetPath, extension };
    });

    const lightbox = createLightbox();
    let activeIndex = 0;

    galleryItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'gallery__item';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'gallery__item-button';
        button.setAttribute('aria-label', `Open ${item.assetFile}`);
        button.addEventListener('click', () => openLightbox(index));

        const media = createThumbnailMedia(item);
        button.appendChild(media);
        card.appendChild(button);

        const downloadLink = document.createElement('a');
        downloadLink.className = 'gallery__item-download';
        downloadLink.href = item.assetPath;
        downloadLink.download = item.assetFile;
        downloadLink.title = 'Download file';
        downloadLink.setAttribute('aria-label', 'Download file');
        downloadLink.innerHTML = '<i class="fas fa-download"></i>';
        downloadLink.addEventListener('click', event => event.stopPropagation());

        card.appendChild(downloadLink);
        galleryContainer.appendChild(card);
    });

    function createThumbnailMedia(item) {
        if (item.extension === 'mp4' || item.extension === 'webm') {
            const video = document.createElement('video');
            video.src = item.assetPath;
            video.muted = true;
            video.playsInline = true;
            video.preload = 'metadata';
            video.setAttribute('aria-hidden', 'true');
            return video;
        }

        const image = document.createElement('img');
        image.src = item.assetPath;
        image.alt = item.assetFile.replace(/[-_]/g, ' ').replace(/\.(jpg|jpeg|png|gif)$/i, '');
        image.loading = 'lazy';
        return image;
    }

    function createLightbox() {
        const overlay = document.createElement('div');
        overlay.className = 'gallery__lightbox';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = `
            <div class="gallery__lightbox-backdrop"></div>
            <div class="gallery__lightbox-content" role="dialog" aria-modal="true">
                <button type="button" class="gallery__lightbox-close" aria-label="Close gallery">×</button>
                <div class="gallery__lightbox-frame"></div>
                <div class="gallery__lightbox-footer">
                    <span class="gallery__lightbox-counter"></span>
                    <a class="gallery__lightbox-download" target="_blank" rel="noopener noreferrer"><i class="fas fa-download"></i> Download</a>
                </div>
                <div class="gallery__lightbox-actions">
                    <button type="button" class="gallery__lightbox-prev" aria-label="Previous item"><i class="fas fa-chevron-left"></i></button>
                    <button type="button" class="gallery__lightbox-next" aria-label="Next item"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>`;

        document.body.appendChild(overlay);

        const frame = overlay.querySelector('.gallery__lightbox-frame');
        const counter = overlay.querySelector('.gallery__lightbox-counter');
        const downloadButton = overlay.querySelector('.gallery__lightbox-download');
        const closeButton = overlay.querySelector('.gallery__lightbox-close');
        const prevButton = overlay.querySelector('.gallery__lightbox-prev');
        const nextButton = overlay.querySelector('.gallery__lightbox-next');
        const backdrop = overlay.querySelector('.gallery__lightbox-backdrop');

        closeButton.addEventListener('click', closeLightbox);
        backdrop.addEventListener('click', closeLightbox);
        prevButton.addEventListener('click', showPrevious);
        nextButton.addEventListener('click', showNext);

        // Swipe gesture support
        let touchStartX = 0;
        let touchEndX = 0;
        
        frame.addEventListener('touchstart', function(event) {
            touchStartX = event.changedTouches[0].screenX;
        }, false);
        
        frame.addEventListener('touchend', function(event) {
            touchEndX = event.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    showNext();
                } else {
                    showPrevious();
                }
            }
        }

        document.addEventListener('keydown', function(event) {
            if (!overlay.classList.contains('gallery__lightbox-open')) {
                return;
            }
            if (event.key === 'Escape') {
                closeLightbox();
            }
            if (event.key === 'ArrowLeft') {
                showPrevious();
            }
            if (event.key === 'ArrowRight') {
                showNext();
            }
        });

        return { overlay, frame, counter, downloadButton };
    }

    function openLightbox(index) {
        activeIndex = normalizeIndex(index);
        renderLightboxItem();
        lightbox.overlay.classList.add('gallery__lightbox-open');
        lightbox.overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.overlay.classList.remove('gallery__lightbox-open');
        lightbox.overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function normalizeIndex(index) {
        const length = galleryItems.length;
        return ((index % length) + length) % length;
    }

    function showPrevious() {
        activeIndex = normalizeIndex(activeIndex - 1);
        renderLightboxItem();
    }

    function showNext() {
        activeIndex = normalizeIndex(activeIndex + 1);
        renderLightboxItem();
    }

    function renderLightboxItem() {
        const item = galleryItems[activeIndex];
        lightbox.frame.innerHTML = '';

        if (item.extension === 'mp4' || item.extension === 'webm') {
            const video = document.createElement('video');
            video.src = item.assetPath;
            video.controls = true;
            video.playsInline = true;
            video.preload = 'metadata';
            video.autoplay = false;
            video.style.maxHeight = '100%';
            video.style.maxWidth = '100%';
            lightbox.frame.appendChild(video);
        } else {
            const image = document.createElement('img');
            image.src = item.assetPath;
            image.alt = item.assetFile.replace(/[-_]/g, ' ').replace(/\.(jpg|jpeg|png|gif)$/i, '');
            image.loading = 'eager';
            lightbox.frame.appendChild(image);
        }

        lightbox.counter.textContent = `${activeIndex + 1} of ${galleryItems.length}`;
        lightbox.downloadButton.href = item.assetPath;
        lightbox.downloadButton.download = item.assetFile;
    }
});
