// Copyright 2014 Martin Hawksey. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*
* This code uses the following libraries:
*    * MlOtXVYZDtB6iTu3Tp0rKBH797_hv7HHb - TAGS (interacts with sheet and TwtrService library)
*    * MarIlVOhstkJA6QjPgCWAHIq9hSqx7jwh - TwtrService (a Twitter library for Google Apps Script)
*/

var VERSION = "6.0ns";
TAGS.setTwtrService(TwtrService);

/**
* Performs the data collection and write
*/
function getTweets(){
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var advParams = {};
    //var advParams = {"geocode": "40.714353,-74.005973,30mi"};
    TAGS.collectTweets(doc, advParams);
}

/**
* On open sheet
*/
function onOpen() {  
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var menuItems = TAGS.setMenu();
  menuItems.push(null); // line separator
  menuItems.push({name: getTriggerStatus_(), functionName: "toggleTrigger_"});
  doc.addMenu("TAGS", menuItems);
  
  // set latest archive types
  TAGS.setArchiveTypesList(doc);
}

/**
* Test rates available from Twitter
*/
function testRate(){
  TAGS.testRate();
}

/**
* Wipes the archive sheet apart from header row
*/
function wipeArchive(){
  var result = Browser.msgBox("Warning!", 
                              "You are about to wipe the Archive sheet\\n\\nDo you want to continue?", 
                              Browser.Buttons.YES_NO);
  // Process the user's response.
  if (result == 'yes') {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName("Archive");
     sheet.deleteRows(2, sheet.getLastRow()-1);
  } 
}

/**
* Launches key/secret and auth flow
*/
function setup() {
  if (TwtrService.isUserConnectedToTwitter()){
   var result = Browser.msgBox("Twitter Authorisation", 
                   "You appear to already be connected to Twitter.\\n\\nWould you like to run the setup again?", 
                   Browser.Buttons.YES_NO);
    // Process the user's response.
    if (result == 'yes') {
      // User clicked "Yes".
      TwtrService.showTwitterKeySecret(SpreadsheetApp);
    } 
  } else {
    TwtrService.showTwitterKeySecret(SpreadsheetApp);
  }
}

/**
* Used as part of setup() to process form data
*/
function processForm(formObject) {
  TwtrService.setUserKeySecret(formObject);
  TwtrService.showTwitterLogin(SpreadsheetApp);
}

/**
* Add summary sheet to current spreadsheet
*/
function addSummarySheet() {
  TAGS.addSheet(SpreadsheetApp.getActiveSpreadsheet(), "Summary", VERSION);
}

/**
* Add summary sheet to current spreadsheet
*/
function addDashboardSheet() {
  TAGS.addSheet(SpreadsheetApp.getActiveSpreadsheet(), "Dashboard", VERSION);
}

/**
* Removes all user data from TwtrService
*/
function disconnectTwitter() {
  var result = Browser.msgBox("Warning!", 
                                "Disconnecting Twitter will remove the connection for all of your TAGS sheets.\\n\\nDo you still want to continue?", 
                                Browser.Buttons.YES_NO);
  // Process the user's response.
  if (result == 'yes') {
    TwtrService.disconnectTwitter();
  }
}

function setDefaultFolder(){
  TAGS.setDefaultFolder();
}

/**
* Deletes duplicates from the archive
*/
function deleteDuplicates(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Archive");
  TAGS.deleteDuplicates(sheet);
}

/**
 * Toggles the script trigger to refresh archive 
 */
function toggleTrigger_(){
  if (getTriggerID_() == "none"  || getTriggerID_() == null){ // add trigger
    var dailyTrigger = ScriptApp.newTrigger("getTweets")
        .timeBased()
        .everyHours(1)
        .create();
    setTriggerID_(dailyTrigger.getUniqueId());
    onOpen();
  } else {
    var triggers = ScriptApp.getScriptTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getUniqueId() == getTriggerID_()){
        ScriptApp.deleteTrigger(triggers[i]);
        setTriggerID_("none");
        onOpen();
        break;
      }
    }
  }
}

/**
 * Gets trigger menu option text
 * @return {String} Stats text for menu.
 */
function getTriggerStatus_(){
  if (getTriggerID_() == "none" || getTriggerID_() == null) return "Update archive every hour";
  return "Stop updating archive every hour"
}

/**
 * @param {String} set a trigger id.
 */
function setTriggerID_(id){
  PropertiesService.getScriptProperties().setProperty("triggerID", id);
}

/**
 * @return {String} get a trigger id.
 */
function getTriggerID_(){
  return PropertiesService.getScriptProperties().getProperty("triggerID");
}

/**
* Get the url for GA-Beacon tracking
*/
function getGABeacon(tid){
  var id = SpreadsheetApp.getActiveSpreadsheet().getId();
  var locale = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale();
  return 'https://ga-beacon.appspot.com/'+tid+'/TAGS/'+VERSION+'/'+id+'/'+locale;
}

/**
* Gets the spreadsheet id for TAGSExplorer
*/
function getSheetKey(dummy){
  return SpreadsheetApp.getActiveSpreadsheet().getId();
}

function getSheetGID(optSheetName) { 
  var sheetName = optSheetName || "Archive";
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).getSheetId();
}

/**
* Gets a filtered list of RTs (used in Dashboard sheet)
*/
function filterUnique(tweets){
  return TAGS.filterUnique(tweets);
}