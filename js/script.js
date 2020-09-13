// Use $ instead of jQuery
(function ($) {
    $(window).on("load",function () {

        var filteredData = 0;
        var last,
            currentpg = 1,
            pagecount = 1,
            PostPerPage = 8;

            urlCheck();


        $(".toggle-arrow").click(function () {
            $(".filter-wrapper").toggleClass("open");
        });

        function urlCheck() {
            if (window.location.href.lastIndexOf("?") >= 0) {
                const param = window.location.href.slice(
                    window.location.href.lastIndexOf("?") + 1
                );
                fetchData(param);

                var url = window.location.href
                    .slice(window.location.href.lastIndexOf("?") + 1)
                    .split("&");
                // console.log("check1",url);
                url.forEach(function (value, index) {
                    // console.log("flag",value.slice(value.indexOf("=")+1))
                    if (value.indexOf("launch_success") >= 0) {
                        $(
                            "input[type=radio][name='launch_success'][value='" +
                            value.slice(value.indexOf("=") + 1) +
                            "']"
                        ).prop("checked", true);
                        $(
                            "input[type=radio][name='launch_success'][value='" +
                            value.slice(value.indexOf("=") + 1) +
                            "']"
                        ).data("waschecked", true);
                    }
                    if (value.indexOf("land_success") >= 0) {
                        $(
                            "input[type=radio][name='land_success'][value='" +
                            value.slice(value.indexOf("=") + 1) +
                            "']"
                        ).prop("checked", true);
                        $(
                            "input[type=radio][name='land_success'][value='" +
                            value.slice(value.indexOf("=") + 1) +
                            "']"
                        ).data("waschecked", true);
                    }
                    if (value.indexOf("launch_year") >= 0) {
                        $(
                            "input[type=radio][name='launch_year'][value='" +
                            value.slice(value.indexOf("=") + 1) +
                            "']"
                        ).prop("checked", true);
                        $(
                            "input[type=radio][name='launch_year'][value='" +
                            value.slice(value.indexOf("=") + 1) +
                            "']"
                        ).data("waschecked", true);
                    }
                });
            } else {
                fetchData();
            }
        }

        function createCard(data, pageNo = 1) {
            if (pageNo < 1) {
                console.log("wrong page no. given");
                return;
            }
            // pageNo--;
            var datawrapper = $(".card-wrapper");
            datawrapper.empty();
            data.forEach(function (currentValue, index) {
                // console.log(currentValue);
                // console.log("check",(((pageNo-1)*PostPerPage)+1));
                if (
                    index >= (pageNo - 1) * PostPerPage &&
                    index <= pageNo * PostPerPage - 1
                ) {
                    console.log(currentValue);
                    datawrapper.append(`<div class="card">
        <img src="${currentValue.links.mission_patch_small}" alt="${currentValue.mission_name}">
          <div class="content-wrapper">
           <h4>${currentValue.mission_name} #${currentValue.flight_number}</h4>
            <div class="data-row">
              <span>Mission Ids:</span>
              <span>${currentValue.mission_id[0]}</span>
            </div>
            <div class="data-row">
              <span>Launch Year:</span>
              <span>${currentValue.launch_year}</span>
            </div>
             <div class="data-row">
              <span>Successful Launch:</span>
              <span>${currentValue.launch_success}</span>
            </div>
             <div class="data-row">
              <span>Successful Landing:</span>
              <span>${currentValue.rocket.first_stage.cores[0].land_success}</span>
            </div>
          </div>
        </div>`);
                }
            });
        }

// filter form/ajax request

        $(document).on("click", "input[type=radio]", function (event) {
            var previousValue = $(this).data("waschecked");
            // console.log($(this).attr('name'));
            if (previousValue === true) {
                this.checked = false;
                $("input[type=radio][name=" + $(this).attr("name") + "]").data(
                    "waschecked",
                    false
                );
                $(this).data("waschecked", false);
            } else {
                this.checked = true;
                $("input[type=radio][name=" + $(this).attr("name") + "]").data(
                    "waschecked",
                    false
                );
                $(this).data("waschecked", true);
            }
            fetchData();
        });

        function fetchData(param = 0) {
            if (param) {
                $("#loader").show();
                $(".card-wrapper").hide();
                $("#no-data").hide();
                $.ajax({
                    url: "https://api.spaceXdata.com/v3/launches?limit=100&" + param,
                    type: "get"
                })
                    .done(function (response) {
                        // console.log(response);
                        filteredData = response;
                        createCard(filteredData);
                        pageload(filteredData.length, pagecount, PostPerPage);
                        if (response.length) {
                            setTimeout(function () {
                                $("#loader").hide();
                                $(".card-wrapper").show();
                            }, 400);
                        } else {
                            setTimeout(function () {
                                $("#loader").hide();
                                $("#no-data").show();
                            }, 400);
                        }
                    })
                    .fail(function (error) {});
            }
            else {
                var data = {};
                $("form")
                    .serializeArray()
                    .map(function (x) {
                        data[x.name] = x.value;
                    });
                // console.log(data);
                $("#loader").show();
                $(".card-wrapper").hide();
                $("#no-data").hide();
                $.ajax({
                    url: "https://api.spaceXdata.com/v3/launches?limit=100&" + $.param(data),
                    type: "get"
                })
                    .done(function (response) {
                        // console.log(response);
                        filteredData = response;
                        createCard(filteredData);
                        pageload(filteredData.length, pagecount, PostPerPage);

                        const baseurl = window.location.href.slice(
                            window.location.href.indexOf("?") + 1
                        );
                        // console.log(baseurl);
                        history.pushState(null, null, "?" + $.param(data) + "");

                        if (response.length) {
                            setTimeout(function () {
                                $("#loader").hide();
                                $(".card-wrapper").show();
                            }, 400);
                        } else {
                            setTimeout(function () {
                                $("#loader").hide();
                                $("#no-data").show();
                            }, 400);
                        }
                    })
                    .fail(function (error) {});
            }
        }

//pagination codes

        $(".pagination-wrapper .postOption select").change(function () {
            PostPerPage = $(this).val();
            if (filteredData.length) {
                createCard(filteredData);
                pageload(filteredData.length, pagecount, PostPerPage);
            } else {
                createCard(GlobalData);
                pageload(GlobalData.length, pagecount, PostPerPage);
            }
        });

        function pageload(dataLength, pagecount, PostPerPage) {
            last = parseInt(dataLength / PostPerPage);
            // console.log(parseInt(dataLength/PostPerPage) , dataLength/PostPerPage);
            if (parseInt(dataLength / PostPerPage) < dataLength / PostPerPage)
                last = last + 1;
            var dots_wrap = $(".pagination-wrapper .pages");
            dots_wrap.empty();
            dots_wrap.append(
                "<div class='start'>" +
                "<span class='li first'><a>1</a></span>" +
                "<span class='li dots'>....</span></div>" +
                "<div class='page-wrapper'></div>" +
                "<div class='end'>" +
                "<span class='li dots'>....</span>" +
                "<span class='li last'><a>" +
                last +
                "</a></span></div>"
            );

            var page_wrap = $(".pagination-wrapper .pages .page-wrapper");

            if (last > pagecount) {
                for (var x = 1; x <= pagecount; x++) {
                    page_wrap.append(
                        '<span data-post="' +
                        ((x - 1) * PostPerPage + 1) +
                        '" class="li page"><a>' +
                        x +
                        "</a></span>"
                    );
                }
            } else {
                for (var x = 1; x <= last; x++) {
                    page_wrap.append('<span class="li page"><a>' + x + "</a></span>");
                }

                $(".pages .end").hide();
            }

            $(".pages .page").first().addClass("current");
        }

        $(document).on("click", ".next-arrow", function (e) {
            e.preventDefault();
            var next = $(".pages .li.current").next(".page");

            if (next.length > 0) {
                //if next page present
                $(".pages .li").removeClass("current");
                next.addClass("current");

                currentpg = parseInt($(".pages .li.current a").text());
                createCard(finaldata, currentpg);
            } else {
                console.log("no next");

                if (currentpg + 1 <= last) {
                    //if page limit is reached or not
                    $.each($(".pages .page a"), function () {
                        $(this).text(parseInt($(this).text()) + 1);
                        // updatePostNo($(this));
                    });

                    currentpg = parseInt($(".pages .li.current a").text());
                    $(".pages .start").show();
                    createCard(filteredData, currentpg);
                }
            }

            if (currentpg == last) {
                $(".pages .end").hide();
            }
        });

        $(document).on("click", ".prev-arrow", function (e) {
            e.preventDefault();
            var prev = $(".pages li.current").prev(".page");

            if (prev.length > 0) {
                //if prev page present
                $(".pages .li").removeClass("current");
                prev.addClass("current");
                currentpg = parseInt($(".pages .li.current a").text());
                createCard(filteredData, currentpg);
            } else {
                console.log("no prev");

                if (currentpg - 1 >= 1) {
                    //if first is reached or not
                    $.each($(".pages .page a"), function () {
                        $(this).text(parseInt($(this).text()) - 1);
                    });

                    currentpg = parseInt($(".pages .li.current a").text());
                    createCard(filteredData, currentpg);
                    $(".pages .end").show();
                }

                if (last < pagecount) {
                    if (currentpg < last) {
                        $(".pages .end").show();
                    }
                }
            }

            if (currentpg == 1) {
                $(".pages .start").hide();
            }
        });


        $(document).on("click", ".pages .last", function (e) {
            e.preventDefault();
            var temp = last - $(".pages .page").length;

            $.each($(".pages .page a"), function () {
                $(this).text(++temp);
            });

            $(".pages .li").removeClass("current");

            $(".pages .page").last().addClass("current");

            currentpg = parseInt($(".pages .li.current a").text());
            createCard(filteredData, currentpg);

            $(".pages .end").hide();
            $(".pages .start").show();
        });

        $(document).on("click", ".pages .first", function (e) {
            e.preventDefault();
            var temp = 1;

            $.each($(".pages .page a"), function () {
                $(this).text(temp++);
            });

            $(".pages .li").removeClass("current");

            $(".pages .page").first().addClass("current");

            currentpg = parseInt($(".pages .li.current a").text());
            createCard(filteredData, currentpg);

            $(".pages .end").show();
            $(".pages .start").hide();
        });


    });
})(jQuery);