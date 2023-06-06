// ==UserScript==
// @name         TestOut-AutoLogin
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically logs into testout on detecting the login page
// @author       Dainen Dunn
// @match        https://labsimapp.testout.com/v6_0_552/index.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=testout.com
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require      http://crypto.stanford.edu/sjcl/sjcl.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(async function() {
    'use strict';

    var encKey = GM_getValue ("encKey", "");
    var usr = GM_getValue ("lognUsr", "");
    var pword = GM_getValue ("lognPwd", "");

    function decodeOrPrompt (targVar, userPrompt, setValVarName) {
        if (targVar) {
            targVar = unStoreAndDecrypt (targVar);
        }
        else {
            targVar = prompt (
                userPrompt + ' not set for ' + location.hostname + '. Please enter it now:',
                ''
            );
            GM_setValue (setValVarName, encryptAndStore (targVar) );
        }
        return targVar;
    }

    function encryptAndStore (clearText) {
        return JSON.stringify (sjcl.encrypt (encKey, clearText) );
    }

    function unStoreAndDecrypt (jsonObj) {
        return sjcl.decrypt (encKey, JSON.parse (jsonObj) );
    }

    //-- Add menu commands that will allow U and P to be changed.
    GM_registerMenuCommand ("Change Username", changeUsername);
    GM_registerMenuCommand ("Change Password", changePassword);

    function changeUsername () {
        promptAndChangeStoredValue (usr, "TestOut Username", "lognUsr");
    }

    function changePassword () {
        promptAndChangeStoredValue (pword, "TestOut Password", "lognPwd");
    }

    function promptAndChangeStoredValue (targVar, userPrompt, setValVarName) {
        targVar = prompt (
            'Change ' + userPrompt + ' for ' + location.hostname + ':',
            targVar
        );
        GM_setValue (setValVarName, encryptAndStore (targVar) );
    }

    window.addEventListener('load', async function() {
        function delay(time) {
            return new Promise(resolve => setTimeout(resolve, time));
        }
        if (!encKey)
        {
            encKey = prompt (
                'Script key not set for ' + location.hostname + '. Please enter a random string:',
                ''
            );
            GM_setValue ("encKey", encKey);

            usr = pword = ""; // New key makes prev stored values (if any) unable to decode.
        }
        usr = decodeOrPrompt (usr, "TestOut Username", "lognUsr");
        pword = decodeOrPrompt (pword, "TestOut Password", "lognPwd");

        if (window.location.href == "https://w3.testout.com/login-sliders?culture=en-us" || window.location.href == "https://labsimapp.testout.com/v6_0_552/index.html")
        {
            console.log("Am on Testout login page");

            const spanBoxes = document.getElementsByTagName("input");

            if (spanBoxes.length > 0)
            {
                spanBoxes[0].click();

                var valueSetter = Object.getOwnPropertyDescriptor(spanBoxes[0], 'value').set;
                var prototype = Object.getPrototypeOf(spanBoxes[0]);
                var prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                if (valueSetter && valueSetter !== prototypeValueSetter) {
                    prototypeValueSetter.call(spanBoxes[0], usr);
                } else {
                    valueSetter.call(spanBoxes[0], usr);
                }
                spanBoxes[0].dispatchEvent(new Event('input', { bubbles: true }));


                spanBoxes[1].click();

                valueSetter = Object.getOwnPropertyDescriptor(spanBoxes[1], 'value').set;
                prototype = Object.getPrototypeOf(spanBoxes[1]);
                prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                if (valueSetter && valueSetter !== prototypeValueSetter) {
                    prototypeValueSetter.call(spanBoxes[1], pword);
                } else {
                    valueSetter.call(spanBoxes[1], pword);
                }
                spanBoxes[1].dispatchEvent(new Event('input', { bubbles: true }));
                var buttons = document.getElementsByTagName("button");
                buttons[1].click();

                await delay(1500);

                buttons = document.getElementsByTagName("button");
                //console.log(buttons);
                var foundBtn = false;
                for (var i = 0; i < buttons.length; i++)
                {
                    if (buttons[i].innerText == "TestOut PC Pro")
                    {
                        buttons[i].click();
                        console.log(buttons[i]);
                        foundBtn = true;
                        break;
                    }
                }

                if (foundBtn == true)
                {
                    console.log("Found the button to go to the course!");
                }
                else
                {
                    console.log("Did not find the button to go to the course!");
                }
            }
        }
    });
})();
