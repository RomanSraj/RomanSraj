// baseUrl = "http://127.0.0.1:5000" // Local
baseUrl = "https://romansraj.github.io/RomanSraj/"
settings = {}
singleBrawlArray = []
guildBrawlsArray = []
guildOverviewArray = []
guildNameMapping = {}

function getGuildNameMapping() {
    $.ajax({
        method: "GET",
        url: baseUrl + "/guild_name_mapping",
        success: function (response) {
            guildNameMapping = response;
        }
    })
}


function getSingleBrawlData(guildId, brawlId) {
    $.ajax({
        method: "GET",
        url: baseUrl + "/single_brawl?guild_id=" + guildId + "&brawl_id=" + brawlId,
        success: function (response) {
            singleBrawlArray = response;
            buildSingleBrawlTable(singleBrawlArray);
        }
    })
}


function buildSingleBrawlTable(data) {
    var table = document.getElementById("singleBrawlTable");
    table.innerHTML = "";

    for (var i = 0; i < data.length; i++) {
        var row = `<tr>
                         <td>${data[i].player}</td>
                         <td>${data[i].fray_index}</td>
                         <td>${data[i].wins}</td>
                         <td>${data[i].losses}</td>
                         <td>${data[i].draws}</td>
                   </tr>`

        table.innerHTML += row;
    }
}


function getGuildBrawlData(guildId, brawlId) {
    $.ajax({
        method: "GET",
        url: baseUrl + "/guild_brawls?guild_id=" + guildId + "&brawl_id=" + brawlId,
        success: function (response) {
            guildBrawlsArray = response;
            buildGuildBrawlsTable(guildBrawlsArray);
        }
    })
}


function buildGuildBrawlsTable(data) {
    var table = document.getElementById("guildBrawlsTable");
    table.innerHTML = "";

    for (var i = 0; i < data.length; i++) {
        var row = `<tr>
                         <td>${data[i].name}</td>
                         <td>${data[i].wins}</td>
                         <td>${data[i].losses}</td>
                         <td>${data[i].draws}</td>
                         <td>${data[i].member_merits_payout}</td>
                   </tr>`

        table.innerHTML += row;
    }
}


function getGuildData(guildId) {
    $.ajax({
        method: "GET",
        url: baseUrl + "/guild_overview?guild_id=" + guildId,
        success: function (response) {
            guildOverviewArray = response;
            buildGuildOverviewTable(guildOverviewArray);
        }
    })
}


function buildGuildOverviewTable(data) {
    var table = document.getElementById("guildOverviewTable");
    table.dataset.guild_id = data[0].guild_id;
    table.dataset.brawl_id = data[0].tournament_id;
    table.innerHTML = "";

    for (var i = 0; i < data.length; i++) {
        var row = `<tr>
                         <td>${data[i].cycle}</td>
                         <td>${data[i].brawl_level}</td>
                         <td>${data[i].brawl_rank}</td>
                         <td>${data[i].wins}</td>
                         <td>${data[i].losses}</td>
                         <td>${data[i].draws}</td>
                         <td>${data[i].total_merits_payout}</td>
                   </tr>`

        table.innerHTML += row;
    }
}


function getGuildBrawl(guildId, brawlId) {
    $.ajax({
        method: "GET",
        url: baseUrl + "/guild_brawls?guild_id=" + guildId + "&brawl_id=" + brawlId,
        success: function (response) {
            guildBrawlsArray = response;
            buildGuildBrawlsTable(guildBrawlsArray);
        }
    })
}


function getSingleBrawl(guildId, brawlId) {
    $.ajax({
        method: "GET",
        url: baseUrl + "/single_brawl?guild_id=" + guildId + "&brawl_id=" + brawlId,
        success: function (response) {
            singleBrawlArray = response;
            buildSingleBrawlTable(singleBrawlArray);
        }
    })
}


function sortArray(array, column, mode) {
    sortedArray = array.sort(function (a, b) {
        if (!isNaN(a[column]) && !isNaN(b[column])) {
            return (parseFloat(a[column]) > parseFloat(b[column])) ? 1 : -1;
        }
        else {
            return (a[column] > b[column]) ? 1 : -1;
        }
    });

    return (mode == "asc") ? sortedArray : sortedArray.reverse();
}


$('#guildOverviewTable').on('click', 'tr', function () {
    cycle = $(this).children()[0].innerHTML;
    guildId = $(this).parents().data('guild_id');

    for (var i = 0; i < guildOverviewArray.length; i++) {
        if (guildOverviewArray[i].cycle == cycle) {
            $(this).parents().data('brawl_id', guildOverviewArray[i].tournament_id)
        }
    }

    brawlId = $(this).parents().data('brawl_id');

    getGuildBrawl(guildId, brawlId);
    getSingleBrawl(guildId, brawlId);

    ($("#guildOverviewTable tr").not($(this))).removeClass("active");
    $(this).toggleClass("active");
});


$('#guildBrawlsTable').on('click', 'tr', function () {
    guildName = $(this).children()[0].innerHTML;
    brawlId = document.getElementById('guildOverviewTable').dataset.brawl_id;
    ($("#guildBrawlsTable tr").not($(this))).removeClass("active");
    $(this).toggleClass("active");

    guildId = 0
    mapping = {}

    $.ajax({
        method: "GET",
        url: baseUrl + "/guild_id_mapping",
        success: function (response) {
            mapping = response;

            for (var key in mapping) {
                if (mapping[key] == guildName) {
                    guildId = key
                    getSingleBrawl(guildId, brawlId);
                }
            }
        }
    })
});


$('th').on('click', function () {
    var column = $(this).data('column');
    var order = $(this).data('order');
    var tableName = $(this).data('name') + "Table";
    var text = $(this).html();

    text = text.substring(0, text.length - 1);

    if (tableName == "singleBrawlTable") {
        tempArray = singleBrawlArray;
    }
    else if (tableName == "guildBrawlsTable") {
        tempArray = guildBrawlsArray;
    }
    else if (tableName == "guildOverviewTable") {
        tempArray = guildOverviewArray;
    }

    if (order == 'desc') {
        text += '&#9650';
        $(this).data('order', "asc");
        tempArray = sortArray(tempArray, column, "asc");
    }
    else {
        text += '&#9660';
        $(this).data('order', "desc");
        tempArray = sortArray(tempArray, column, "desc");
    }

    $(this).html(text);

    if (tableName == "singleBrawlTable") {
        buildSingleBrawlTable(tempArray);
    }
    else if (tableName == "guildBrawlsTable") {
        buildGuildBrawlsTable(tempArray);
    }
    else if (tableName == "guildOverviewTable") {
        buildGuildOverviewTable(tempArray);
    }
})


$('#search-input').on('keyup', function (event) {
    guilds = Object.keys(guildNameMapping)

    var options = '';

    for (var i = 0; i < guilds.length; i++) {
        options += '<option value="' + guilds[i] + '" />';
    }

    document.getElementById('guildList').innerHTML = options;

    if (event.which === 13) {
        guildName = document.getElementById('search-input').value
        guildId = guildNameMapping[guildName]

        $.ajax({
            method: "GET",
            url: baseUrl + "/guild_overview?guild_id=" + guildId,
            success: function (response) {
                guildOverviewArray = response;

                brawlId = guildOverviewArray[0].tournament_id
                buildGuildOverviewTable(guildOverviewArray);
                getGuildBrawl(guildId, brawlId);
                getSingleBrawl(guildId, brawlId);
                document.getElementById('guildList').innerHTML = ""
            }
        })
    }
})


initGuildId = "391cc53158d4b06e7e5d8f0dfba614267905b8cf"
initBrawlId = "GUILD-BC111-BL56-BRAWL1"

getGuildNameMapping()
getSingleBrawlData(initGuildId, initBrawlId)
getGuildBrawlData(initGuildId, initBrawlId)
getGuildData(initGuildId)















// // Use this with images 
// // function frayIndexToFray(data) {
// //     fray = ""
// //     frayIndex = data.fray_index;
// //     brawlLevel = data.brawl_level;
// //     frayData = settings.frays[1][frayIndex];

// //     if (frayData.rating_level == 0) {
// //         fray += "Novice ";
// //     }
// //     else if (frayData.rating_level == 1) {
// //         fray += "Bronze ";
// //     }
// //     else if (frayData.rating_level == 2) {
// //         fray += "Silver ";
// //     }
// //     else if (frayData.rating_level == 3) {
// //         fray += "Gold ";
// //     }
// //     else if (frayData.rating_level == 4) {
// //         fray += "Diamond ";
// //     }

// //     if (frayData.editions.length == 0) {
// //         fray += "All ";
// //     }

// //     if (frayData.foil == 'g') {
// //         fray += "Gold";
// //     }

// //     console.log(brawlLevel, frayIndex, frayData)

// //     return fray;
// // }