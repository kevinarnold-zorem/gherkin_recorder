/*
 * Copyright 2017 SideeX committers
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

var isClosingAll = true;

function cleanSelected() {
    // use jquery's API to add and remove class property
    $('#testCase-grid .selectedCase').removeClass('selectedCase');
    $('#testCase-grid .selectedSuite').removeClass('selectedSuite');
}

function setSelectedSuite(id) {
    saveOldCase();
    cleanSelected();
    $("#" + id).addClass('selectedSuite');
    clean_panel();
}

function setSelectedCase(id) {
    saveOldCase();
    var suite_id = document.getElementById(id).parentNode.id;
    setSelectedSuite(suite_id);
    $("#" + id).addClass('selectedCase');
    clean_panel();
    document.getElementById("records-grid").innerHTML = escapeHTML(sideex_testCase[id].records);
    attachEvent(1, getRecordsNum());
}

function getSelectedSuite() {
    if (document.getElementById("testCase-grid").getElementsByClassName("selectedSuite")) {
        return document.getElementById("testCase-grid").getElementsByClassName("selectedSuite")[0];
    } else {
        return null;
    }
}

function getSelectedCase() {
    if (document.getElementById("testCase-grid").getElementsByClassName("selectedCase")) {
        return document.getElementById("testCase-grid").getElementsByClassName("selectedCase")[0];
    } else {
        return null;
    }
}

function getSuiteNum() {
    return document.getElementById("testCase-grid").getElementsByTagName("DIV").length;
}

function getCaseNumInSuite() {
    let selectedSuite = getSelectedSuite();
    if (selectedSuite != null) {
        return selectedSuite.getElementsByTagName("P").length;
    }
    return 0;
}

function saveOldCase() {
    var old_case = getSelectedCase();
    if (old_case) {
        sideex_testCase[old_case.id].records = document.getElementById("records-grid").innerHTML;
    }
}

function saveDataAndRemoveDirtyMarks(event,type) {
    event.stopPropagation();
    saveData();
    var s_case = getSelectedCase();
    $(s_case).parent().find("strong").removeClass("modified");
    $(s_case).removeClass("modified");
    _gaq.push(['_trackEvent', 'save-testCase', 'done']);
    let title = $(getSelectedCase()).children('span').text();
    segmentService().then(r=>r.trackingSaveTestCase(type,title));
}

function appendContextMenu(node, isCase) {
    var ul = document.createElement("ul");
    var a;

    if (isCase) {
        var add_case = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.textContent = "Add New Test Case";
        add_case.appendChild(a);
        add_case.addEventListener("click", function(event) {
            event.stopPropagation();
            document.getElementById('add-testCase').click();
        }, false);
        ul.appendChild(add_case);

        var remove_case = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.textContent = "Remove Test Case from Workspace";
        remove_case.appendChild(a);
        remove_case.addEventListener("click", function(event) {
            event.stopPropagation();
            document.getElementById('delete-testCase').click();
        }, false);
        ul.appendChild(remove_case);

        var rename_case = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.textContent = "Rename Test Case";
        rename_case.appendChild(a);
        rename_case.addEventListener("click", function(event) {
            event.stopPropagation();
            var s_case = getSelectedCase();
            var n_title = prompt("Please enter the Test Case's name", sideex_testCase[s_case.id].title);
            if (n_title) {
                // get text node
                s_case.childNodes[0].textContent = n_title;
                sideex_testCase[s_case.id].title = n_title;
            }
        }, false);
        ul.appendChild(rename_case);

        var play_case_from_here = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.textContent = "Play From Here";
        play_case_from_here.appendChild(a);
        play_case_from_here.addEventListener("click", async function(event) {
            saveData();
            emptyNode(document.getElementById("logcontainer"));
            document.getElementById("result-runs").textContent = "0";
            document.getElementById("result-failures").textContent = "0";
            recorder.detach();
            const playActions = await import('../background/playback/service/actions/play/play-actions.js');
            playActions.initAllSuite();
            // KAT-BEGIN focus on window when playing test suite
            if (contentWindowId) {
                browser.windows.update(contentWindowId, {focused: true});
            }
            declaredVars = {};
            clearScreenshotContainer();
            // KAT-END

            var cases = getSelectedSuite().getElementsByTagName("p");
            var i = 0;
            while (i < cases.length) {
                var s_case = getSelectedCase();
                if (cases[i].id === s_case.id) {
                    break;
                }
                i++;
            }
            playActions.playTestSuiteAction(i, false);
        }, false);
        ul.appendChild(play_case_from_here);

        var save_case = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.textContent = "Save Test Case";
        save_case.appendChild(a);
        save_case.addEventListener("click", function(event) {
            saveDataAndRemoveDirtyMarks(event,'context');
        }, false);
        ul.appendChild(save_case);


        var save_case_as = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.textContent = "Save Test Case As";
        save_case_as.appendChild(a);
        save_case_as.addEventListener("click", function(event) {
            downloadSuite(getSelectedSuite(), ()=>{});
        }, false);
        ul.appendChild(save_case_as);
    } else {
        /* KAT-BEGIN hide open test suite icon
        var open_suite = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.textContent = "Open Test Suites";
        open_suite.appendChild(a);
        open_suite.addEventListener("click", function(event) {
            event.stopPropagation();
            document.getElementById('load-testSuite-hidden').click();
        }, false);
        ul.appendChild(open_suite);
        KAT-END */

        /* KAT-BEGIN hide add test suite icon
        var add_suite = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.textContent = "Add New Test Suite";
        add_suite.appendChild(a);
        add_suite.addEventListener("click", function(event) {
            event.stopPropagation();
            document.getElementById("add-testSuite").click();
        }, false);
        ul.appendChild(add_suite);
        KAT-END */

        var save_suite = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.textContent = "Save Test Suite to Computer";
        save_suite.appendChild(a);
        save_suite.addEventListener("click", function(event) {
            event.stopPropagation();
            document.getElementById('save-testSuite').click();
        }, false);
        ul.appendChild(save_suite);

        var close_suite = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.textContent = "Remove Test Suite from Workspace";
        close_suite.appendChild(a);
        close_suite.addEventListener("click", function(event) {
            event.stopPropagation();
            document.getElementById('close-testSuite').click();
        }, false);
        ul.appendChild(close_suite);

        var close_all_suite = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.textContent = "Remove All Test Suites from Workspace";
        close_all_suite.appendChild(a);
        close_all_suite.addEventListener("click", function(event) {
            event.stopPropagation();
            document.getElementById('close-all-testSuites').click();
        }, false);
        ul.appendChild(close_all_suite);

        var add_case = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.textContent = "Add New Test Case";
        add_case.appendChild(a);
        add_case.addEventListener("click", function(event) {
            event.stopPropagation();
            document.getElementById('add-testCase').click();
        }, false);
        ul.appendChild(add_case);

        var rename_suite = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.textContent = "Rename Test Suite";
        rename_suite.appendChild(a);
        rename_suite.addEventListener("click", function(event) {
            event.stopPropagation();
            var s_suite = getSelectedSuite();
            var n_title = prompt("Please enter the Test Suite's name", sideex_testSuite[s_suite.id].title);
            if (n_title) {
                // get text node
                s_suite.getElementsByTagName("STRONG")[0].textContent = n_title;
                sideex_testSuite[s_suite.id].title = n_title;
                sideex_testSuite[s_suite.id].file_name = n_title + ".html";
                $(s_suite).find("strong").addClass("modified");
                closeConfirm(true);
            }
        }, false);
        ul.appendChild(rename_suite);

        var save_suite_as = document.createElement("li");
        a = document.createElement("a");
        a.setAttribute("href", "#");
        a.textContent = "Save Test Suite As";
        save_suite_as.appendChild(a);
        save_suite_as.addEventListener("click", function(event) {
            event.stopPropagation();
            downloadSuite(getSelectedSuite(), ()=>{});
        }, false);
        ul.appendChild(save_suite_as);


    }

    node.appendChild(ul);
}

function addTestCase(title, id) {
    if (!getSelectedSuite()) {
        var suite_id = "suite" + sideex_testSuite.count;
        sideex_testSuite.count++;
        sideex_testSuite[suite_id] = {
            file_name: "Untitled Test Suite.html",
            title: "Untitled Test Suite"
        };
        addTestSuite("Untitled Test Suite", suite_id);
    }

    var p = document.createElement("p");
    // KAT-BEGIN display test case title
    //p.textContent = title;
    var text = document.createElement("span");
    text.innerHTML = escapeHTML(title);
    p.appendChild(text);
    // KAT-END
    p.setAttribute("id", id);
    p.setAttribute("contextmenu", "menu" + id);

    var s_case = getSelectedCase();
    if (s_case) {
        s_case.parentNode.insertBefore(p, s_case.nextSibling);
    } else {
        getSelectedSuite().appendChild(p);
    }

    cleanSelected();
    p.classList.add("selectedCase");
    p.classList.add("test-case-title");
    p.parentNode.classList.add("selectedSuite");

    if (sideex_testCase[id]) { // load file
        clean_panel();
        document.getElementById("records-grid").innerHTML = escapeHTML(sideex_testCase[id].records);
        if (getRecordsNum() !== '0') {
            reAssignId("records-1", "records-" + getRecordsNum());
            attachEvent(1, getRecordsNum());
        }
    } else { // add new testCase
        clean_panel();
        document.getElementById("records-grid").innerHTML = escapeHTML('<input id="records-count" type=hidden value=0></input>');
        sideex_testCase[id] = {
            records: "",
            title: title
        };
        p.classList.add("modified");
        p.parentNode.getElementsByTagName("strong")[0].classList.add("modified");
    }

    // attach event
    p.addEventListener("click", function(event) {
        event.stopPropagation();
        saveOldCase();
        saveData();
        // use jquery's API to add and remove class property
        cleanSelected();
        this.classList.add("selectedCase");
        this.parentNode.classList.add("selectedSuite");
        if (sideex_testCase[this.id].records) {
            clean_panel();
            document.getElementById("records-grid").innerHTML = escapeHTML(sideex_testCase[this.id].records);
            if (getRecordsNum() !== '0') {
                reAssignId("records-1", "records-" + getRecordsNum());
                attachEvent(1, getRecordsNum());
            }
        //reset focus to the top
        document.getElementById("records-1").scrollIntoView({
                behavior: 'auto',
                block: 'center',
            });
        } else {
            clean_panel();
            document.getElementById("records-grid").innerHTML = escapeHTML('<input id="records-count" type=hidden value=0></input>');
        }

        // prevent event trigger on parent from child
        event.stopPropagation();
    }, false);

    var menu = document.createElement("div");
    menu.setAttribute("class", "menu");
    menu.setAttribute("id", "menu" + id);
    appendContextMenu(menu, true);
    p.appendChild(menu);

    // right click
    p.addEventListener("contextmenu", function(event) {
        event.preventDefault();
        event.stopPropagation();
        saveOldCase();
        setSelectedCase(this.id);
        var mid = "#" + "menu" + id;
        $(".menu").css("left", event.pageX);
        $(".menu").css("top", event.pageY);
        $(mid).show();
    }, false);


    //KAT-BEGIN add context menu button
    addContextMenuButton(id, p, menu, true);
    //KAT-END
    closeConfirm(true);

    // enable play button
    enableButton("playback");
}



function addTestSuite(title, id) {
    // set test suite title div
    var textDiv = document.createElement("div");
    textDiv.classList.add("test-suite-title");

    // add save icon
    var saveIcon = document.createElement("i");
    saveIcon.classList.add("fa");
    saveIcon.classList.add("fa-download");
    saveIcon.setAttribute("aria-hidden", "true");
    saveIcon.addEventListener("click", clickSaveIcon);
    textDiv.appendChild(saveIcon);
    // KAT-BEGIN hide save icon
    $(saveIcon).hide();
    // KAT-END

    // set test suite title
    var text = document.createElement("strong");
    text.classList.add("test-suite-title");
    text.innerHTML = escapeHTML(title);
    textDiv.appendChild(text);

    // add plus icon
    var plusIcon = document.createElement("i");
    plusIcon.classList.add("fa");
    plusIcon.classList.add("fa-plus");
    plusIcon.classList.add("case-plus");
    plusIcon.setAttribute("aria-hidden", "true");
    plusIcon.addEventListener("click", clickCasePlusIcon);
    textDiv.appendChild(plusIcon);
    // KAT-BEGIN hide plus icon
    $(plusIcon).hide();
    // KAT-END

    // set test suite div
    var div = document.createElement("div");
    div.setAttribute("id", id);
    div.setAttribute("contextmenu", "menu" + id);
    div.setAttribute("class", "message");
    div.addEventListener("mouseover", mouseOnAndOutTestSuite);
    div.addEventListener("mouseout", mouseOnAndOutTestSuite);
    div.appendChild(textDiv);

    var s_suite = getSelectedSuite();
    if (s_suite) {
        s_suite.parentNode.insertBefore(div, s_suite.nextSibling);
    } else {
        document.getElementById("testCase-grid").appendChild(div);
    }

    cleanSelected();
    div.classList.add("selectedSuite");
    // attach event
    div.addEventListener("click", function(event) {
        if (this.getElementsByTagName("p").length != 0) {
            this.getElementsByTagName("p")[0].click();
        } else {
            event.stopPropagation();
            saveOldCase();
            cleanSelected();
            this.classList.add("selectedSuite");
            clean_panel();
        }
    }, false);

    var menu = document.createElement("div");
    menu.setAttribute("class", "menu");
    menu.setAttribute("id", "menu" + id);
    appendContextMenu(menu, false);
    div.appendChild(menu);

    // right click
    div.addEventListener("contextmenu", function(event) {
        event.preventDefault();
        event.stopPropagation();
        saveOldCase();
        setSelectedSuite(this.id);
        var mid = "#" + "menu" + id;
        $(".menu").css("left", event.pageX);
        $(".menu").css("top", event.pageY);
        $(mid).show();
    }, false);

    makeCaseSortable(div);

    //KAT-BEGIN add context menu button
    addContextMenuButton(id, textDiv, menu, false);
    //KAT-END

    // enable play button
    enableButton("playSuites");
    enableButton("playSuite");
}

function modifyCaseSuite() {
    getSelectedCase().classList.add("modified");
    getSelectedSuite().getElementsByTagName("strong")[0].classList.add("modified");
}

document.getElementById("add-testSuite").addEventListener("click", async function(event) {
    event.stopPropagation();
    
    var title = prompt("Please enter the Test Suite's name", "Untitled Test Suite");
    if (title) {
        let module = await import('../../../content-marketing/panel/login-inapp.js');
        let result = await module.checkLoginOrSignupUser();
        if (!result) {
          return;
        }

        var id = "suite" + sideex_testSuite.count;
        sideex_testSuite.count++;
        sideex_testSuite[id] = {
            file_name: title + ".html",
            title: title
        };
        addTestSuite(title, id);
    }
}, false);

document.getElementById("add-testSuite-menu").addEventListener("click", function(event) {
    event.stopPropagation();
    document.getElementById('add-testSuite').click();
}, false);

var confirmCloseSuite = function(question) {
    var defer = $.Deferred();
    $('<div></div>')
        .html(question)
        .dialog({
            title: "Warning! Possible data loss",
            resizable: false,
            height: "auto",
            width: 400,
            modal: true,
            buttons: {
                "Yes": function() {
                    defer.resolve("true");
                    $(this).dialog("close");
                },
                "No, delete my data": function() {
                    defer.resolve("false");
                    $(this).dialog("close");
                },
                Cancel: function() {
                    $(this).dialog("close");
                }
            },
            close: function() {
                $(this).remove();
            }
        });
    return defer.promise();
};

var remove_testSuite = function() {
    var s_suite = getSelectedSuite();
    sideex_testSuite[s_suite.id] = null;
    s_suite.parentNode.removeChild(s_suite);
    clean_panel();
    saveData();
    
    // disable play button when there is no suite
    if (getSuiteNum() == 0) {
        disableButton("playback");
        disableButton("playSuite");
        disableButton("playSuites");
    }
    
    if(isClosingAll) close_testSuite(0);
};

document.getElementById("close-testSuite").addEventListener('click', function(event) {
    event.stopPropagation();
    isClosingAll = false;
    var suites = document.getElementById("testCase-grid").getElementsByClassName("message");
    var s_suite = getSelectedSuite();
    var i = 0;
    while (i < suites.length) {
        if (suites[i].id === s_suite.id) {
            break;
        }
        i++;
    }
    close_testSuite(i);
}, false);

document.getElementById("close-all-testSuites").addEventListener('click', function(event) {
    event.stopPropagation();
    isClosingAll = true;
    close_testSuite(0);
}, false);


function close_testSuite(suite_index) {
    var suites = document.getElementById("testCase-grid").getElementsByClassName("message");
    if (suites[suite_index] && suites[suite_index].id.includes("suite")) {
      var c_suite = suites[suite_index];
      setSelectedSuite(c_suite.id);
      let html = `<div style="color:red;">This action will remove your test suite and changes made to your test suite permanently, you can open it again only if a copy is available on your computer.</div>
        </br>
        <div>Save the
        ${
          sideex_testSuite[c_suite.id].title
        } test suite to your computer?"</div>`;
      confirmCloseSuite(html).then(function (answer) {
        if (answer === "true") {
          downloadSuite(c_suite, remove_testSuite);
        } else {
          remove_testSuite();
        }
      });
    }
};

document.getElementById("add-testCase").addEventListener("click", async function(event) {
    var title = prompt("Please enter the Test Case's name", "Untitled Test Case");
    if (title) {
        let module = await import('../../../content-marketing/panel/login-inapp.js');
        let result = await module.checkLoginOrSignupUser();
        if (!result){
            return;
        }
        let data = await browser.storage.local.get("checkLoginData");
        data.checkLoginData.testCreated ++;
        await browser.storage.local.set(data);

        var id = "case" + sideex_testCase.count;
        sideex_testCase.count++;
        addTestCase(title, id);        
    }
}, false);

var remove_testCase = function() {
    var s_case = getSelectedCase();
    sideex_testCase[s_case.id] = null;
    s_case.parentNode.removeChild(s_case);
    clean_panel();
};

document.getElementById("delete-testCase").addEventListener('click', function() {
    var s_case = getSelectedCase();
    if (s_case) {
      let html = `<div style="color:red">Esta acción eliminará su caso de prueba o los cambios realizados en su caso de prueba de forma permanente; podrá abrirlo nuevamente solo si hay una copia disponible en su computadora.</div>
            </br>
            <div>Save this test case to your computer?</div>`;
      confirmCloseSuite(html).then(function (answer) {
        if (answer === "true")
          downloadSuite(getSelectedSuite(), remove_testCase);
        else remove_testCase();

        // disable play button when there is no test case
        if (getCaseNumInSuite() == 0) {
          disableButton("playback");
        }
      });
    }
}, false);

function clickCasePlusIcon(event) {
    event.stopPropagation();
    event.target.parentNode.parentNode.click();
    document.getElementById('add-testCase').click();
}

function clickSaveIcon(event) {
    event.stopPropagation();
    event.target.parentNode.parentNode.click();
    document.getElementById('save-testSuite').click();
}

function clickSuitePlusIcon(event) {
    document.getElementById("add-testSuite").click();
}

function clickSuiteOpenIcon(event) {
    document.getElementById("load-testSuite-hidden").click();
}

document.getElementById("suite-plus").addEventListener("click", clickSuitePlusIcon);
document.getElementById("suite-open").addEventListener("click", clickSuiteOpenIcon);




