/**
 * Application start
 */
$(document).ready(function () {
    var properties = amplify.store('adriana.properties') || {};

    $('.stdin').adriana(properties);

});