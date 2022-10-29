$(document).ready(function () {
    // ModalActions();
});

// function ModalActions() {
//     $("#addBikeButton").click(function () {
//         // var valueElem = $("#addModalDiv"),
//         //     bikeName = valueElem.find("#addBikeName").val(),
//         //     bikeStationId = valueElem.find("#addBikeStation").val();
//         // setDataToStorage(GenerateGUID(), bikeName, bikeStationId, "inc");
//         // var newData = getDataFromStorage();

//         // ViewModel.bikeListFiltered = ko.computed(function () {
//         //     return ko.utils.arrayFilter(self.bikeList(), function (bike) {
//         //         return (
//         //             (self.search_ClientAddress().length == 0 || bike.name().toLowerCase().indexOf(self.search_ClientAddress().toLowerCase()) > -1)
//         //         )
//         //     });
//         // });
    
//         console.log(ViewModel.bikeListFiltered);

//     });

//     $("#deleteBikeButton").click(function () {
//         var bikeId = $("#deleteModalSpan").attr("data-bike-id"),
//             bikeName = $("#deleteModalSpan").text();
//         setDataToStorage(bikeId, bikeName, null, "dec");
//     });
// }

// function getDataFromStorage() {
//     var bikes = JSON.parse(localStorage.getItem('bikeData')) || [];
//     return bikes;
// }

// function setDataToStorage(id, name, stationId, type) {
//     var bikes = JSON.parse(localStorage.getItem('bikeData')) || [],
//         bike = {
//             "bikeId": id || "",
//             "name": name || "",
//             "stationId": stationId || "",
//             "type": type || ""
//         };

//     bikes.push(bike);

//     localStorage.setItem('bikeData', JSON.stringify(bikes));
// }

// function GenerateGUID() {
//     return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
//         (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
//     );
// }