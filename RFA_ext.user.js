// ==UserScript==
// @name         RFA MRCOG tutorials
// @namespace    https://github.com/drmdshahid
// @version      1.5
// @description  Download course (canvas to PDF/html) from RFA Tutorials
// @author       Shahid
// @match        https://cdn.talentlms.com/rfatutors/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=talentlms.com
// @grant        none
// @run-at       context-menu
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...



    var style = document.createElement("style");
    document.head.appendChild(style);
    style.sheet.insertRule(".toolbar { background: radial-gradient(#004967, transparent); }");
    style.sheet.insertRule("a.download { background: beige; }");
    style.sheet.insertRule("@media print { body { visibility: hidden; }  #to-print {  visibility: visible; } }");


    var txtinurl = document.URL.split("/")[4]; // this is safe file name.
    var pagelist = document.querySelectorAll("div.mainContainer div.pageViewer > div.shadowOffset");

    var totalpgs = document.querySelector("div.mainContainer > div.toolbar > div > div.pageNavigationToolbarContainer > div > div > span").innerHTML;

    if (pagelist.length == totalpgs) {
        console.clear();
        console.info("pages count match");
    }

    // mark them with costum attribute
    var container = document.createElement("div");
    container.id = "to-print";
    //container.innerHTML = "SHAHID";
    document.body.appendChild(container);


    for (let i of pagelist.entries()) {
        i[1].setAttribute("data-pgn", i[0]);
        const myImage = new Image(780); // based on 210mm x 297mm with 96dpi = 794,1123
        myImage.id = "i" + i[0];
        myImage.alt = i[0] + 1;
        container.appendChild(myImage);

    }


    var a = document.querySelector("div.mainContainer > div.toolbar div.viewerToolbarContainer").appendChild(document.createElement("a"));
    a.innerText = 'html⏬'
    a.download = txtinurl + ".html";
    a.href = "data:text/html,";
    a.onmouseleave = function () {
        a.href = "data:text/html," + document.getElementById("to-print").innerHTML;
        a.style.background = 'yellow';
    };


    // save

    function save(dt, i) {
        var anch = document.querySelector("#a" + i);
        anch.innerText += dt.substr(5, 25);
        if (dt.split(",")[0] == "data:image/png;base64") {
            // varification...
            anch.href = dt;
            document.querySelector("#i" + i).src = dt;
            //console.log("saving:" + i + ":"+ dt.substr(5, 25));
            anch.style.color = 'green';
        } else {
            console.error("error:" + i);
            anch.style.color = 'red';
        }

    }




    // add url and save features

    function addUI(can) {
        var p = can.parentElement.parentElement.parentElement;
        var i = p.getAttribute('data-pgn');
        console.info(i + `-Added: ` + can.tagName);

        if (p.querySelector("a.download") == null) {
            var link = document.createElement('a');
            link.id = "a" + i;
            link.className = "download";
            link.innerText = i + "🔽";
            link.download = txtinurl + '-' + i + '.png';
            link.href = "#";

            setTimeout(() => {
                // var dt = can.toDataURL("image/png");
                save(can.toDataURL("image/png"), i);

            }, 750);

            // as to refresh the link...
            link.onmouseleave = function () {
                save(can.toDataURL("image/png"), i);
                link.style.backgroung = 'yellow';
            };

            p.appendChild(link);

        }


    }



    /* mutation observer: */

    // Select the node that will be observed for mutations
    const wrappers = document.querySelectorAll("div.mainContainer > div.viewerContainer div.page > div.canvasWrapper");

    // Options for the observer (which mutations to observe)
    const config = { attributes: false, childList: true, subtree: false };

    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            /*     if (mutation.type === "childList") {
              console.info("A child node has been added or removed.");
            } */
            for (const addedNode of mutation.addedNodes) {
                    setTimeout(() => { addUI(addedNode); }, 750);
            }

        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    // can observe multiple targets

    function attachobserver(el) {
        observer.observe(el, config);
        if (el.querySelector("canvas.content") != null) {
            addUI(el.querySelector("canvas.content"));
        }
    }
    wrappers.forEach(attachobserver);

    // and process already loaded wrappers





    // Later, you can stop observing
    // observer.disconnect();

})();
