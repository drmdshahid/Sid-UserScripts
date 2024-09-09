// ==UserScript==
// @name         RFA MRCOG tutorials
// @namespace    https://github.com/drmdshahid
// @version      1.8
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


// cosmetics and print view config
    var style = document.createElement("style");
    document.head.appendChild(style);
    style.sheet.insertRule(".toolbar { background: radial-gradient(#004967, transparent); }");
    style.sheet.insertRule("a.download { background: beige; }");
    style.sheet.insertRule("@media print { body { visibility: hidden; }  #to-print {  visibility: visible; } }");
    style.sheet.insertRule("#to-print { position: absolute; max-width: 10%; max-height: 90%; top: 10px; left: 5; overflow: scroll; z-index: 1; border-style: inset; } "); //new
    style.sheet.insertRule("#to-print img { max-width: 95%; border-style: outset;} "); //new


    var txtinurl = document.URL.split("/")[4]; // this is safe file name.
    var pagelist = document.querySelectorAll("div.mainContainer div.pageViewer > div.shadowOffset");


    // simple check for pages
    var totalpgs = document.querySelector("div.mainContainer > div.toolbar > div > div.pageNavigationToolbarContainer > div > div > span").innerHTML;

    if (pagelist.length == totalpgs) {
        console.clear();
        console.info("pages count match");
    }

    // mark them with costum attribute and create a container for all images.
    var container = document.createElement("div");
    container.id = "to-print";
    //container.innerHTML = "SHAHID";
    document.body.appendChild(container);

    for (let i of pagelist.entries()) {
        i[1].setAttribute("data-pgn", i[0]);
        const myImage = new Image(780); // based on 210mm x 297mm with 96dpi = 794,1123
        myImage.id = "i" + i[0];
        myImage.alt = i[0] + 1;
        // myImage.style.borderStyle = "outset" // to be able to see missing pages.  //new
        container.appendChild(myImage);

    }

// create another link for total html download that copies form the container upon mouseleave.
    var a = document.querySelector("div.mainContainer > div.toolbar div.viewerToolbarContainer").appendChild(document.createElement("a"));
    a.innerText = 'html⏬'
    a.download = txtinurl + ".html";
    a.href = "data:text/html,";
    a.onmouseleave = function () {
        a.href = "data:text/html," + document.getElementById("to-print").innerHTML;
        a.style.background = 'yellow';
    };


    // recolor function. remove the blue!!
    function recolorImage(canva){
        var newRed=255, newGreen=255, newBlue=255;
        var context = canva.getContext("2d");

        var imageData = context.getImageData(0, 0, canva.width, canva.height);
        var s = 10*4;
        var oldRed=imageData.data[s], oldGreen=imageData.data[s+1], oldBlue=imageData.data[s+2];


        // examine every pixel, 
        // change any old rgb to the new-rgb
        for (var i=0;i<imageData.data.length;i+=4)
          {
              if(i<10) console.log(imageData.data[i], imageData.data[i+1], imageData.data[i+2], imageData.data[i+3]);
              // is this pixel the old rgb?
              if(Math.abs(imageData.data[i]-oldRed) < 10 &&
              Math.abs(imageData.data[i+1]-oldGreen) < 10 &&
                Math.abs(imageData.data[i+2]-oldBlue) < 10
              ){
                  // change to your new rgb
                  imageData.data[i]=newRed;
                  imageData.data[i+1]=newGreen;
                  imageData.data[i+2]=newBlue;
                  //imageData.data[i+3]=255;
              }
          }
        // put the altered data back on the canvas  
        context.putImageData(imageData,0,0);
    }

    // save

    function save(dt, i) {
        var anch = document.querySelector("#a" + i);
        anch.innerText += dt.substr(5, 25);
        if (dt.split(",")[0] == "data:image/png;base64") {
            // verification...
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

        // modify the canvas here
        //recolorImage(can);

        // add individual links and then save to container

        if (p.querySelector("a.download") == null) {
            var link = document.createElement('a');
            link.id = "a" + i;
            link.className = "download";
            link.innerText = i + "🔽";
            link.download = txtinurl + '-' + i + '.png';
            link.href = "#";
            p.appendChild(link);

            setTimeout(() => {
                // var dt = can.toDataURL("image/png");
                save(can.toDataURL("image/png"), i);

            }, 750);

            // as to refresh the link...
            link.onmouseleave = function () {
                save(can.toDataURL("image/png"), i);
                link.style.background = 'yellow';
            };
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


    // autoscroll
    function autoscroll(timedelay=500,scrollHeight=100,start=0) {
        var scrollId;
        var bottom = document.body.scrollHeight -window.screen.height -scrollHeight;
        document.documentElement.style.scrollBehavior = "auto";
        document.documentElement.scrollTop = start; 
        //document.documentElement.scrollIntoView();
        document.documentElement.style.scrollBehavior = "smooth";
        scrollId = setInterval(function () {
            if (window.scrollY <= bottom) {
                window.scrollBy(0, scrollHeight);
            }
            else {
                clearInterval(scrollId);
                console.log("scroll ended");
            }
            
        }, timedelay);           
    }
    setTimeout(autoscroll,500);



    // Later, you can stop observing
    // observer.disconnect();

})();
