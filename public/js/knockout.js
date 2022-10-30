function BikeList(bikeId, stationId, stationName, name, lon, lat) {
    var self = this;
    self.bikeId = ko.observable(bikeId);
    self.stationId = ko.observable(stationId);
    self.stationName = ko.observable(stationName);
    self.name = ko.observable(name);
    self.lon = ko.observable(lon);
    self.lat = ko.observable(lat);
}

function ViewModel() {
    var self = this,
        stationList = {};
    self.bikesData = ko.observableArray();
    self.bikeList = ko.observableArray([]);
    self.stationNameList = ko.observable([]);
    self.selectStationList = ko.observableArray([]);
    self.selectedBikeName = ko.observable('');
    self.selectedBikeId = ko.observable('');
    self.selectedBikeStationId = ko.observable('');
    self.isNameSorted = ko.observable(false);
    self.isStationSorted = ko.observable(false);

    $.getJSON("/public/data/station.json", function (data) {
        stationList = data.data.stations;

        stationList.forEach(element => {
            self.selectStationList.push(element);
        });
    });

    $.getJSON("/public/data/bike.json", function (data) {
        self.bikesData = data.data.bikes;

        self.bikesData.forEach(element => {
            self.bikeList.push(new BikeList(element.bike_id, element.station_id, self.getStationName(element.station_id), element.name, element.lon, element.lat));
        });

        var stationIds = self.bikeList().map(function (obj) {
            return obj.stationId();
        });

        var storageData = self.getDataFromStorage(),
            allStorageId = {};
        var addedIds = storageData.map((obj) => {
            if (obj.type == "inc") {
                return obj.stationId;
            } else {
                return "";
            }
        });
        var removedIds = storageData.map((obj) => {
            if (obj.type == "dec") {
                return obj.stationId;
            } else {
                return "";
            }
        });

        for (let i = 0; i < addedIds.length; i++) {
            if (addedIds[i] != "") stationIds.push(addedIds[i]);
        }
        for (let i = 0; i < removedIds.length; i++) {
            if (removedIds[i] != "") {
                var index = stationIds.indexOf(removedIds[i]);
                if (index !== -1) {
                    stationIds.splice(index, 1);
                }
            }
        }

        var count = {};
        stationIds.forEach(function (i) { count[i] = (count[i] || 0) + 1; });

        var pieChartData = [];
        Object.keys(count).forEach((key) => {
            var pieChartDataItem = {};

            for (i = 0; i < stationList.length; i++) {
                if (stationList[i].station_id == key) {
                    pieChartDataItem["name"] = stationList[i].name;
                    break;
                }
            }
            pieChartDataItem["y"] = count[key];
            if (pieChartData.length == 0) {
                pieChartDataItem["sliced"] = true;
                pieChartDataItem["selected"] = true;
            }
            if (key != "") pieChartData.push(pieChartDataItem);
        });

        //Chart
        if ($("#piechart")[0]) {
            Highcharts.chart('piechart', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: 'Stations Pie Chart'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y}</b>'
                },
                accessibility: {
                    point: {
                        valueSuffix: '%'
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.y}'
                        }
                    }
                },
                series: [{
                    name: 'Station Density',
                    colorByPoint: true,
                    data: pieChartData
                }]
            });
        }
    })

    //Filter
    self.search_ClientAddress = ko.observable('');
    self.bikeListFiltered = ko.computed(function () {
        return ko.utils.arrayFilter(self.bikeList(), function (bike) {
            return (
                (self.search_ClientAddress().length == 0 || bike.name().toLowerCase().indexOf(self.search_ClientAddress().toLowerCase()) > -1)
            )
        }).sort(
            function (a, b) {
                if (self.isNameSorted() === true) {
                    var x = a.name().toLowerCase(), y = b.name().toLowerCase();
                    return (x < y ? -1 : x > y ? 1 : 0);
                } else if (self.isStationSorted() === true) {
                    var x = a.stationName().toLowerCase(), y = b.stationName().toLowerCase();
                    return (x < y ? -1 : x > y ? 1 : 0);
                }
            }
        );
    });

    //Set Bike Values For Modal
    this.setBikeNameToModal = function (e) {
        self.selectedBikeName(e.name());
        self.selectedBikeId(e.bikeId());
        self.selectedBikeStationId(e.stationId());
    }

    //Modal Actions
    $(document).ready(function () {
        //localStorage.clear();
        self.OnOpenAction();
        self.ModalActions();
        $("#bikeList").hide();
    })

    this.ModalActions = function () {
        $("#addBikeButton").click(function () {
            if ($("#addBikeName").val() == null || $("#addBikeName").val().trim() == "") {
                $("#bikeNameError").show();
            } else {
                var valueElem = $("#addModalDiv"),
                    bikeName = valueElem.find("#addBikeName").val(),
                    bikeStationId = valueElem.find("#addBikeStation").val(),
                    GUID = self.GenerateGUID();
                self.setDataToStorage(GUID, bikeName, bikeStationId, "inc");

                self.addBike(bikeName, GUID, bikeStationId);
                $("#addBikeName").val("");
                $("#addBikeModal").modal("toggle");
                $("#bikeNameError").hide();
            }
        });

        $("#deleteBikeButton").click(function () {
            var bikeId = $("#deleteModalSpan").attr("data-bike-id"),
                bikeName = $("#deleteModalSpan").text(),
                bikeStationId = $("#deleteModalSpan").attr("data-bike-station-id");
            self.setDataToStorage(bikeId, bikeName, bikeStationId, "dec");

            self.removeBike(bikeId);
            $("#deleteBikeModal").modal("toggle");
        });
    }

    self.addBike = function (Name, BikeId, StationId) {
        self.bikeList.unshift(new BikeList(BikeId, StationId, self.getStationName(StationId), Name, "", ""));
    }
    self.removeBike = function (ID) {
        self.bikeList.remove(function (bike) {
            return bike.bikeId() == ID;
        });
    }

    this.getDataFromStorage = function () {
        var bikes = JSON.parse(localStorage.getItem('bikeData')) || [];
        return bikes;
    }

    this.setDataToStorage = function (id, name, stationId, type) {
        var bikes = JSON.parse(localStorage.getItem('bikeData')) || [],
            bike = {
                "bikeId": id || "",
                "name": name || "",
                "stationId": stationId || "",
                "type": type || ""
            };

        bikes.push(bike);

        localStorage.setItem('bikeData', JSON.stringify(bikes));
    }

    this.getStationName = function (stationId) {
        var returnVal = "";
        for (i = 0; i < stationList.length; i++) {
            if (stationId == stationList[i].station_id) {
                returnVal = stationList[i].name;
                break;
            }
        }
        return returnVal;
    }

    this.GenerateGUID = function () {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    this.OnOpenAction = function () {
        var newData = self.getDataFromStorage();
        setTimeout(() => {
            for (let i = 0; i < newData.length; i++) {
                if (newData[i].type == "inc") {
                    self.addBike(newData[i].name, newData[i].bikeId, newData[i].stationId);
                } else if (newData[i].type == "dec") {
                    self.removeBike(newData[i].bikeId);
                }
            }

            setTimeout(() => {
                $("#loading").hide();
                $("#bikeList").show();
            }, 500);
        }, 1000);
    }

    $(".bikeListTitle .name").click(function () {
        self.isNameSorted(!self.isNameSorted());
        if (self.isNameSorted()) {
            self.isStationSorted(false);

            $(".bikeListTitle .name + .sortArrow").append('<i class="fa fa-caret-down" aria-hidden="true"></i>');
            $(".bikeListTitle .station + .sortArrow").empty();
        } else {
            $(".bikeListTitle .name + .sortArrow").empty();
            $(".bikeListTitle .station + .sortArrow").empty();
        }
    })
    $(".bikeListTitle .station").click(function () {
        self.isStationSorted(!self.isStationSorted());
        if (self.isStationSorted()) {
            self.isNameSorted(false);

            $(".bikeListTitle .station + .sortArrow").append('<i class="fa fa-caret-down" aria-hidden="true"></i>');
            $(".bikeListTitle .name + .sortArrow").empty();
        } else {
            $(".bikeListTitle .name + .sortArrow").empty();
            $(".bikeListTitle .station + .sortArrow").empty();
        }

    })
};
ko.applyBindings(new ViewModel());