/*!
 * jQuery Ticker Plugin v1.2.1
 * https://github.com/BenjaminRH/jquery-ticker
 *
 * Copyright 2014 Benjamin Harris
 * Released under the MIT license
 */
(function($) {

    // The ticker plugin
    $.fn.ticker = function(options) {
        // Extend our defaults with user-specified options
        var opts = $.extend({}, $.fn.ticker.defaults, options);

        // Handle each of the given containers
        return this.each(function () {
            // Setup the ticker elements
            var tickerContainer = $(this);                     // Outer-most ticker container
            var headlineContainer;                             // Inner headline container
            var headlineElements = tickerContainer.find('li'); // Original headline elements
            var headlines = [];                                // List of all the headlines
            var headlineTagMap = {};                           // Maps the indexes of the HTML tags in the headlines to the headline index
            var outerTimeoutId;                                // Stores the outer ticker timeout id for pauses
            var innerTimeoutId;                                // Stores the inner ticker timeout id for pauses
            var currentHeadline = 0;                           // The index of the current headline in the list of headlines
            var currentHeadlinePosition = 0;                   // The index of the current character in the current headline
            var firstOuterTick = true;                         // Whether this is the first time doing the outer tick
            var firstInnerTick = true;                         // Whether this is the first time doing the inner tick in this rendition of the outer one

            var allowedTags = ['a', 'b', 'strong', 'span', 'i', 'em', 'u'];

            if (opts.finishOnHover || opts.pauseOnHover) {
                // Setup monitoring hover state
                tickerContainer.removeClass('hover');
                tickerContainer.hover(function() {
                    $(this).toggleClass('hover');
                });
            }

            // Save all the headline text
            var h, l;
            headlineElements.each(function (index, element) {
                h = stripTags($(this).html(), allowedTags); // Strip all but the allowed tags
                l = locateTags(h); // Get the locations of the allowed tags
                h = stripTags(h); // Remove all of the HTML tags from the headline
                headlines.push(h); // Add the headline to the headlines list
                headlineTagMap[headlines.length - 1] = l; // Associate the tag map with the headline
            });

            // Randomize?
            if (opts.random) shuffleArray(headlines);

            // Now delete all the elements and add the headline container
            tickerContainer.find('ul').after('<div></div>').remove();
            headlineContainer = tickerContainer.find('div');

            // Function to actually do the outer ticker, and handle pausing
            function outerTick() {
                firstInnerTick = true;

                if (firstOuterTick) {
                    firstOuterTick = false;
                    innerTick();
                    return;
                }

                outerTimeoutId = setTimeout(function () {
                    if (opts.pauseOnHover && tickerContainer.hasClass('hover')) {
                        // User is hovering over the ticker and pause on hover is enabled
                        clearTimeout(innerTimeoutId);
                        outerTick();
                        return;
                    }

                    innerTick();
                }, opts.itemSpeed);
            }

            // Function to handle the ticking for individual headlines
            function innerTick() {
                if (firstInnerTick) {
                    firstInnerTick = false;
                    tick();
                    return;
                }

                if (currentHeadlinePosition > headlines[currentHeadline].length) {
                    advance();
                    return;
                }

                if (opts.finishOnHover && opts.pauseOnHover && tickerContainer.hasClass('hover') && currentHeadlinePosition <= headlines[currentHeadline].length) {
                    // Let's quickly complete the headline
                    // This is outside the timeout because we want to do this instantly without the pause

                    // Update the text
                    headlineContainer.html(getCurrentTick());
                    // Advance our position
                    currentHeadlinePosition += 1;

                    innerTick();
                    return;
                }
                else {
                    // Handle as normal
                    innerTimeoutId = setTimeout(function () {
                        if (opts.pauseOnHover && tickerContainer.hasClass('hover')) {
                            // User is hovering over the ticker and pause on hover is enabled
                            clearTimeout(innerTimeoutId);
                            innerTick();
                            return;
                        }

                        tick();
                        advance();
                    }, opts.cursorSpeed);
                }
            }

            function advance() {
                // Advance headline and reset character position, if it's at the end of the current headline
                if (currentHeadlinePosition > headlines[currentHeadline].length) { // > here and not == because the ticker cursor takes an extra loop
                    currentHeadline += 1;
                    currentHeadlinePosition = 0;

                    // Reset the headline and character positions if we've cycled through all the headlines
                    if (currentHeadline == headlines.length) currentHeadline = 0;

                    // STOP! We've advanced a headline. Now we just need to pause.
                    clearTimeout(innerTimeoutId);
                    clearTimeout(outerTimeoutId);
                    outerTick();
                }
            }

            // Do the individual ticks
            function tick() {
                // Now let's update the ticker with the current tick string
                if (currentHeadlinePosition === 0 && opts.fade) {
                    clearTimeout(innerTimeoutId);

                    // Animate the transition if it's enabled
                    headlineContainer.fadeOut(opts.fadeOutSpeed, function () {
                        // Now it's faded out, let's update the text
                        headlineContainer.html(getCurrentTick());
                        // And fade in
                        headlineContainer.fadeIn(opts.fadeInSpeed, function () {
                            // Advance our position
                            currentHeadlinePosition += 1;
                            // And now we're in, let's start the thing off again without the delay
                            innerTick();
                        });
                    });
                }
                else {
                    // Update the text
                    headlineContainer.html(getCurrentTick());
                    // Advance our position
                    currentHeadlinePosition += 1;
                    clearTimeout(innerTimeoutId);
                    innerTick();
                }
            }

            // Get the current tick string
            function getCurrentTick() {
                var cursor, i, j, location;
                switch (currentHeadlinePosition % 2) {
                    case 1:
                        cursor = opts.cursorOne;
                        break;
                    case 0:
                        cursor = opts.cursorTwo;
                        break;
                }

                // Don't display the cursor this was the last character of the headline
                if (currentHeadlinePosition >= headlines[currentHeadline].length) cursor = '';

                // Generate the headline
                var headline = '';
                var openedTags = [];
                for (i = 0; i < currentHeadlinePosition; i++) {
                    location = null;
                    // Check to see if there's meant to be a tag at this index
                    for (j = 0; j < headlineTagMap[currentHeadline].length; j++) {
                        // Find a tag mapped to this location, if one exists
                        if (headlineTagMap[currentHeadline][j] && headlineTagMap[currentHeadline][j].start === i) {
                            location = headlineTagMap[currentHeadline][j]; // It does exist!
                            break;
                        }
                    }

                    if (location) {
                        // Add the tag to the headline
                        headline += location.tag;

                        // Now deal with the tag for proper HTML
                        if (! location.selfClosing) {
                            if (location.tag.charAt(1) === '/') {
                                openedTags.pop();
                            }
                            else {
                                openedTags.push(location.name);
                            }
                        }
                    }

                    // Add the character to the headline
                    headline += headlines[currentHeadline][i];
                }

                // Now close the tags, if we need to (because it hasn't finished with all the text in the tag)
                for (i = 0; i < openedTags.length; i++) {
                    headline += '</' + openedTags[i] + '>';
                }

                return headline + cursor;
            }

            // Start it
            outerTick();
        });
    };

    /**
     * Randomize array element order in-place.
     * Using Fisher-Yates shuffle algorithm.
     */
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    /**
     * Strip all HTML tags from a string.
     * An array of safe tags can be passed, which will not be
     * stripped from the string with the rest of the tags.
     */
    function stripTags(text, safeTags) {
        safeTags = safeTags || [];
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/img;
        var comments = /<!--.*?-->/img;
        return text.replace(comments, '').replace(tags, function (a, b) {
            return safeTags.indexOf(b.toLowerCase()) !== -1 ? a : '';
        });
    }

    /**
     * Locates all of the requested tags in a string.
     */
    function locateTags(text, tagList) {
        tagList = tagList || [];
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/im;
        var selfClosing = /\/\s{0,}>$/m;
        var locations = [];
        var match, location;

        while ((match = tags.exec(text)) !== null) {
            if (tagList.length === 0 || tagList.indexOf(match[1]) !== -1) {
                location = {
                    tag: match[0],
                    name: match[1],
                    selfClosing: selfClosing.test(match[0]),
                    start: match.index,
                    end: match.index + match[0].length - 1
                };
                locations.push(location);

                // Now remove this tag from the string
                // so that each location will represent it in a string without any of the tags
                text = text.slice(0, location.start) + text.slice(location.end + 1);

                // Reset the regex
                tags.lastIndex = 0;
            }
        }

        return locations;
    }

    // Plugin default settings
    $.fn.ticker.defaults = {
        random:        false, // Whether to display ticker items in a random order
        itemSpeed:     3000,  // The pause on each ticker item before being replaced
        cursorSpeed:   50,    // Speed at which the characters are typed
        pauseOnHover:  true,  // Whether to pause when the mouse hovers over the ticker
        finishOnHover: true,  // Whether or not to complete the ticker item instantly when moused over
        cursorOne:     '_',   // The symbol for the first part of the cursor
        cursorTwo:     '-',   // The symbol for the second part of the cursor
        fade:          true,  // Whether to fade between ticker items or not
        fadeInSpeed:   600,   // Speed of the fade-in animation
        fadeOutSpeed:  300    // Speed of the fade-out animation
    };

})(jQuery);
