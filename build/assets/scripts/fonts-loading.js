(function() {
    "use strict";
    // Optimization for Repeat Views
    if( sessionStorage.fontsLoadedCriticalFoftPreloadFallback ) {
        document.documentElement.className += " fonts-loaded-2";
        return;
    } else if( "fonts" in document ) {
        document.fonts.load("1em BodoniSubset").then(function () {
            document.documentElement.className += " fonts-loaded-1";
            Promise.all([
                document.fonts.load("400 1em Bodoni"),
                document.fonts.load("500 1em Bodoni"),
                // document.fonts.load("600 1em Bodoni"),
                document.fonts.load("700 1em Bodoni"),
                // document.fonts.load("900 1em Bodoni"),
                document.fonts.load("italic 500 1em Bodoni")
            ]).then(function () {
                document.documentElement.className += " fonts-loaded-2";
                // Optimization for Repeat Views
                sessionStorage.fontsLoadedCriticalFoftPreloadFallback = true;
            });
        });
    } else {
        // use fallback
        var ref = document.getElementsByTagName("script")[0];
        var script = document.createElement("script");
        script.src = "./scripts/critical-foft-preload-fallback-optional.js";
        script.async = true;
        ref.parentNode.insertBefore( script, ref );
        /*
         * technically you could trigger the web font load here too and race it with
         * the polyfill load, this means creating an element with text content that
         * uses the font and attaching it to the document
         * <div style="font-family: Montserrat; font-weight: 400; font-style: italic">A</div>
         */
    }
})();