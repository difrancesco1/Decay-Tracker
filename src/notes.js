        
 //DONE
     // change font for modal header
    // style button

// EASIEST:
    // style buttons (other one)
    // Set up cards for "user" and "pass" and add <a> or btn to save to clip board along with a msg displaying the function happening
    // add pulse effect for ellipsis if a user/pass is not stored
    // Use viewport (responsive) styling to conditionally set an ign's font-size
    // import all ranked borders and assign per rank so its not just masters for some reason
    // late game new background img 


// MEDIUM TIME TO COMPLETE: 
    // responsive for mobile
    // Fix the modal pop up when there is no existing data
    // import all ranked borders and assign per rank so its not just masters for some reason
    // Use the "leagyeApiMatchId" to retrieve the matchId's (20) then store only the result and champion 
    // Use "https://ddragon.leagueoflegends.com/cdn/14.17.1/data/en_US/champion.json" to get the champion ICON and send to App.js :] ALong with W/L to conditionally style the W/L section 


//Hardest? requires data too?idk
    // DECAY FORMULA




// DECAY FUNCTIONALITY

//11:44pm PST ladder reset 

//decay_games = decay games left when last updated
//decay_day = last day when decay game was updated

//count how many times 11:44 has past since decay game was updated and subtract from decay_games
//go through match history of 14 games, check how many games someone has played since decay_day 
//add amount to decay_games 
//if decay_games > 14, set to 14
//set new decay_day to today

const start = Date.now();
doSomeLongRunningProcess();
console.log(`Time elapsed: ${Date.now() - start} ms`);

//specific for each account
//when they update their decay games start timer


// margin equal for top and bottom based off the user/pass and top of ranked border
// 