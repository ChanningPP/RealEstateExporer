//variant to keep dataset
var data;
//array to keep markers
var markers = [];
//get page id
function getUrlVars() {
    var vars = [],
        hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

//iterate records
function iterateRecords(data) {
    var getParams = getUrlVars();
    $.each(data.result.records, function(recordKey, recordValue) {
        var dict = [];
        var recordImageThumbnail = recordValue['150_pixel_jpg'];
        var recordImageLarge = recordValue['1000_pixel_jpg'];
        var recordDescription = recordValue['dc:description'];
        var recordID = recordValue['_id'];
        var recordFormat = recordValue['dc:format'];
        var recordPublisher = recordValue['dc:publisher'];
        var recordSource = recordValue['dc:source'];
        var recordAccession = recordValue['dcterms:isPartOf'];
        var recordSpatial = recordValue['dcterms:spatial'];
        var recordTitle = recordValue['dc:title'];
        var recordYear = parseInt(getYear(recordValue['dcterms:temporal']));
        var title = getTitle(recordValue['dc:title']);
        var latitude = getLatitude(recordSpatial);
        var longitude = getLongitude(recordSpatial);
        dict['lat'] = parseFloat(latitude);
        dict['lng'] = parseFloat(longitude);
        //add data on detailpage
        if (recordID == getParams['id']) {
            if (recordTitle && recordYear && recordImageThumbnail && recordImageLarge && recordDescription) {
                $('#img1').attr('src', recordImageLarge);
                $('#detailtitle').text(title);
                $('#detaildescription').text(recordDescription);
                $('#recordID').text(recordID);
                $('#recordPublisher').text(recordPublisher);
                $('#recordFormat').text(recordFormat);
                $('#recordSource').text(recordSource);
                $('#recordAccession').text(recordAccession);
                $('#recordSpatial').text(recordSpatial);

            }
        }
        //add records on list page
        if (recordTitle && recordYear && recordImageThumbnail && recordImageLarge && recordDescription) {
            $('#records').append(
                $('<div class="container ">').append($('<div class="row record">').append(
                    $('<div class="col-md-4">').append(
                        $('<a>').attr('href', recordImageLarge)
                        .attr('target', '_blank')
                        .append(
                            $('<img>').attr('src', recordImageThumbnail)
                        ),
                    ),
                    $('<div class="col-md-4">').append(
                        $('<h6>').text(title),
                        $('<h4>').text(recordYear),
                    ),
                    $('<div class="col-md-4">').append(
                        $('<a class="btn btn-info btn-sm">').attr('href', 'detailpage.html?id=' + recordID).append('Learn More'),
                        $('<a class="btn diy button-enabled" id="button' + recordID + '" style="color:white;">').attr('href', '#').append('Add to game!')
                    ),
                ))
            );
        }
    });
}

//get year of data
function getYear(year) {
    if (year) {
        return year.match(/[\d]{4}/);
    }
}

//get title of year
function getTitle(title) {
    if (title) {
        var newtitle = title.split(',')[0];
        return newtitle
    }
}

//get Latitude
function getLatitude(spatial) {
    if (spatial) {
        var loc = spatial.split('; ')[1];
        if (loc) {
            var latitude = loc.split(',')[0];
            return latitude;
        }
    }
}

//get Longitude
function getLongitude(spatial) {
    if (spatial) {
        var loc = spatial.split('; ')[1];
        if (loc) {
            var longitude = loc.split(',')[1];
            return longitude;
        }
    }
}

//get records from a duration
function durationSearch(start, end) {
    $('.record').remove();
    //var i = 0;
    var getParams = getUrlVars();
    //iterate data
    $.each(data.result.records, function(recordKey, recordValue) {
        var title = getTitle(recordValue['dc:title']);
        var recordTitle = recordValue['dc:title'];
        var recordYear = parseInt(getYear(recordValue['dcterms:temporal']));
        var recordImageThumbnail = recordValue['150_pixel_jpg'];
        var recordImageLarge = recordValue['1000_pixel_jpg'];
        var recordDescription = recordValue['dc:description'];
        var recordID = recordValue['_id'];

        //add data on detailpage
        if (recordID == getParams['id']) {
            if (recordTitle && recordYear && recordImageThumbnail && recordImageLarge && recordDescription) {
                $('#img1').attr('src', recordImageThumbnail);
                $('#detailtitle').text(title);
                $('#detaildescription').text(recordDescription);
            }
        }
        //get data from a duration
        if (recordTitle && recordYear && recordImageThumbnail && recordImageLarge && recordDescription) {
            if (recordYear >= start && recordYear <= end) {
                //i = i +1;
                $('#records').append(
                    $('<div class="container ">').append($('<div class="row record">').append(
                        $('<div class="col-md-4">').append(
                            $('<a>').attr('href', recordImageLarge)
                            .attr('target', '_blank')
                            .append(
                                $('<img>').attr('src', recordImageThumbnail)
                            ),
                        ),
                        $('<div class="col-md-4">').append(
                            $('<h6>').text(title),
                            $('<h4>').text(recordYear),
                        ),
                        $('<div class="col-md-4">').append(
                            $('<a class="btn btn-info btn-sm">').attr('href', 'detailpage.html?id=' + recordID).append('Learn More'),
                        ),

                    ))
                );
            }
        }
    });
    //console.log(i);
}

$(document).ready(function() {
    //get data from localstoralge
    if (localStorage.getItem('slqData')) {
        data = localStorage.getItem('slqData');
        data = JSON.parse(data);
        iterateRecords(data);
        console.log('From localStorage');
    } else {
        data = {
            resource_id: 'f5ecd45e-7730-4517-ad29-73813c7feda8',
            limit: 1000
        }
        //get data from dataset
        $.ajax({
            url: 'https://data.gov.au/api/action/datastore_search',
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

    //  Check if there is "propertyList" in localStorage
    var check = localStorage.getItem("propertyList");
    var propertyContents = [];
    //  Determine whether propertyList exists
    if (check) {
        propertyContents = JSON.parse(check);
    };

    //Show added properties when the list page is refreshed
    $.each(propertyContents, function(index, value) {
        if (checkPropertyList(value)) {
            $("#button" + value).addClass("button-disabled");
            $("#button" + value).html("Added!");
        }
    });

    //DIY monopoly function starts from here on list page
    $('.diy').click(function(e) {
        e.preventDefault();
        var check = localStorage.getItem("propertyList");
        var propertyContents = [];
        //  Determine whether propertyList exists
        if (check) {
            propertyContents = JSON.parse(check);
        };

        var id = $(this).attr("id").replace("button", "");

        if (checkPropertyList(id) == false) {
            if (propertyContents.length < 6) {
                propertyContents.push(id);
                $(this).addClass("button-disabled");
                $(this).html("Added!");
            } else {
                //  When the number of added properties is enough, popup a box to remind the user to play the game
                $('html, body').animate({
                    scrollTop: 0
                }, 0);
                showPopup("enoughProperty");
                $(".clickable").click(function() {
                    closePopup();
                    $(window).attr("location", "monopoly.html");
                });
            }
            localStorage.setItem('propertyList', JSON.stringify(propertyContents));
        };
    });


    $('.reset-property').click(function() {
        //  Clear localStorage
        localStorage.setItem('propertyList', JSON.stringify([]));
        //  Reset all add-button
        $('.diy').removeClass("button-disabled");
        $('.diy').html("Add to game!");
    });



    $('.game-button').click(function() {
        // When the number of added properties is enough, turn to the game page
        if (localStorage.getItem("propertyList")) {
            if (JSON.parse(localStorage.getItem("propertyList")).length == 6) {
                $(window).attr("location", "monopoly.html");
            } else {
                showPopup("addProperty");
                $(".clickable").click(function() {
                    closePopup();
                });
            };
        } else {
            showPopup("addProperty");
            $(".clickable").click(function() {
                closePopup();
            });
        }

        // When the player try to start game mode, if the number of property is not enough, popup a box to remind the number of properties that player need to add

    });

    //get data from 1865 to 1875
    $('#duration1').click(function() {
        durationSearch(1865, 1875);

    });
    //get data from 1876 to 1886
    $('#duration2').click(function() {
        durationSearch(1876, 1886);

    });
    //get data from 1887 to 1897
    $('#duration3').click(function() {
        durationSearch(1887, 1897);

    });
    //get data from 1898 to 1908
    $('#duration4').click(function() {
        durationSearch(1898, 1908);

    });
    //get data from 1909 to 1925
    $('#duration5').click(function() {
        durationSearch(1909, 1925);
    });
    //get data accroding to users' search
    $('#listSearch').click(function() {
        //remove default loaded data
        $('.record').remove();
        //get the user's input
        var value = $('#listInput').val();
        var getParams = getUrlVars();
        //iterate data
        $.each(data.result.records, function(recordKey, recordValue) {
            var dict = [];
            var recordImageThumbnail = recordValue['150_pixel_jpg'];
            var recordImageLarge = recordValue['1000_pixel_jpg'];
            var recordDescription = recordValue['dc:description'];
            var recordID = recordValue['_id'];
            var recordFormat = recordValue['dc:format'];
            var recordPublisher = recordValue['dc:publisher'];
            var recordSource = recordValue['dc:source'];
            var recordAccession = recordValue['dcterms:isPartOf'];
            var recordSpatial = recordValue['dcterms:spatial'];
            var recordTitle = recordValue['dc:title'];
            var recordYear = parseInt(getYear(recordValue['dcterms:temporal']));
            var title = getTitle(recordValue['dc:title']);
            var latitude = getLatitude(recordSpatial);
            var longitude = getLongitude(recordSpatial);
            dict['lat'] = parseFloat(latitude);
            dict['lng'] = parseFloat(longitude);
            //add data on detailpage
            if (recordID == getParams['id']) {
                if (recordTitle && recordYear && recordImageThumbnail && recordImageLarge && recordDescription) {
                    $('#img1').attr('src', recordImageLarge);
                    $('#detailtitle').text(title);
                    $('#detaildescription').text(recordDescription);
                    $('#recordID').text(recordID);
                    $('#recordPublisher').text(recordPublisher);
                    $('#recordFormat').text(recordFormat);
                    $('#recordSource').text(recordSource);
                    $('#recordAccession').text(recordAccession);
                    $('#recordSpatial').text(recordSpatial);
                }
            }

            //determine whether data in the dataset has the same year as input
            if (recordTitle && recordYear && recordImageThumbnail && recordImageLarge && recordDescription && recordYear == value) {
                $('#records').append(
                    $('<div class="container ">').append($('<div class="row record">').append(
                        $('<div class="col-md-4">').append(
                            $('<a>').attr('href', recordImageLarge)
                            .attr('target', '_blank')
                            .append(
                                $('<img>').attr('src', recordImageThumbnail)
                            ),
                        ),
                        $('<div class="col-md-4">').append(
                            $('<h6>').text(title),
                            $('<h4>').text(recordYear),
                        ),
                        $('<div class="col-md-4">').append(
                            $('<a class="btn btn-info btn-sm">').attr('href', 'detailpage.html?id=' + recordID).append('Learn More'),
                        ),
                    ))
                );
            };
        });
    });
})

//Google map API
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        center: {
            lat: -27.476616,
            lng: 153.030957
        }
    });
    //iterate data
    console.log(data);
    $.each(data.result.records, function(recordKey, recordValue) {
        var title = getTitle(recordValue['dc:title']);
        var recordYear = getYear(recordValue['dcterms:temporal']);
        var recordImageThumbnail = recordValue['150_pixel_jpg'];
        var recordDescription = recordValue['dc:description'];
        var dict = {};
        var latitude = getLatitude(recordValue['dcterms:spatial']);
        var longitude = getLongitude(recordValue['dcterms:spatial']);
        var recordID = recordValue['_id'];
        dict['lat'] = parseFloat(latitude);
        dict['lng'] = parseFloat(longitude);
        var marker = new google.maps.Marker({
            position: dict,
            map: map
        });
        var getParams = getUrlVars();
        //add data on detailpage
        if (recordID == getParams['id']) {
            if (recordTitle && recordYear && recordImageThumbnail && recordImageLarge && recordDescription) {
                $('#img1').attr('src', recordImageThumbnail);
                $('#detailtitle').text(title);
                $('#detaildescription').text(recordDescription);
            }
        }
        var linkpage = 'detailpage.html?id=' + recordID;
        //add description on infowindow
        var infowindow = new google.maps.InfoWindow({
            content: '<h4>' + title + '</h4>' + '<img src =' + recordImageThumbnail + '>' +
                '<p><a href=' + linkpage + '>See Details</a></P>'
        });
        //add event to marker clicking
        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });
        //add marker into a array
        markers.push(marker);
    });
    //use markercluster to show marker
    var markerCluster = new MarkerClusterer(map, markers, {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    });

}

// Check if the id of the property is in the PropertyList
function checkPropertyList(id) {
    if (localStorage.getItem("propertyList")) {
        if ($.inArray(id, JSON.parse(localStorage.getItem("propertyList"))) != -1) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}


//Get a popup box
function getPopup(popupId) {
    return $(".popup-lightbox .popup-page#" + popupId);
}

//Show a popup box
function showPopup(popupId) {
    $(".popup-lightbox .popup-page").hide();
    $(".popup-lightbox .popup-page#" + popupId).show();
    $(".popup-lightbox").fadeIn();
}

// Close a popup box
function closePopup() {
    $(".popup-lightbox").fadeOut();
};
