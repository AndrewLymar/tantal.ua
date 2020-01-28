window.addEventListener('load', function () {
    var viLazyloadPlaybtn = document.querySelector(".vi-lazyload-playbtn");
    var viLazyloadImg = document.querySelector(".vi-lazyload-img");

    viLazyloadPlaybtn.addEventListener("click", function () {
        setTimeout(function () {
                viLazyloadImg.style.visibility = "hidden";
            },
            3000);
    });
});
