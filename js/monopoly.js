var Mo = {};
Mo.allowRoll = true;
Mo.moneyPassStart = 10;

// Initialize the game
Mo.init = function() {
    $(document).ready(function() {
        $("#dice button").click(function() {
            if (Mo.allowRoll) {
                Mo.rollDice();
            }
        });
        Mo.initPopups();
        Mo.showPopup("intro");
    });
};

// Get the current player
Mo.getCurrentPlayer = function() {
    return $(".player.current-turn");
};

// Get the nearest point beside the player
Mo.getPlayersPoint = function(player) {
    return player.closest(".point");
};

// Get the player's money
Mo.getPlayersMoney = function(player) {
    var playerId = parseInt(player.attr("id").replace("player", ""));
    var playersMoney = $("#player-money-" + playerId).find("span").text();
    return playersMoney;
};

// Update the player's money, if the current player is broke, the game is over
Mo.updatePlayersMoney = function(player, amount) {
    var playerId = parseInt(player.attr("id").replace("player", ""));
    var playersMoney = $("#player-money-" + playerId).find("span").text();

    playersMoney -= amount;
    $("#player-money-" + playerId).find("span").text(playersMoney);
    if (playersMoney < 0) {
        Mo.broke();
        Mo.showPopup("end");
        Mo.replayPopup();
    } else {
        Mo.setNextPlayerTurn();
    }
};

// When the player is broke, clear all the assets belonged to the player, and set the winner of this game
Mo.broke = function() {
    var player = $(".player.current-turn").attr("id");
    $(".player.current-turn").addClass('gameover');
    $('.house.' + player).addClass('available').removeClass(player).attr('owner', '').attr('rent', '');
    var playerId = parseInt(player.replace("player", ""));
    if (playerId == 1) {
        $("#player-win").text("Koala");
    } else {
        $("#player-win").text("Kangaroo");
    }
};

//Roll a dice
Mo.rollDice = function() {
    var result = Math.floor(Math.random() * 6) + 1;
    var currentPlayer = Mo.getCurrentPlayer();
    $("#dice-result span").text(result);
    Mo.handleAction(currentPlayer, "move", result);
};

//Move the player with certain steps
Mo.movePlayer = function(player, steps) {
    Mo.allowRoll = false;

    var playerMovementInterval = setInterval(function() {
        if (steps == 0) {
            clearInterval(playerMovementInterval);
            Mo.handleTurn(player);
        } else {
            var playerPoint = Mo.getPlayersPoint(player);
            var nextPoint = Mo.getNextPoint(playerPoint);
            nextPoint.find(".content").append(player);
            steps--;
        }
    }, 200);
};

// Give different feedback based on the player's location
Mo.handleTurn = function() {
    var player = Mo.getCurrentPlayer();
    var playerPoint = Mo.getPlayersPoint(player);
    if (playerPoint.is(".available.house")) {
        // alert("Buy or not?");
        Mo.handleBuyProperty(player, playerPoint);
    } else if (playerPoint.is(".house:not(.available)") && !playerPoint.hasClass(player.attr("id"))) {
        Mo.handlePayRent(player, playerPoint);
        //If current player lands on other player's property
    } else if (playerPoint.is(".chance")) {
        Mo.handleChanceCard(player);
    } else if (playerPoint.is(".go-to-jail")) {
        Mo.handleGoToJail(player);
    } else {
        Mo.setNextPlayerTurn();
    }
}

//Set the next player to play this turn
Mo.setNextPlayerTurn = function() {
    var currentPlayerTurn = Mo.getCurrentPlayer();
    var playerId = parseInt(currentPlayerTurn.attr("id").replace("player", ""));
    var nextPlayerId = playerId + 1;
    if (nextPlayerId > $(".player").length) {
        nextPlayerId = 1;
    }
    currentPlayerTurn.removeClass("current-turn");
    var nextPlayer = $(".player#player" + nextPlayerId);
    nextPlayer.addClass("current-turn");

    //Stay in jail for 3 turns
    if (nextPlayer.is(".jailed")) {
        var currentJailTime = parseInt(nextPlayer.attr("jail-time"));
        currentJailTime++;
        nextPlayer.attr("jail-time", currentJailTime);
        if (currentJailTime > 3) {
            nextPlayer.removeClass("jailed");
            nextPlayer.removeAttr("jail-time");
        }
        Mo.setNextPlayerTurn();
        return;
    }

    if (nextPlayer.is(".gameover")) {
        Mo.setNextPlayerTurn();
        return;
    }
    Mo.closePopup();
    Mo.allowRoll = true;
};

// Show the property information
Mo.showPropertyInfo = function(propertyPoint) {
    var value = $(propertyPoint).attr('house');
    if (localStorage.getItem("propertyList")) {
        if (JSON.parse(localStorage.getItem("propertyList")).length == 6) {
            var propertyList = JSON.parse(localStorage.getItem("propertyList"));
            $('.record').hide();
            $('#record' + propertyList[value]).find(".profile-value").text(Mo.calculateProperyCost($(propertyPoint)));
            $('#record' + propertyList[value]).find(".profile-rent").text(Mo.calculateProperyCost($(propertyPoint)) / 2);
            $('#record' + propertyList[value]).show();
        } else {
            $('.record').hide();
            $('.record:contains("' + value + '")').first().find(".profile-value").text(Mo.calculateProperyCost($(propertyPoint)));
            $('.record:contains("' + value + '")').first().find(".profile-rent").text(Mo.calculateProperyCost($(propertyPoint)) / 2);
            $('.record:contains("' + value + '")').first().show();
        }
    } else {
        $('.record').hide();
        $('.record:contains("' + value + '")').first().find(".profile-value").text(Mo.calculateProperyCost($(propertyPoint)));
        $('.record:contains("' + value + '")').first().find(".profile-rent").text(Mo.calculateProperyCost($(propertyPoint)) / 2);
        $('.record:contains("' + value + '")').first().show();
    }
}

// When the player land on an available property, remind the player to buy this property
Mo.handleBuyProperty = function(player, propertyPoint) {
    // Get "propertyList" from localStorage
    Mo.showPropertyInfo(propertyPoint);

    var propertyCost = Mo.calculateProperyCost(propertyPoint);
    var popup = Mo.getPopup("buy");
    popup.find(".point-price").text(propertyCost);
    popup.find("button").unbind("click").bind("click", function() {
        var clickedBtn = $(this);
        if (clickedBtn.is("#yes")) {
            Mo.handleBuy(player, propertyPoint, propertyCost);
        } else {
            Mo.closeAndNextTurn();
        }
    });
    Mo.showPopup("buy");
};

// When the player land on other player's property, remind the player to pay the rent
Mo.handlePayRent = function(player, propertyPoint) {
    Mo.showPropertyInfo(propertyPoint);
    var popup = Mo.getPopup("pay");
    var currentRent = parseInt(propertyPoint.attr("rent"));
    var properyOwnerId = propertyPoint.attr("owner");

    popup.find("#player-placeholder").text(properyOwnerId);
    popup.find("#amount-placeholder").text(currentRent);
    popup.find("button").unbind("click").bind("click", function() {
        var properyOwner = $(".player#" + properyOwnerId);
        Mo.updatePlayersMoney(player, currentRent);
        Mo.updatePlayersMoney(properyOwner, -1 * currentRent);
        Mo.closeAndNextTurn();
    });
    Mo.showPopup("pay");
};

// When the player get a "Go to jail" event, remind the player to go to the jail
Mo.handleGoToJail = function(player) {
    var popup = Mo.getPopup("jail");
    popup.find("button").unbind("click").bind("click", function() {
        Mo.handleAction(player, "jail");
    });
    Mo.showPopup("jail");
};

// When the player get a "Chance card" event, remind the player to get a random chance card
Mo.handleChanceCard = function(player) {
    var popup = Mo.getPopup("chance");
    popup.find(".popup-content #text-placeholder").text('');
    var chanceNumber = Math.floor(Math.random() * 3) + 1;
    var chanceAmount = Math.floor(Math.random() * 5) + 2;
    if (chanceNumber == 1) {
        //Step forward x steps
        popup.find(".popup-content #text-placeholder").append('You can advance <span class="chance-amount"></span> steps!');
        popup.find(".chance-amount").text(chanceAmount);
        popup.find(".popup-content button").attr("action", "move").attr("amount", chanceAmount);
    } else if (chanceNumber == 2) {
        // Pay x money
        popup.find(".popup-content #text-placeholder").append('You need to pay $ <span class="chance-amount"></span>M tax!');
        popup.find(".chance-amount").text(chanceAmount);
        popup.find(".popup-content button").attr("action", "pay").attr("amount", chanceAmount);
    } else if (chanceNumber == 3) {
        // Win x money
        popup.find(".popup-content #text-placeholder").append('You win a $ <span class="chance-amount"></span>M lotto!');
        popup.find(".chance-amount").text(chanceAmount);
        popup.find(".popup-content button").attr("action", "pay").attr("amount", -chanceAmount);
    }

    popup.find(".popup-title").text("Chance Card!");
    popup.find("button").unbind("click").bind("click", function() {
        var currentBtn = $(this);
        var action = currentBtn.attr("action");
        var amount = currentBtn.attr("amount");
        Mo.handleAction(player, action, amount);
    });
    Mo.showPopup("chance");
};

// Sent the player to the jail point, and give a jail-time counter to the player
Mo.sendToJail = function(player) {
    player.addClass("jailed");
    player.attr("jail-time", 1);
    $(".point.in-jail").append(player);
    // Mo.playSound("woopwoop");
    Mo.setNextPlayerTurn();
    Mo.closePopup();
};

// Get a popup object
Mo.getPopup = function(popupId) {
    return $(".popup-lightbox .popup-page#" + popupId);
};

//Calculate the property's price based on the district
Mo.calculateProperyCost = function(propertyPoint) {
    var pointGroup = propertyPoint.attr("group");
    var pointPrice = parseInt(pointGroup.replace("group", "")) * 2;

    return pointPrice;
};

// Calculate the property's rent
Mo.calculateProperyRent = function(propertyCost) {
    return propertyCost / 2;
};

// Close the popup box and set the next player's turn
Mo.closeAndNextTurn = function() {
    Mo.setNextPlayerTurn();
    Mo.closePopup();
};

// Initialized popup onclick function
Mo.initPopups = function() {
    $("#play").click(function() {
        Mo.createPlayers(2);
        Mo.closePopup();
    });
};

// Restart popup onclick function
Mo.replayPopup = function() {
    $("#replay").click(function() {
        $(window).attr("location", "monopoly.html");
        Mo.closePopup()
    });
}

// Set the property's trade
Mo.handleBuy = function(player, propertyPoint, propertyCost) {
    var playersMoney = Mo.getPlayersMoney(player);
    if (playersMoney < propertyCost) {
        // Mo.playSound("no");
        Mo.showError();
    } else {
        Mo.updatePlayersMoney(player, propertyCost);
        var rent = Mo.calculateProperyRent(propertyCost);

        propertyPoint.removeClass("available")
            .addClass(player.attr("id"))
            .attr("owner", player.attr("id"))
            .attr("rent", rent);
        Mo.setNextPlayerTurn();
    }
};

// Make different operation on the player based on different cases
Mo.handleAction = function(player, action, amount) {
    switch (action) {
        case "move":
            Mo.movePlayer(player, amount);
            break;
        case "pay":
            Mo.updatePlayersMoney(player, amount);
            break;
        case "jail":
            Mo.sendToJail(player);
            break;
    };
};

// Create player
Mo.createPlayers = function() {
    var startPoint = $(".start");
    for (var i = 1; i <= 2; i++) {
        var player = $("<div />").addClass("player").attr("id", "player" + i);
        startPoint.find(".content").append(player);
        if (i == 1) {
            player.addClass("current-turn");
        }
    }
};

// Get the next point to move on the map
Mo.getNextPoint = function(point) {
    var currentPointId = parseInt(point.attr("id"));
    var nextPointId = currentPointId + 1
    if (nextPointId > 30) {
        Mo.handlePassedStart();
        nextPointId = 1;
    }
    return $(".point#" + nextPointId);
};

// Give exta bonus when the player pass the start point
Mo.handlePassedStart = function() {
    var player = Mo.getCurrentPlayer();
    Mo.updatePlayersMoney(player, -Mo.moneyPassStart / 5);
};

// Show an warning info
Mo.showError = function() {
    $(".popup-page .invalid-error").fadeTo(500, 1);
    setTimeout(function() {
        $(".popup-page .invalid-error").fadeTo(500, 0);
    }, 2000);
};

// Close the popup box
Mo.closePopup = function() {
    $(".popup-lightbox").fadeOut();
};

// Show the popup box
Mo.showPopup = function(popupId) {
    $(".popup-lightbox .popup-page").hide();
    $(".popup-lightbox .popup-page#" + popupId).show();
    $(".popup-lightbox").fadeIn();
};

// Initialize the monopoly game
Mo.init();
