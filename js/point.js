// Code expanded from filter-code.html.
// Adds form based filtering, a record count and clickable thumbnails.

// The function below is sourced from 7180 workshop taught by tutor
function iterateRecords(data) {
    // console.log(data);
    $.each(data.result.records, function(recordKey, recordValue) {

        var recordTitle = recordValue['dc:title'];
        var recordYear = getYear(recordValue['dcterms:temporal']);
        var recordImageThumbnail = recordValue['150_pixel_jpg'];
        var recordImageLarge = recordValue['1000_pixel_jpg'];
        var recordDescription = recordValue['dc:description'];
        var recordID = recordValue['_id'];

        if (recordTitle && recordYear && recordImageThumbnail && recordImageLarge && recordDescription) {

            $('#profile').append(
                $('<div class="record" id="record' + recordID + '">').append(
                    $('<div style="background:black;width:100%;">').append(
                        $('<h4 style ="color:white;">Price: $ <span class="profile-value">?</span>M</h2>'),
                        $('<h4 style ="color:white;">Rent: $ <span class="profile-rent">?</span>M</h2>'),
                    ),
                    $('<h4>').text(recordTitle),
                    $('<a>').attr('href', recordImageLarge).attr('target', '_blank').append(
                        $('<img>').attr('src', recordImageThumbnail)
                    )
                )
            );

        }

    });

    // When the user click on the "house" icon, show the property info on the right of the game page.
    // If there are enough property IDs stored in localStorage, show the property added by the user
    // If there are not enougth property IDs or no propertyList in localStorage, show the property selected from API by default
    $('.house').click(function() {
        var value = $(this).attr('house');
        // Get "propertyList" from localStorage
        if (localStorage.getItem("propertyList")) {
            if (JSON.parse(localStorage.getItem("propertyList")).length == 6) {
                var propertyList = JSON.parse(localStorage.getItem("propertyList"));
                $('.record').hide();
                $('#record' + propertyList[value]).find(".profile-value").text(Mo.calculateProperyCost($(this)));
                $('#record' + propertyList[value]).find(".profile-rent").text(Mo.calculateProperyCost($(this)) / 2);
                $('#record' + propertyList[value]).show();
            } else {
                $('.record').hide();
                $('.record:contains("' + value + '")').first().find(".profile-value").text(Mo.calculateProperyCost($(this)));
                $('.record:contains("' + value + '")').first().find(".profile-rent").text(Mo.calculateProperyCost($(this)) / 2);
                $('.record:contains("' + value + '")').first().show();
            }
        } else {
            $('.record').hide();
            $('.record:contains("' + value + '")').first().find(".profile-value").text(Mo.calculateProperyCost($(this)));
            $('.record:contains("' + value + '")').first().find(".profile-rent").text(Mo.calculateProperyCost($(this)) / 2);
            $('.record:contains("' + value + '")').first().show();
        }

    });

}

// Get the data that match the year
function getYear(year) {
    if (year) {
        return year.match(/[\d]{4}/);
    }
}

// Get API when the DOM is loaded
$(document).ready(function() {
    if (localStorage.getItem('slqData')) {
        data = localStorage.getItem('slqData');
        data = JSON.parse(data);
        iterateRecords(data);
        console.log('From localStorage');
    } else {

        var data = {
            resource_id: 'f5ecd45e-7730-4517-ad29-73813c7feda8',
            limit: 1000
        }

        $.ajax({
            url: 'http://data.gov.au/api/action/datastore_search',
            data: data,
            dataType: 'jsonp',
            cache: true,
            success: function(data) {
                iterateRecords(data);
                data = JSON.stringify(data);
                localStorage.setItem('slqData', data);
                console.log('From API');
            }
        });

    }

});
