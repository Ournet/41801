(function () {
    jqLoader.push(['ready', function () {
        $('.nav-trigger').on('click', function () {
            console.log('nav-trigger click')
            var el = $(this);
            el.toggleClass('active');
            $('#page-menu').toggleClass('d-block');
        });
    }]);
})();
