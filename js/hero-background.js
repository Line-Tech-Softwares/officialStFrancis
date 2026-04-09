/**
 * Dynamic Hero Background Image Switcher
 * Changes hero background based on time of day
 * Daytime: 6:00 AM - 5:59 PM
 * Nighttime: 6:00 PM - 5:59 AM
 */

(function() {
    const setHeroBackground = () => {
        const currentHour = new Date().getHours();
        const heroBackground = document.querySelector('.hero__background');
        
        if (!heroBackground) {
            console.log('Hero background element not found');
            return;
        }

        // Daytime: 6 AM to 5:59 PM (hours 6-17)
        const daytimeImage = 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwerEEY7cL7yYWsnKTPoMSuCgvgEkx4r3eAgeeDQMR_ESSa3bcCiaf8dF0E98Q5jNyzLwaqd2bXVjaj1C84I-uJvSKYabIsN5VeRWmhWspw1PageHsVbRX_a4cFY8aFrxn-uB6Ac=s1360-w1360-h1020-rw';
        
        // Nighttime: 6 PM to 5:59 AM (hours 18-23 and 0-5)
        const nighttimeImage = 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwep7XHHYCu2FmzN_WIehOvsqfnSlvyKFnxuzcI7OI5b_qRAVZVSSDIK4ojeHMv8WqWb4HNzG7xwn2nXOmlCdUPjLzUXp-qgxEoyk4ampAJdA4Ve29kNyXQevoJ7MSz6r26VfFWPxKK5h5N_i=s1360-w1360-h1020-rw';

        // Determine which image to use
        const imageUrl = (currentHour >= 6 && currentHour < 18) ? daytimeImage : nighttimeImage;
        
        // Set background image
        heroBackground.style.backgroundImage = `url('${imageUrl}')`;
        heroBackground.style.backgroundSize = 'cover';
        heroBackground.style.backgroundPosition = 'center';
        heroBackground.style.backgroundAttachment = 'fixed';
    };

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setHeroBackground);
    } else {
        setHeroBackground();
    }

    // Update background every minute in case user keeps page open
    setInterval(setHeroBackground, 60000);
})();
