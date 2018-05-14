$(document).ready(function () {
    $(".sidebar-box").click(function () {
        totalHeight = 0;
        totalHeight = $(this)[0].scrollHeight;
        $(this)
            .css({
                "max-height": totalHeight
            })
            .animate({
                "height": totalHeight
            });
        $('.readmore').fadeOut();
        return false;
    });
    var deferredPrompt, btnCourseChooser, btnAdd;
    btnCourseChooser = document.getElementById('btnCourseChooser');
    btnAdd = document.getElementById('btnAdd');
    window.addEventListener('beforeinstallprompt', function(e) {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI notify the user they can add to home screen
        btnCourseChooser.style.display = 'none';
        btnAdd.style.display = 'block';
    });

    btnAdd.addEventListener('click', function(e) {
        // hide our user interface that shows our A2HS button
        btnCourseChooser.style.display = 'block';
        btnAdd.style.display = 'none';
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice
            .then(function(choiceResult) {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                    btnCourseChooser.innerHTML = 'Codeshala Has Been Added To Your Homescreen';
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                deferredPrompt = null;
            });
    });
});