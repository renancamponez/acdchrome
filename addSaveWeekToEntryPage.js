var usertoken='';
var userObject;
var userId;
var startdate;
var enddate;
var country = '';
var payload = '';
var taskkey='';
var notes='';
//montar o seguinte como objeto depois, usado no loop do getactivity();
var projname = '';
var projid = '';
var projstart = '';
var projend = '';
var billable = '';
// fim do objeto

//mapa meses
var firstDateWeek= new Date();
const meses = ["January","February","March","April","May","June","July","August","September","October","November","December"];

$(document).ready(function() {
    getFirstDate();
    setup();
    main();
});

var main = function(){
    usertoken = localStorage.getItem('accessToken');
    getacdcuser();
    if(country != 'US'){
        console.log("Country: "+country+" .Save week feature disabled");
    }else{
        waitForEl('.day-column-body-solid', function() {
            $(".day-column-body-solid").on("click", function(){
                waitForEl('.modal-footer', function() {
                    $('.modal-footer').append(`<button id='saveweek' class="btn btn-outline-success text-uppercase font-weight-bold" type="button">Save Week</button>`);
                    console.log(usertoken);
                    $("#saveweek").on("click", function(){
                        taskkey = $(".custom-select option:selected").val();
                        notes = $(".form-control-text-area").val();
                        getActivity();
                        $('.day-column-solid').each(function(){
                            createpayloadus(transformDate(firstDateWeek),projname,taskkey,projid,projstart,projend,billable,userId,notes);
                            //se tiver hora logada nao loga
                            if(parseInt(($(this).find("div").last().text().split("h")[0]))>0){
                                console.log("Ja tem hora logada pra"+transformDate(firstDateWeek)+" movendo para proximo dia");
                                if($(this).find("div").first().find("p").hasClass("day-column-title-selected")){return false}
                            } else{
                                if($(this).find("div").first().find("p").hasClass("day-column-title-selected")){
                                    console.log("running entry for current week day");
                                    entry();
                                    return false;
                                }
                                else{
                                    if($(this).find("p").first().first().text().split('')[0]!='S'){
                                        console.log("running entry for "+transformDate(firstDateWeek));
                                        entry();
                                    }
                                }
                            }
                            firstDateWeek.setDate(firstDateWeek.getDate()+1);
                        })
                        location.reload(true);
                    })
                })
            });

        })
    }
};

var transformDate = function(date){
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0');
    var yyyy = date.getFullYear();
    date = yyyy + '-' + mm + '-' + dd;
    return date;
};

var getFirstDate = function(){
    var firstday = $('.day-column-solid').find("p").first().find("span").first().text();
    var month= $('.weekly-view-header').find("h1").text().split("2")[0].trim();
    var year=2020;
    month = $.map(meses,function(n,i){
        if(n==month){return i};});
    firstDateWeek.setFullYear(year,month,firstday);
    console.log(firstDateWeek);
}

var setup = function(){
    startdate=transformDate(firstDateWeek)
    enddate=transformDate(firstDateWeek);

};

var createpayloadbr = function(date,projname,taskkey,projid,projstart,projend,billable,userId,notes){
    payload = {"date":`${date}`,"startTime":"21:45",
        "endTime":"21:46","notes":`${notes}`,"totalWorkedHours":0,
        "activity":
            {"fullName":`${projname}`,"taskKey":`${taskkey}`,"projectId":`${projid}`,
                "beginDate":`${projstart}`,"endDate":`${projend}`,"billable":`${billable}`},"userId":`${userId}`}

}

var createpayloadus = function(date,projname,taskkey,projid,projstart,projend,billable,userId,notes){
    payload = {"date":`${date}`,"notes":`${notes}`,"totalWorkedHours":28800000,
        "activity":
            {"fullName":`${projname}`,"taskKey":`${taskkey}`,"projectId":`${projid}`,
                "beginDate":`${projstart}`,"endDate":`${projend}`,"billable":`${billable}`},"userId":`${userId}`}

}
var getacdcuser = function(){
    $.ajax({
        headers: {
            'Authorization': `Bearer ${usertoken}`,
            'accept': 'application/json, text/plain, */*'
        },
        crossDomain:true,
        async:false,
        method: "GET",
        url: "https://acdc2.avenuecode.com/api/users/me",
    })
        .done(function( msg ) {
            userObject = msg;
            userId = msg.data.userId;
            country = msg.data.workLocation.country;
            console.log( "Data Saved: " + userId+" Country: "+ country);
        });
}


var entry = function(){
    var settings = {
        "url": "https://acdc2.avenuecode.com/api/time-entries",
        "method": "POST",
        "async": false,
        "timeout": 0,
        "headers": {
            "authority": " acdc2.avenuecode.com",
            "method": " POST",
            "path": " /api/time-entries",
            "scheme": " https",
            "accept": " application/json, text/plain, */*",
            "accept-language": " en-US,en;q=0.9",
            "authorization": " Bearer "+usertoken,
            "Content-Type": "application/json",
        },
        "data": JSON.stringify(payload),
    };

    $.ajax(settings).done(function (response) {
        console.log(response);
    });
}

var waitForEl = function(selector, callback) {
    if (jQuery(selector).length) {
        callback();
    } else {
        setTimeout(function() {
            waitForEl(selector, callback);
        }, 100);
    }
};


var getActivity = function(){
    var settings = {
        "url": `https://acdc2.avenuecode.com/api/activities?userId=${userId}&startDate=${startdate}&endDate=${enddate}`,
        "method": "GET",
        "async": false,
        "timeout": 0,
        "headers": {
            "authority": " acdc2.avenuecode.com",
            "method": " POST",
            "path": " /api/time-entries",
            "scheme": " https",
            "accept": " application/json, text/plain, */*",
            "accept-encoding": " gzip, deflate, br",
            "accept-language": " en-US,en;q=0.9",
            'Authorization': `Bearer ${usertoken}`,
            "content-type": " application/json;charset=UTF-8"
        }
    };

    $.ajax(settings).done(function (response) {
        for (let key in response.data){
            if(response.data.hasOwnProperty(key)){
                for(let i = 0; i < response.data[key].length; i++){
                    var taskToSearch = response.data[key][i].taskKey;
                    if(taskToSearch == taskkey){
                        projname = response.data[key][i].fullName;
                        projid = response.data[key][i].projectId;
                        projstart = response.data[key][i].beginDate;
                        projend = response.data[key][i].endDate;
                        billable = response.data[key][i].billable;
                        console.log("getActivity() done!");
                    }
                }
            }}
    });
}




